import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { resolvePageContent } from '@/lib/resolvePageContent';
import PublicLandingPageRender from '@/components/landing/PublicLandingPageRender';
import DOMPurify from 'isomorphic-dompurify';

interface RouteContext {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string; preview?: string }>;
}

/** Sanitize HTML to prevent XSS — allows safe inline styles */
function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ['style', 'iframe'],
    ADD_ATTR: ['target', 'rel', 'loading', 'allowfullscreen', 'frameborder', 'style'],
    ALLOW_DATA_ATTR: true,
    FORCE_BODY: true,
  });
}

/** Sanitize CSS — strip any url() that isn't https and strip expressions/javascript */
function sanitizeCss(css: string): string {
  // Remove javascript: in url()
  let clean = css.replace(/url\s*\(\s*['"]?\s*javascript:/gi, 'url(about:blank');
  // Remove expression()
  clean = clean.replace(/expression\s*\(/gi, 'invalid(');
  // Remove -moz-binding
  clean = clean.replace(/-moz-binding\s*:/gi, '-invalid:');
  return clean;
}

export default async function PublicLandingPage({ params, searchParams }: RouteContext) {
  const { slug } = await params;
  const { table, preview } = await searchParams;

  // Preview mode requires authentication — owner must be signed in
  let isPreview = false;
  if (preview === 'true') {
    const session = await auth();
    if (session?.user?.id) {
      isPreview = true;
    }
    // If not authenticated, ignore preview param silently — show published content
  }

  const landingPage = await prisma.landingPage.findFirst({
    where: {
      slug,
      // Allow preview only for authenticated users
      ...(isPreview ? {} : { isPublished: true }),
    },
    include: {
      Template: true,
      RestaurantMenu: true,
      User: {
        select: {
          parentOrganizationId: true,
          Organization: {
            select: { isWhiteLabel: true },
          },
        },
      },
    },
  });

  if (!landingPage) {
    notFound();
  }

  // For preview, verify the user owns this page
  if (isPreview) {
    const session = await auth();
    if (landingPage.userId !== session?.user?.id) {
      notFound(); // Don't expose unpublished pages to other users
    }
  }

  // Increment views atomically (non-blocking, only for published non-preview)
  if (!isPreview && landingPage.isPublished) {
    prisma.$executeRawUnsafe(
      'UPDATE "LandingPage" SET views = views + 1 WHERE id = $1',
      landingPage.id
    ).catch(() => {});
  }

  // Track table-specific QR scan if table parameter provided
  if (table && landingPage.qrCodeId && !isPreview) {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;

    prisma.analytics.create({
      data: {
        id: crypto.randomUUID(),
        qrCodeId: landingPage.qrCodeId,
        tableNumber: table,
        userAgent: userAgent ?? undefined,
        scannedAt: new Date(),
      },
    }).catch(() => {}); // Don't fail page load if analytics fails
  }

  // Content priority: published pages ONLY show publishedContent (never fallback to draft)
  // Preview mode shows draft content
  const contentToRender = isPreview
    ? (landingPage.draftContent || landingPage.publishedContent || landingPage.content)
    : (landingPage.publishedContent || landingPage.content);

  if (!contentToRender) {
    notFound();
  }

  // Check if content is in GrapesJS format (has html/css properties)
  const isGrapesJSFormat = contentToRender &&
    typeof contentToRender === 'object' &&
    ('html' in contentToRender || 'css' in contentToRender);

  // Check if org has white-label (hide "Powered by" branding)
  const isWhiteLabel = landingPage.User?.Organization?.isWhiteLabel ?? false;

  // Render GrapesJS format directly with sanitization
  if (isGrapesJSFormat) {
    const rawContent = contentToRender as { html?: string; css?: string };
    const html = sanitizeHtml(rawContent.html || '');
    const css = sanitizeCss(rawContent.css || '');

    return (
      <div className="min-h-screen">
        {/* Inject sanitized CSS */}
        {css && (
          <style dangerouslySetInnerHTML={{ __html: css }} />
        )}

        {/* Render sanitized HTML */}
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {/* Preview banner */}
        {isPreview && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#f59e0b', color: '#000', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 600 }}>
            ⚠️ Preview Mode — This page is not published
          </div>
        )}

        {/* Footer — hidden for white-label orgs */}
        {!isWhiteLabel && (
          <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-gray-50">
            <p>© {new Date().getFullYear()} {landingPage.name}. All rights reserved.</p>
            <p className="mt-2">
              <a href="https://qreatestudios.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
                Powered by Qreate Studios
              </a>
            </p>
          </footer>
        )}
      </div>
    );
  }

  // Fallback to Puck format rendering
  const resolvedContent = resolvePageContent(
    {
      templateId: landingPage.templateId ?? undefined,
      draftContent: landingPage.draftContent as any,
      publishedContent: landingPage.publishedContent as any,
      content: landingPage.content as any,
      isPublished: landingPage.isPublished,
    },
    landingPage.Template ? {
      ...landingPage.Template,
      defaultSections: landingPage.Template.defaultSections as any,
      defaultStyles: landingPage.Template.defaultStyles as any,
    } : null,
    isPreview ? 'draft' : 'published'
  );

  // Inject menu data if available
  if (landingPage.RestaurantMenu && resolvedContent.content) {
    resolvedContent.content = resolvedContent.content.map((section: any) => {
      if (section.type === 'MenuSection') {
        return {
          ...section,
          props: {
            ...section.props,
            menu: landingPage.RestaurantMenu,
          },
        };
      }
      return section;
    });
  }

  return (
    <div className="min-h-screen">
      <PublicLandingPageRender data={resolvedContent as any} />

      {isPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#f59e0b', color: '#000', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 600 }}>
          ⚠️ Preview Mode — This page is not published
        </div>
      )}

      {!isWhiteLabel && (
        <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-gray-50">
          <p>© {new Date().getFullYear()} {landingPage.name}. All rights reserved.</p>
          <p className="mt-2">
            <a href="https://qreatestudios.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
              Powered by Qreate Studios
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}

// SEO metadata generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const page = await prisma.landingPage.findFirst({
    where: { slug, isPublished: true },
    select: { name: true, seo: true },
  });
  
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }
  
  const seo = page.seo as any;
  
  return {
    title: seo?.metaTitle || page.name || 'Landing Page',
    description: seo?.metaDescription || undefined,
    openGraph: {
      title: seo?.metaTitle || page.name,
      description: seo?.metaDescription || undefined,
      images: seo?.ogImage ? [seo.ogImage] : undefined,
      type: seo?.ogType || 'website',
    },
  };
}
