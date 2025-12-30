'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PRINT_PRODUCTS, calculatePrintPrice } from '@/lib/services/print-service';

export default function PrintOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrCodeId = searchParams.get('qrCodeId');

  const [product, setProduct] = useState('sticker');
  const [quantity, setQuantity] = useState(1);
  const [specs, setSpecs] = useState<any>({});
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const form = useForm();

  useEffect(() => {
    if (product && quantity && specs.size && specs.material) {
      const calculated = calculatePrintPrice(product, quantity, specs);
      setPrice(calculated);
    }
  }, [product, quantity, specs]);

  async function onSubmit(data: any) {
    if (!qrCodeId) {
      toast.error('No QR code selected');
      return;
    }

    if (!specs.size || !specs.material) {
      toast.error('Please select size and material');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/print/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId,
          productType: product,
          quantity,
          specifications: specs,
          specialInstructions: data.specialInstructions,
          shippingAddress: {
            name: data.name,
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone,
          },
          customerEmail: data.email,
          customerPhone: data.phone,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Order placed successfully!');
        router.push(`/dashboard/print/orders/${result.order.id}`);
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const currentProduct = PRINT_PRODUCTS[product];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Order Print Products</h1>
        <p className="text-muted-foreground">
          Get your QR code printed on professional materials
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Selection */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Choose Product</h3>

          <div className="grid md:grid-cols-2 gap-4" role="radiogroup" aria-label="Product selection">
            {Object.values(PRINT_PRODUCTS).map((prod) => (
              <div
                key={prod.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-ring ${
                  product === prod.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setProduct(prod.id);
                  setSpecs({});
                }}
                role="radio"
                aria-checked={product === prod.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setProduct(prod.id);
                    setSpecs({});
                  }
                }}
              >
                <h4 className="font-semibold">{prod.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{prod.description}</p>
                <p className="text-lg font-bold">
                  From ${prod.basePrice.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Specifications */}
        {currentProduct && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Customize</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="size">
                  Size <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <select
                  id="size"
                  value={specs.size || ''}
                  onChange={(e) => setSpecs({ ...specs, size: e.target.value })}
                  aria-required="true"
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select size</option>
                  {currentProduct.sizes.map((size) => (
                    <option key={size.name} value={size.name}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="material">
                  Material <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <select
                  id="material"
                  value={specs.material || ''}
                  onChange={(e) => setSpecs({ ...specs, material: e.target.value })}
                  aria-required="true"
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select material</option>
                  {currentProduct.materials.map((mat) => (
                    <option key={mat.name} value={mat.name}>
                      {mat.name} - {mat.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={currentProduct.minQuantity}
                  max={currentProduct.maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  aria-required="true"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Min: {currentProduct.minQuantity}, Max: {currentProduct.maxQuantity}
                </p>
                {quantity >= 10 && (
                  <p className="text-xs text-green-600 mt-1" role="status">
                    🎉 Volume discount applied!
                  </p>
                )}
              </div>

              <div className="flex items-end">
                <div className="w-full p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-3xl font-bold text-green-700" aria-live="polite">
                    ${price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                {...form.register('specialInstructions')}
                placeholder="Any special requests or design notes..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </Card>
        )}

        {/* Shipping Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Shipping Information</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="name"
                {...form.register('name', { required: true })}
                placeholder="John Doe"
                aria-required="true"
                className="mt-1.5"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="street">
                Street Address <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="street"
                {...form.register('street', { required: true })}
                placeholder="123 Main St"
                aria-required="true"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="city">
                City <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="city"
                {...form.register('city', { required: true })}
                aria-required="true"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="state">
                State <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="state"
                {...form.register('state', { required: true })}
                placeholder="CA"
                aria-required="true"
                maxLength={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="zip">
                ZIP Code <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="zip"
                {...form.register('zip', { required: true })}
                placeholder="90210"
                aria-required="true"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone">
                Phone <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone', { required: true })}
                placeholder="(555) 123-4567"
                aria-required="true"
                className="mt-1.5"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email">
                Email <span className="text-red-500" aria-label="required">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email', { required: true })}
                placeholder="john@example.com"
                aria-required="true"
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={loading || price === 0}
            className="min-h-[44px]"
          >
            {loading ? 'Placing Order...' : `Place Order - $${price.toFixed(2)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
