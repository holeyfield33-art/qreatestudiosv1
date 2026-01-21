import { z } from 'zod';

// Menu Item Validation
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  price: z.union([
    z.number().min(0, 'Price must be positive'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform((val) => parseFloat(val)),
  ]),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  image: z.string().url('Invalid image URL').optional().nullable(),
  available: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional(),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

// Landing Page Validation
export const landingPageCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.any().optional(),
  draftContent: z.any().optional(),
  publishedContent: z.any().optional(),
  theme: z.any().optional(),
  metadata: z.any().optional(),
  seo: z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      ogImage: z.string().url().optional(),
    })
    .optional(),
  qrCodeId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  templateId: z.string().optional().nullable(),
  customDomain: z.string().max(255).optional().nullable(),
});

export const landingPageUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  content: z.any().optional(),
  draftContent: z.any().optional(),
  publishedContent: z.any().optional(),
  metadata: z.any().optional(),
  seo: z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
      ogImage: z.string().url().optional(),
    })
    .optional(),
  isPublished: z.boolean().optional(),
  qrCodeId: z.string().uuid().optional().nullable(),
  customDomain: z.string().max(255).optional().nullable(),
});

// Upload Validation
export const uploadFileSchema = z.object({
  file: z.any().refine((val) => val instanceof File, 'File is required'),
  category: z.string().max(50).optional().default('default'),
});

// Error Response Helper
export type ValidationError = {
  field: string;
  message: string;
};

export function formatZodError(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

// API Error Types
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationAPIError extends APIError {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super(message, 400, 'VALIDATION_ERROR', { validationErrors });
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends APIError {
  constructor(message: string, public conflictField?: string) {
    super(message, 409, 'CONFLICT', { conflictField });
  }
}

// Error Response Formatter
export function formatErrorResponse(error: unknown) {
  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: { validationErrors: formatZodError(error) },
      statusCode: 400,
    };
  }

  // Database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return {
        error: 'A record with this value already exists',
        code: 'UNIQUE_CONSTRAINT',
        details: { fields: prismaError.meta?.target },
        statusCode: 409,
      };
    }

    // Foreign key constraint violation
    if (prismaError.code === 'P2003') {
      return {
        error: 'Referenced record does not exist',
        code: 'FOREIGN_KEY_CONSTRAINT',
        statusCode: 400,
      };
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return {
        error: 'Record not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      };
    }
  }

  // Generic error
  console.error('Unhandled error:', error);
  return {
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}
