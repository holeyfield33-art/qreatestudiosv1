'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Upload,
  Check,
  ExternalLink,
  Truck,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  NFC_PRODUCTS,
  type NFCProduct,
  type NFCOrderItem,
  formatPrice,
  calculateOrderTotal,
} from '@/lib/types/nfc-products';

interface CartItem extends NFCOrderItem {
  product: NFCProduct;
}

export default function OrderNFCPage() {
  const router = useRouter();
  const params = useParams();
  const qrId = params.id as string;

  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [uploadingDesign, setUploadingDesign] = useState<string | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, [qrId]);

  async function fetchQRCode() {
    try {
      const res = await fetch(`/api/qr/${qrId}`);
      const data = await res.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
      } else {
        toast.error('QR code not found');
        router.push('/dashboard/qr-codes');
      }
    } catch (error) {
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (product: NFCProduct, quantity: number = 1) => {
    const existing = cart.find(item => item.productId === product.id);
    
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        quantity: product.minQuantity || quantity,
        product,
      }]);
    }
    
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.success('Removed from cart');
  };

  const handleFileUpload = async (productId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB.');
      return;
    }

    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
      toast.error('Invalid file type. Use PNG, JPG, or PDF.');
      return;
    }

    setUploadingDesign(productId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'nfc-design');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();

      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, designFileUrl: data.url }
          : item
      ));

      toast.success('Design uploaded!');
    } catch (error) {
      toast.error('Failed to upload design');
    } finally {
      setUploadingDesign(null);
    }
  };

  const proceedToCheckout = async () => {
    if (cart.length === 0) return;

    // Check if custom products have designs
    const missingDesigns = cart.filter(
      item => item.product.requiresDesign && !item.designFileUrl
    );

    if (missingDesigns.length > 0) {
      toast.error('Please upload designs for custom products');
      return;
    }

    setProcessingCheckout(true);

    try {
      const res = await fetch('/api/orders/nfc/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: qrId,
          items: cart.map(({ productId, quantity, designFileUrl }) => ({
            productId,
            quantity,
            designFileUrl,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      setProcessingCheckout(false);
    }
  };

  const { subtotal, shipping, total } = calculateOrderTotal(
    cart.map(({ productId, quantity }) => ({ productId, quantity }))
  );

  const shortUrl = qrCode ? `${window.location.origin}/${qrCode.shortCode}` : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">QR Code not found</p>
        <Link href="/dashboard/qr-codes">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to QR Codes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">
            Order NFC Products for: {qrCode.name}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            These will be encoded with:
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {shortUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(shortUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </p>
        </div>

        {/* Trust Indicators */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">Fast Encoding</div>
                <div className="text-xs text-muted-foreground">Ships in 2 business days</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-sm">Quality Guaranteed</div>
                <div className="text-xs text-muted-foreground">Premium NTAG216 chips</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold text-sm">Free Shipping</div>
                <div className="text-xs text-muted-foreground">On orders $15+</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Select Products</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {NFC_PRODUCTS.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.minQuantity && (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        Bulk Pricing
                      </Badge>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>

                    {/* Features */}
                    {product.features && (
                      <ul className="text-xs space-y-1">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                            <Check className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </div>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={cart.some(item => item.productId === product.id)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {cart.some(item => item.productId === product.id) ? 'In Cart' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart
              </h3>

              {cart.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="space-y-3 pb-4 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(item.product.price)} each
                            </div>
                          </div>
                          <div className="font-semibold">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min={item.product.minQuantity || 1}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Design Upload for Custom Products */}
                        {item.product.requiresDesign && (
                          <div className="space-y-2">
                            <Label className="text-xs">Upload Design</Label>
                            {item.designFileUrl ? (
                              <div className="flex items-center gap-2 text-xs text-green-600">
                                <Check className="h-4 w-4" />
                                Design uploaded
                              </div>
                            ) : (
                              <div>
                                <Input
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(item.productId, file);
                                  }}
                                  disabled={uploadingDesign === item.productId}
                                  className="text-xs"
                                />
                                <a
                                  href="/design-guidelines"
                                  target="_blank"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View design guidelines
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        Shipping
                        {shipping === 0 && (
                          <Badge variant="secondary" className="text-xs">FREE</Badge>
                        )}
                      </span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={proceedToCheckout}
                    disabled={cart.length === 0 || processingCheckout}
                    className="w-full"
                    size="lg"
                  >
                    {processingCheckout ? (
                      <>Processing...</>
                    ) : (
                      <>Proceed to Checkout</>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Secure checkout powered by Stripe
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
