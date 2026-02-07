import { z } from 'zod';

/**
 * Dietary information types for menu items
 */
export const DietaryInfo = z.enum([
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'halal',
  'kosher',
  'keto',
  'paleo',
  'low-carb',
]);

export type DietaryInfoType = z.infer<typeof DietaryInfo>;

/**
 * Spice level indicators
 */
export const SpiceLevel = z.enum([
  'none',
  'mild',
  'medium',
  'hot',
  'extra-hot',
]);

export type SpiceLevelType = z.infer<typeof SpiceLevel>;

/**
 * Price variant for items with multiple size/portion options
 */
export const PriceVariantSchema = z.object({
  name: z.string().min(1).max(50), // "Small", "Large", "Half Portion"
  price: z.number().positive(),
  description: z.string().max(100).optional(),
});

export type PriceVariant = z.infer<typeof PriceVariantSchema>;

/**
 * Individual menu item schema with full dietary and allergen support
 */
export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  priceVariants: z.array(PriceVariantSchema).optional(),
  
  // Dietary and allergen information
  dietaryInfo: z.array(DietaryInfo).default([]),
  allergens: z.array(z.string()).default([]),
  spiceLevel: SpiceLevel.optional(),
  
  // Media
  image: z.object({
    url: z.string().url(),
    alt: z.string(),
    blurhash: z.string().optional(),
  }).optional(),
  
  // Status and flags
  available: z.boolean().default(true),
  soldOut: z.boolean().default(false),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  
  // Ordering
  sortOrder: z.number().int().default(0),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

/**
 * Menu category containing multiple items
 */
export const MenuCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  sortOrder: z.number().int().default(0),
  visible: z.boolean().default(true),
  items: z.array(MenuItemSchema).default([]),
  
  // Category-specific settings
  icon: z.string().optional(), // Lucide icon name
  color: z.string().optional(), // Hex color for category accent
});

export type MenuCategory = z.infer<typeof MenuCategorySchema>;

/**
 * Complete restaurant menu schema
 */
export const RestaurantMenuSchema = z.object({
  id: z.string().uuid(),
  name: z.string().default('Main Menu'),
  description: z.string().max(500).optional(),
  currency: z.string().default('USD'),
  currencySymbol: z.string().default('$'),
  categories: z.array(MenuCategorySchema).min(1),
  
  // Display settings
  settings: z.object({
    showPrices: z.boolean().default(true),
    showImages: z.boolean().default(true),
    showDietaryIcons: z.boolean().default(true),
    showAllergens: z.boolean().default(true),
    showSpiceLevel: z.boolean().default(true),
    defaultLayout: z.enum(['tabs', 'grid', 'list']).default('tabs'),
  }).optional(),
  
  // Version control
  version: z.string().default('1.0.0'),
  schemaVersion: z.string().default('1.0.0'),
  
  // Timestamps
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime(),
});

export type RestaurantMenu = z.infer<typeof RestaurantMenuSchema>;

/**
 * Dietary badge configuration for UI rendering
 */
export const DIETARY_BADGES: Record<DietaryInfoType, { icon: string; color: string; label: string }> = {
  vegetarian: { icon: 'V', color: '#16a34a', label: 'Vegetarian' },
  vegan: { icon: '🌱', color: '#22c55e', label: 'Vegan' },
  'gluten-free': { icon: 'GF', color: '#f59e0b', label: 'Gluten Free' },
  'dairy-free': { icon: 'DF', color: '#3b82f6', label: 'Dairy Free' },
  'nut-free': { icon: 'NF', color: '#8b5cf6', label: 'Nut Free' },
  halal: { icon: 'H', color: '#10b981', label: 'Halal' },
  kosher: { icon: 'K', color: '#0ea5e9', label: 'Kosher' },
  keto: { icon: 'KT', color: '#ec4899', label: 'Keto' },
  paleo: { icon: 'P', color: '#f97316', label: 'Paleo' },
  'low-carb': { icon: 'LC', color: '#06b6d4', label: 'Low Carb' },
};

/**
 * Spice level configuration for UI rendering
 */
export const SPICE_LEVELS: Record<SpiceLevelType, { emoji: string; label: string; color: string }> = {
  none: { emoji: '', label: 'Not Spicy', color: '#9ca3af' },
  mild: { emoji: '🌶️', label: 'Mild', color: '#fbbf24' },
  medium: { emoji: '🌶️🌶️', label: 'Medium', color: '#f59e0b' },
  hot: { emoji: '🌶️🌶️🌶️', label: 'Hot', color: '#f97316' },
  'extra-hot': { emoji: '🌶️🌶️🌶️🌶️', label: 'Extra Hot', color: '#dc2626' },
};

/**
 * Helper function to create a new empty menu item
 */
export function createEmptyMenuItem(_categoryId: string): Partial<MenuItem> {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    price: 0,
    available: true,
    soldOut: false,
    featured: false,
    popular: false,
    dietaryInfo: [],
    allergens: [],
    sortOrder: 0,
  };
}

/**
 * Helper function to create a new empty menu category
 */
export function createEmptyMenuCategory(): Partial<MenuCategory> {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    visible: true,
    sortOrder: 0,
    items: [],
  };
}
