import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const page = await prisma.landingPage.findUnique({
    where: { slug },
  });

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: (page as any).name || (page as any).title || 'Landing Page',
    description: `Landing page for ${(page as any).name || (page as any).title}`,
  };
}

export default async function PublicLandingPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch landing page
  const page = await prisma.landingPage.findUnique({
    where: { slug },
  });

  if (!page || !(page as any).isPublished && !(page as any).published) {
    notFound();
  }

  // Increment view count (non-blocking)
  prisma.landingPage.update({
    where: { id: page.id },
    data: { views: { increment: 1 } },
  }).catch(console.error);

  const content = page.content as any;

  // Render the landing page
  return (
    <div className="min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: content.html || '' }} />
    </div>
  );
}
