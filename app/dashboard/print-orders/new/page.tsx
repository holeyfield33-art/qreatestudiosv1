'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Check, CreditCard, Package, Truck, ShoppingCart, Smartphone, Sticker, Triangle, FileText, ContactCard } from 'lucide-react';
import Image from 'next/image';

const PRINT_PRODUCTS = [
  {
    id: 'nfc-cards',
    name: 'NFC Cards',
    description: 'Tap-to-share smart business cards',
    basePrice: 4.99,
    unit: 'card',
    minQty: 25,
    icon: Smartphone,
    features: ['Waterproof', 'Durable PVC', 'Works with any phone', 'Instant tap activation'],
    sizes: ['Standard (3.5" x 2")'],
  },
  {
    id: 'qr-stickers',
    name: 'QR Code Stickers',
    description: 'Weatherproof vinyl stickers',
    basePrice: 24.99,
    unit: 'per 100',
    minQty: 100,
    icon: Sticker,
    features: ['Waterproof vinyl', 'UV resistant', 'Strong adhesive', 'Indoor/outdoor use'],
    sizes: ['Small (2" x 2")', 'Medium (3" x 3")', 'Large (4" x 4")'],
  },
  {
    id: 'table-tents',
    name: 'Table Tents',
    description: 'Folded table displays with QR',
    basePrice: 39.99,
    unit: 'per 50',
    minQty: 50,
    icon: Triangle,
    features: ['Self-standing', 'Durable cardstock', 'Easy assembly', 'Professional look'],
    sizes: ['Standard (4" x 6")'],
  },
  {
    id: 'flyers',
    name: 'Flyers',
    description: 'Full-color promotional flyers',
    basePrice: 49.99,
    unit: 'per 500',
    minQty: 500,
    icon: FileText,
    features: ['Full color', 'Glossy finish', 'Premium paper', 'Professional printing'],
    sizes: ['Standard (8.5" x 11")', 'Postcard (6" x 4")'],
  },
  {
    id: 'business-cards',
    name: 'Business Cards',
    description: 'Premium cards with QR code',
    basePrice: 29.99,
    unit: 'per 250',
    minQty: 250,
    icon: ContactCard,
    features: ['Premium cardstock', 'Matte or glossy', 'Double-sided', 'QR code included'],
    sizes: ['Standard (3.5" x 2")', 'Square (2.5" x 2.5")'],
  },
];

export default function NewPrintOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrId = searchParams.get('qrId');
  const pageId = searchParams.get('pageId');
  const qrCodeId = searchParams.get('qrCodeId');
  const landingPageId = searchParams.get('landingPageId');

  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [qrData, setQrData] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load QR code or landing page data
  useEffect(() => {
    async function loadData() {
      const id = qrId || qrCodeId;
      if (id) {
        try {
          const res = await fetch(`/api/qr-codes/${id}`);
          const data = await res.json();
          if (data.success) {
            setQrData(data.qrCode);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to load QR data:', error);
          }
        }
      }

      const lpId = pageId || landingPageId;
      if (lpId) {
        try {
          const res = await fetch(`/api/landing-pages/${lpId}`);
          const data = await res.json();
          if (data.success) {
            setPageData(data.landingPage);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to load page data:', error);
          }
        }
      }
    }

    loadData();
  }, [qrId, qrCodeId, pageId, landingPageId]);

  function handleProductSelect(productId: string) {
    setSelectedProduct(productId);
    const product = PRINT_PRODUCTS.find(p => p.id === productId);
    if (product) {
      setQuantity(product.minQty);
      setSelectedSize(product.sizes[0]);
      setStep(2);
    }
  }

  function calculateTotal() {
    const product = PRINT_PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return 0;
    return (product.basePrice * quantity).toFixed(2);
  }

  async function handleCheckout() {
    const product = PRINT_PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return;

    setLoading(true);
    try {
      // Create print order
      const res = await fetch('/api/print/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          quantity,
          size: selectedSize,
          price: calculateTotal(),
          qrCodeId: qrId || qrCodeId || null,
          landingPageId: pageId || landingPageId || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Order placed! Check your email for confirmation.');
        router.push('/dashboard/orders');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Checkout error:', error);
      }
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectedProductData = PRINT_PRODUCTS.find(p => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-bold mb-2">Order Print Materials</h1>
          <p className="text-muted-foreground">
            Get professional physical products for your {qrData ? 'QR code' : pageData ? 'landing page' : 'content'}
          </p>
        </div>

        {/* Connected Asset Banner */}
        {(qrData || pageData) && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  {qrData && `QR Code: ${qrData.name}`}
                  {pageData && `Landing Page: ${pageData.title}`}
                </p>
                <p className="text-sm text-blue-700">
                  Your prints will include this content
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium hidden sm:inline">Choose Product</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="font-medium hidden sm:inline">Customize</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium hidden sm:inline">Checkout</span>
          </div>
        </div>

        {/* Step 1: Product Selection */}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINT_PRODUCTS.map(product => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
                onClick={() => handleProductSelect(product.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <product.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      from ${product.basePrice}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      Min. {product.minQty} {product.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Customize Order */}
        {step === 2 && selectedProductData && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Product Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <selectedProductData.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{selectedProductData.name}</CardTitle>
                    <CardDescription>{selectedProductData.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Features:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProductData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                {selectedProductData.sizes.length > 1 && (
                  <div>
                    <Label className="mb-2 block font-semibold">Size:</Label>
                    <div className="space-y-2">
                      {selectedProductData.sizes.map(size => (
                        <div
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedSize === size
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium">{size}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity" className="mb-2 block font-semibold">
                    Quantity:
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(selectedProductData.minQty, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(selectedProductData.minQty, parseInt(e.target.value) || selectedProductData.minQty))}
                      className="text-center text-lg font-semibold w-24"
                      min={selectedProductData.minQty}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      {selectedProductData.unit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Minimum order: {selectedProductData.minQty}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right: Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Line Items */}
                  <div className="space-y-3 pb-4 border-b">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium">{selectedProductData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">{selectedSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">
                        {quantity} {selectedProductData.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit Price</span>
                      <span className="font-medium">${selectedProductData.basePrice}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-xl font-bold pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">${calculateTotal()}</span>
                  </div>

                  {/* Shipping Info */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-900">
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">Free shipping on orders over $50</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setStep(3)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Continue to Checkout
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Choose Different Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Checkout */}
        {step === 3 && selectedProductData && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Ready to Order</CardTitle>
                <CardDescription>
                  Review your order and complete checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Details */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <selectedProductData.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedProductData.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {quantity} {selectedProductData.unit} • {selectedSize}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">${calculateTotal()}</span>
                  </div>
                </div>

                {/* What's Included */}
                <div className="space-y-2">
                  <h3 className="font-semibold">What's Included:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Professional printing & design</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Your QR code or landing page URL included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Fast shipping (3-5 business days)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>100% satisfaction guarantee</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place Order - $${calculateTotal()}`}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Customize
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our terms of service
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
