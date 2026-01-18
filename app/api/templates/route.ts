import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/templates
 * Fetch all active templates from database
 * Returns templates with proper structure for Puck builder
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    
    if (error) {
      return error;
    }

    // Fetch all active templates
    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isPremium: 'asc' }, // Free templates first
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Transform to match PuckTemplate interface
    const transformedTemplates = templates.map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description || '',
      isPremium: template.isPremium,
      thumbnail: template.thumbnail || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      previewImage: (template.metadata as any)?.previewImage || template.thumbnail || '',
      defaultSections: template.defaultSections,
      metadata: template.metadata || {},
    }));

    return NextResponse.json({
      success: true,
      templates: transformedTemplates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
