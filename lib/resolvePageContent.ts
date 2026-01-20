import merge from 'lodash/merge';
import { PuckData } from './schemas/page';

interface Template {
  id: string;
  defaultSections: PuckData;
  defaultStyles?: Record<string, unknown>;
}

interface LegacyContent {
  html: string;
  templateId?: string;
}

interface Page {
  templateId?: string;
  draftContent?: PuckData;
  publishedContent?: PuckData;
  content?: LegacyContent; // Legacy HTML content
  isPublished: boolean;
}

/**
 * Resolves page content by merging user customizations over template defaults
 * This ensures pages never render blank - template defaults always display
 *
 * Priority order:
 * 1. User's published content (if published)
 * 2. User's draft content (if editing)
 * 3. Template defaults (always available)
 */
export function resolvePageContent(
  page: Page,
  template?: Template | null,
  mode: 'draft' | 'published' = 'published'
): PuckData {
  // Start with template defaults if available
  const baseContent = template?.defaultSections || { content: [], root: {} };

  // Determine which user content to use
  const userContent = mode === 'published' && page.isPublished
    ? page.publishedContent
    : page.draftContent;

  // If user has Puck content (array-based sections), deep merge over defaults
  if (userContent && typeof userContent === 'object' && 'content' in userContent && Array.isArray((userContent as any).content)) {
    const merged = merge({}, baseContent, userContent);
    return ensureSectionIds(merged);
  }

  // If userContent is GrapesJS format { html, css, json }, convert to Puck format
  if (userContent && typeof userContent === 'object' && 'html' in userContent) {
    return ensureSectionIds({
      content: [
        {
          type: 'GrapesJSSection',
          props: {
            html: (userContent as any).html || '',
            css: (userContent as any).css || '',
            json: (userContent as any).json,
          },
        },
      ],
      root: {},
    });
  }

  // If no Puck/GrapesJS content but has legacy HTML content in page.content field
  if (page.content && typeof page.content === 'object' && 'html' in page.content) {
    // Legacy format - convert to Puck structure with single HTML section
    return ensureSectionIds({
      content: [
        {
          type: 'LegacyHTML',
          props: {
            html: page.content.html || '',
            templateId: page.content.templateId,
          },
        },
      ],
      root: {},
    });
  }

  // Fallback: return template defaults (ensures never blank)
  return ensureSectionIds(baseContent);
}

function ensureSectionIds(content: PuckData): PuckData {
  return {
    ...content,
    content: (content.content || []).map((section: any, index: number) => ({
      id: section.id ?? `section-${index}`,
      ...section,
    })),
  };
}

/**
 * Check if a page has custom content (not just template defaults)
 */
export function hasCustomContent(page: Page): boolean {
  return !!(
    page.draftContent ||
    page.publishedContent ||
    (page.content && typeof page.content === 'object' && Object.keys(page.content).length > 0)
  );
}

/**
 * Get the appropriate content for editing (draft or published as starting point)
 */
export function getEditableContent(page: Page, template?: Template | null): PuckData {
  // If has draft content, use that
  if (page.draftContent) {
    return page.draftContent as PuckData;
  }
  
  // If has published content, clone it for editing
  if (page.publishedContent) {
    return structuredClone(page.publishedContent) as PuckData;
  }
  
  // Otherwise start with template defaults
  return template?.defaultSections || { content: [], root: {} };
}

/**
 * Prepare content for saving (validate structure)
 */
export function prepareContentForSave(content: unknown): PuckData {
  if (!content || typeof content !== 'object') {
    throw new Error('Invalid content: must be an object');
  }

  const contentObj = content as Record<string, unknown>;

  if (!Array.isArray(contentObj.content)) {
    throw new Error('Invalid content: content.content must be an array');
  }

  // Ensure all sections have required fields
  const validatedContent = contentObj.content.map((section: unknown, index: number) => {
    if (typeof section !== 'object' || section === null) {
      throw new Error(`Invalid content: section at index ${index} is not an object`);
    }
    const sectionObj = section as Record<string, unknown>;
    if (!sectionObj.type) {
      throw new Error(`Invalid content: section at index ${index} missing type`);
    }
    if (!sectionObj.props || typeof sectionObj.props !== 'object') {
      throw new Error(`Invalid content: section at index ${index} missing or invalid props`);
    }
    return section as { type: string; props: Record<string, unknown> };
  });

  return {
    content: validatedContent,
    root: (contentObj.root as Record<string, unknown> | undefined) || {},
    zones: contentObj.zones as Record<string, Array<{ type: string; props: Record<string, unknown> }>> | undefined,
  };
}

/**
 * Check if content is in Puck format (vs legacy HTML)
 */
export function isPuckContent(content: unknown): content is PuckData {
  return !!(
    content &&
    typeof content === 'object' &&
    'content' in content &&
    Array.isArray(content.content)
  );
}

/**
 * Check if content is legacy HTML format
 */
export function isLegacyContent(content: unknown): content is LegacyContent {
  return !!(
    content &&
    typeof content === 'object' &&
    'html' in content &&
    typeof (content as { html?: unknown }).html === 'string'
  );
}

/**
 * Get a default empty Puck structure
 */
export function getEmptyPuckContent(): PuckData {
  return {
    content: [],
    root: {},
  };
}

/**
 * Merge two Puck content structures
 */
export function mergePuckContent(base: PuckData, override: Partial<PuckData>): PuckData {
  return merge({}, base, override);
}
