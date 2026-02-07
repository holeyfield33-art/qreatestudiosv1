export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${randomUUID()}.${fileExt}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Save file
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/images/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        fileName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
