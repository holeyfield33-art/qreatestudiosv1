export interface PrintProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  sizes: Array<{
    name: string;
    width: number;
    height: number;
    priceMultiplier: number;
  }>;
  materials: Array<{
    name: string;
    description: string;
    priceMultiplier: number;
  }>;
  minQuantity: number;
  maxQuantity: number;
}

export const PRINT_PRODUCTS: Record<string, PrintProduct> = {
  sticker: {
    id: 'sticker',
    name: 'QR Code Sticker',
    description: 'Weatherproof vinyl stickers',
    basePrice: 2.99,
    sizes: [
      { name: '2" x 2"', width: 2, height: 2, priceMultiplier: 1 },
      { name: '3" x 3"', width: 3, height: 3, priceMultiplier: 1.5 },
      { name: '4" x 4"', width: 4, height: 4, priceMultiplier: 2 },
      { name: '6" x 6"', width: 6, height: 6, priceMultiplier: 3 },
    ],
    materials: [
      { name: 'Glossy Vinyl', description: 'Weather resistant', priceMultiplier: 1 },
      { name: 'Matte Vinyl', description: 'No glare', priceMultiplier: 1.2 },
      { name: 'Holographic', description: 'Eye-catching shine', priceMultiplier: 2 },
    ],
    minQuantity: 1,
    maxQuantity: 1000,
  },
  standee: {
    id: 'standee',
    name: 'Table Standee',
    description: 'Acrylic table display with QR code',
    basePrice: 19.99,
    sizes: [
      { name: '4" x 6"', width: 4, height: 6, priceMultiplier: 1 },
      { name: '5" x 7"', width: 5, height: 7, priceMultiplier: 1.5 },
      { name: '8" x 10"', width: 8, height: 10, priceMultiplier: 2.5 },
    ],
    materials: [
      { name: 'Clear Acrylic', description: '3mm thick', priceMultiplier: 1 },
      { name: 'Frosted Acrylic', description: '3mm thick', priceMultiplier: 1.3 },
      { name: 'Black Acrylic', description: '3mm thick', priceMultiplier: 1.2 },
    ],
    minQuantity: 1,
    maxQuantity: 50,
  },
  card: {
    id: 'card',
    name: 'Business Cards with QR',
    description: 'Premium business cards with embedded QR code',
    basePrice: 29.99,
    sizes: [
      { name: 'Standard (3.5" x 2")', width: 3.5, height: 2, priceMultiplier: 1 },
      { name: 'Mini (2" x 2")', width: 2, height: 2, priceMultiplier: 0.8 },
    ],
    materials: [
      { name: '14pt Cardstock', description: 'Standard weight', priceMultiplier: 1 },
      { name: '16pt Cardstock', description: 'Premium weight', priceMultiplier: 1.3 },
      { name: 'Silk Laminated', description: 'Soft touch finish', priceMultiplier: 1.8 },
    ],
    minQuantity: 50,
    maxQuantity: 1000,
  },
  poster: {
    id: 'poster',
    name: 'QR Code Poster',
    description: 'Large format poster with QR code',
    basePrice: 14.99,
    sizes: [
      { name: '11" x 17"', width: 11, height: 17, priceMultiplier: 1 },
      { name: '18" x 24"', width: 18, height: 24, priceMultiplier: 2 },
      { name: '24" x 36"', width: 24, height: 36, priceMultiplier: 3 },
    ],
    materials: [
      { name: 'Poster Paper', description: 'Standard', priceMultiplier: 1 },
      { name: 'Glossy Photo Paper', description: 'High quality', priceMultiplier: 1.5 },
      { name: 'Canvas', description: 'Gallery wrap', priceMultiplier: 3 },
    ],
    minQuantity: 1,
    maxQuantity: 100,
  },
};

/**
 * Calculate total price for a print order
 */
export function calculatePrintPrice(
  productType: string,
  quantity: number,
  specifications: any
): number {
  const product = PRINT_PRODUCTS[productType];
  if (!product) return 0;

  const size = product.sizes.find((s) => s.name === specifications.size);
  const material = product.materials.find((m) => m.name === specifications.material);

  if (!size || !material) return 0;

  const unitPrice = product.basePrice * size.priceMultiplier * material.priceMultiplier;
  
  // Volume discounts
  let discount = 1;
  if (quantity >= 100) discount = 0.8; // 20% off
  else if (quantity >= 50) discount = 0.9; // 10% off
  else if (quantity >= 10) discount = 0.95; // 5% off

  return Math.round(unitPrice * quantity * discount * 100) / 100;
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}
