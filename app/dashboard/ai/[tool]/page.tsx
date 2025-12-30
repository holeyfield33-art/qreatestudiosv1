import AIToolPageClient from './page-client';

interface AIToolPageProps {
  params: Promise<{ tool: string }>;
}

export default function AIToolPage({ params }: AIToolPageProps) {
  return <AIToolPageClient params={params} />;
}
