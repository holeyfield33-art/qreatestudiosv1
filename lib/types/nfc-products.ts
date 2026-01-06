export interface NFCProduct {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  image: string;
  type: 'card' | 'card-custom' | 'sticker';
  requiresDesign?: boolean;
  minQuantity?: number;
  features?: string[];
}

export const NFC_PRODUCTS: NFCProduct[] = [
  {
    id: 'nfc-card-blank',
    name: 'NFC Business Card (Blank White)',
    description: 'White PVC card with NTAG216 chip. We encode with your QR link.',
    price: 499, // $4.99
    image: 'https://placehold.co/400x400/4f46e5/ffffff?text=NFC+Card',
    type: 'card',
    features: [
      'Premium PVC material',
      'NTAG216 chip (888 bytes)',
      'Pre-encoded with your QR',
      'Tap & Go technology',
      'Ships in 2 business days',
    ],
  },
  {
    id: 'nfc-card-custom-sticker',
    name: 'NFC Card + Custom Sticker Overlay',
    description: 'Blank card with your custom-designed sticker on top.',
    price: 699, // $6.99
    image: 'https://placehold.co/400x400/4f46e5/ffffff?text=Custom+NFC',
    type: 'card-custom',
    requiresDesign: true,
    features: [
      'Custom branded design',
      'High-quality sticker overlay',
      'Professional finish',
      'NTAG216 chip included',
      'Perfect for businesses',
    ],
  },
  {
    id: 'nfc-stickers-10',
    name: 'NFC Stickers - 10 Pack',
    description: 'Small adhesive NFC tags perfect for products, posters, tables.',
    price: 1499, // $14.99
    image: 'https://placehold.co/400x400/10b981/ffffff?text=10+Pack',
    type: 'sticker',
    features: [
      '30mm diameter stickers',
      'Strong 3M adhesive',
      'Weather resistant',
      'Works on any surface',
      'Great for product tags',
    ],
  },
  {
    id: 'nfc-stickers-50',
    name: 'NFC Stickers - 50 Pack',
    description: 'Bulk pricing for businesses. Save 30%!',
    price: 5999, // $59.99
    image: 'https://placehold.co/400x400/10b981/ffffff?text=50+Pack',
    type: 'sticker',
    minQuantity: 50,
    features: [
      '30% savings vs 10-pack',
      'Perfect for businesses',
      'Bulk fulfillment',
      'Priority processing',
      'Free shipping included',
    ],
  },
];

export interface NFCOrderItem {
  productId: string;
  quantity: number;
  designFileUrl?: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface NFCOrder {
  id: string;
  userId: string;
  qrCodeId: string;
  type: 'nfc';
  items: NFCOrderItem[];
  encodeUrl: string;
  shippingAddress: ShippingAddress;
  status: 'pending_payment' | 'paid' | 'encoding' | 'encoded' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  total: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
}

export function calculateShipping(subtotal: number): number {
  // Free shipping on orders $15 or more
  return subtotal >= 1500 ? 0 : 299; // $2.99
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getProductById(id: string): NFCProduct | undefined {
  return NFC_PRODUCTS.find(p => p.id === id);
}

export function calculateOrderTotal(items: NFCOrderItem[]): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (!product) return sum;
    return sum + (product.price * item.quantity);
  }, 0);

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}
