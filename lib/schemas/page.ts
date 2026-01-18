import { z } from 'zod';

/**
 * SEO metadata schema for landing pages
 */
export const SEOSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  ogType: z.string().default('website'),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional(),
});

export type SEOMetadata = z.infer<typeof SEOSchema>;

/**
 * Page status enum
 */
export const PageStatus = z.enum(['draft', 'published', 'archived']);
export type PageStatusType = z.infer<typeof PageStatus>;

/**
 * Section base schema - all sections extend this
 */
export const SectionBaseSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  order: z.number().int(),
  visible: z.boolean().default(true),
  props: z.record(z.string(), z.unknown()),
});

export type SectionBase = z.infer<typeof SectionBaseSchema>;

/**
 * Page metadata
 */
export const PageMetaSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  seo: SEOSchema.optional(),
  status: PageStatus.default('draft'),
  publishedAt: z.string().datetime().optional(),
  locale: z.string().default('en-US'),
});

export type PageMeta = z.infer<typeof PageMetaSchema>;

/**
 * Complete page schema (Puck format)
 */
export const PageSchema = z.object({
  schemaVersion: z.string().default('1.0.0'),
  meta: PageMetaSchema,
  content: z.array(SectionBaseSchema),
  root: z.object({
    props: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
});

export type Page = z.infer<typeof PageSchema>;

/**
 * Template schema with default sections
 */
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  category: z.string(),
  description: z.string().max(500).optional(),
  isPremium: z.boolean().default(false),
  thumbnail: z.string().url().optional(),
  defaultSections: z.array(SectionBaseSchema),
  defaultStyles: z.object({
    colorScheme: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      background: z.string(),
      text: z.string(),
    }).optional(),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }).optional(),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Template = z.infer<typeof TemplateSchema>;

/**
 * Puck data structure (what Puck stores)
 */
export const PuckDataSchema = z.object({
  content: z.array(z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
  })),
  root: z.object({
    props: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
  zones: z.record(z.string(), z.array(z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
  }))).optional(),
});

export type PuckData = z.infer<typeof PuckDataSchema>;

/**
 * Image metadata schema
 */
export const ImageMetadataSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  blurhash: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  aspectRatio: z.string().optional(), // e.g., "16/9", "4/3"
  category: z.enum(['food', 'restaurant', 'person', 'default']).optional(),
});

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;

/**
 * Color scheme schema
 */
export const ColorSchemeSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

/**
 * Schema version migrations
 */
export type Migration = {
  from: string;
  to: string;
  migrate: (doc: Record<string, unknown>) => Record<string, unknown>;
};

/**
 * Migration registry for page schema versions
 */
export const PAGE_MIGRATIONS: Migration[] = [
  {
    from: '1.0.0',
    to: '1.1.0',
    migrate: (doc) => ({
      ...doc,
      schemaVersion: '1.1.0',
      meta: {
        ...(typeof doc.meta === 'object' && doc.meta !== null ? doc.meta : {}),
        locale: (typeof doc.meta === 'object' && doc.meta !== null && 'locale' in doc.meta
          ? doc.meta.locale
          : 'en-US'),
      },
    }),
  },
];

/**
 * Apply migrations to bring schema to latest version
 */
export function migratePageSchema(doc: Record<string, unknown>): Record<string, unknown> {
  let current = doc;
  const currentVersion = current.schemaVersion || '1.0.0';
  
  for (const migration of PAGE_MIGRATIONS) {
    if (current.schemaVersion === migration.from) {
      current = migration.migrate(current);
    }
  }
  
  return current;
}

/**
 * Validate and parse page content
 */
export function validatePageContent(content: unknown): Page {
  try {
    // First migrate if needed
    const migrated = typeof content === 'object' && content !== null 
      ? migratePageSchema(content)
      : content;
    
    // Then validate
    return PageSchema.parse(migrated);
  } catch (error) {
    console.error('Page content validation failed:', error);
    throw new Error('Invalid page content structure');
  }
}

/**
 * Validate and parse Puck data
 */
export function validatePuckData(data: unknown): PuckData {
  try {
    return PuckDataSchema.parse(data);
  } catch (error) {
    console.error('Puck data validation failed:', error);
    throw new Error('Invalid Puck data structure');
  }
}
