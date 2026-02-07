import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { resolvePageContent } from '@/lib/resolvePageContent';
import PublicLandingPageRender from '@/components/landing/PublicLandingPageRender';
import '@measured/puck/puck.css';

interface RouteContext {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string; preview?: string }>;
}

export default async function PublicLandingPage({ params, searchParams }: RouteContext) {
  const { slug } = await params;
  const { table, preview } = await searchParams;

  const landingPage = await prisma.landingPage.findFirst({
    where: {
      slug,
      // Allow preview mode to show unpublished pages
      ...(preview ? {} : { isPublished: true })
    },
    include: {
      Template: true,
      RestaurantMenu: true,
    },
  });

  if (!landingPage) {
    notFound();
  }

  // Increment views (non-blocking, only for published non-preview)
  if (!preview) {
    prisma.landingPage
      .update({
        where: { id: landingPage.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});
  }

  // Track table-specific QR scan if table parameter provided
  if (table && landingPage.qrCodeId && !preview) {
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

  // Get content - prioritize based on preview mode
  const contentToRender = preview
    ? (landingPage.draftContent || landingPage.publishedContent || landingPage.content)
    : (landingPage.publishedContent || landingPage.draftContent || landingPage.content);

  // Check if content is in GrapesJS format (has html/css properties)
  const isGrapesJSFormat = contentToRender &&
    typeof contentToRender === 'object' &&
    ('html' in contentToRender || 'css' in contentToRender);

  // Render GrapesJS format directly
  if (isGrapesJSFormat) {
    const { html = '', css = '' } = contentToRender as any;

    return (
      <div className="min-h-screen">
        {/* Inject CSS */}
        {css && (
          <style dangerouslySetInnerHTML={{ __html: css }} />
        )}

        {/* Render HTML */}
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-gray-50">
          <p>© {new Date().getFullYear()} {landingPage.name}. All rights reserved.</p>
          <p className="mt-2">
            <a href="https://qreatestudios.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
              Powered by Qreate Studios
            </a>
          </p>
        </footer>
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
    preview ? 'draft' : 'published'
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

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-gray-50">
        <p>© {new Date().getFullYear()} {landingPage.name}. All rights reserved.</p>
        <p className="mt-2">
          <a href="https://qreatestudios.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
            Powered by Qreate Studios
          </a>
        </p>
      </footer>
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
