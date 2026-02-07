export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { searchImages, SearchImagesParams } from '@/lib/services/image-service';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { query, count, orientation } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Query parameter is required and must be a string' 
        },
        { status: 400 }
      );
    }

    // Validate optional fields
    const validOrientations = ['landscape', 'portrait', 'squarish'];
    if (orientation && !validOrientations.includes(orientation)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid orientation. Must be one of: ${validOrientations.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Prepare search parameters
    const searchParams: SearchImagesParams = {
      query: query.trim(),
      count: count && typeof count === 'number' ? Math.min(count, 30) : 10,
      orientation: orientation as 'landscape' | 'portrait' | 'squarish' | undefined,
    };

    // Search for images
    const images = await searchImages(searchParams);

    // Return results
    return NextResponse.json(
      {
        success: true,
        images,
        count: images.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching images:', error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search images. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
