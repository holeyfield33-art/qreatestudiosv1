export const runtime = 'nodejs';

import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { encode } from 'blurhash';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Generate blurhash from image buffer
 */
async function generateBlurhash(buffer: Buffer): Promise<string> {
  try {
    // Resize to small size for blurhash generation
    const resized = await sharp(buffer)
      .resize(32, 32, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const blurhash = encode(
      new Uint8ClampedArray(resized.data),
      resized.info.width,
      resized.info.height,
      4,
      3
    );

    return blurhash;
  } catch (error) {
    console.error('Blurhash generation failed:', error);
    // Return a default blurhash if generation fails
    return 'L6PZfSjE.AyE_3t7t7R**0o#DgR4';
  }
}

/**
 * Optimize image before upload
 */
async function optimizeImage(buffer: Buffer, contentType: string): Promise<Buffer> {
  try {
    let pipeline = sharp(buffer);

    // Get metadata to check dimensions
    const metadata = await pipeline.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Resize if too large (max 2000px on longest side)
    if (width > 2000 || height > 2000) {
      pipeline = pipeline.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to WebP for better compression (unless GIF)
    if (contentType !== 'image/gif') {
      pipeline = pipeline.webp({ quality: 85 });
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Return original buffer if optimization fails
    return buffer;
  }
}

/**
 * POST /api/upload
 * Upload image to Vercel Blob with optimization and blurhash generation
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'default';
    const landingPageId = formData.get('landingPageId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate blurhash
    const blurhash = await generateBlurhash(buffer);

    // Optimize image
    const optimizedBuffer = await optimizeImage(buffer, file.type);

    // Get image dimensions
    const metadata = await sharp(optimizedBuffer).metadata();

    // Upload to Vercel Blob with timeout
    const filename = `${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Create abort controller for timeout
    const abortController = new AbortController();
    const uploadTimeout = setTimeout(() => abortController.abort(), 30000); // 30 second timeout

    try {
      const blob = await put(filename, optimizedBuffer, {
        access: 'public',
        contentType: file.type === 'image/gif' ? 'image/gif' : 'image/webp',
        abortSignal: abortController.signal,
      });

      clearTimeout(uploadTimeout);

      // Store media record in database
      const mediaRecord = await prisma.media.create({
        data: {
          userId: session.user.id,
          landingPageId: landingPageId || null,
          url: blob.url,
          blobPath: filename,
          filename: file.name,
          contentType: blob.contentType || file.type,
          size: optimizedBuffer.length,
          width: metadata.width || null,
          height: metadata.height || null,
          blurhash: blurhash || null,
          category,
          metadata: {
            originalSize: file.size,
            optimized: file.size !== optimizedBuffer.length,
            format: metadata.format,
          },
        },
      });

      // Return image metadata
      return NextResponse.json({
        id: mediaRecord.id,
        url: blob.url,
        blurhash,
        width: metadata.width,
        height: metadata.height,
        size: optimizedBuffer.length,
        category,
        contentType: blob.contentType,
      });
    } catch (uploadError: any) {
      clearTimeout(uploadTimeout);

      if (uploadError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Upload timeout. Please try again or use a smaller file.' },
          { status: 408 }
        );
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('Upload error:', error);

    // Categorize errors
    if (error instanceof Error) {
      if (error.message.includes('sharp')) {
        return NextResponse.json(
          { error: 'Invalid or corrupted image file. Please try a different image.' },
          { status: 400 }
        );
      }
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Upload timeout. Please check your connection and try again.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

// Set route config for longer execution time if needed
export const maxDuration = 60; // 60 seconds max for image processing + upload

/**
 * DELETE /api/upload?url=...
 * Delete image from Vercel Blob (optional - for cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Note: Vercel Blob deletion requires the blob token
    // This is a placeholder for when you implement cleanup
    // You may want to store blob tokens in the database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
