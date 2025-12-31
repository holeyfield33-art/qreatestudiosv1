'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AI_TOOLS = [
  {
    id: 'design-assistant',
    name: 'Design Assistant',
    description: 'Get color palettes, typography, and logo ideas',
    icon: '🎨',
  },
  {
    id: 'webpage-designer',
    name: 'Webpage Designer',
    description: 'Generate complete landing page layouts and copy',
    icon: '💻',
  },
  {
    id: 'blog-writer',
    name: 'Blog Writer',
    description: 'Create SEO-optimized blog posts on any topic',
    icon: '✍️',
  },
  {
    id: 'ad-copy',
    name: 'Ad Copy Generator',
    description: 'Write high-converting ads for any platform',
    icon: '📢',
  },
  {
    id: 'social-media',
    name: 'Social Media Captions',
    description: 'Generate engaging posts for all platforms',
    icon: '📱',
  },
  {
    id: 'email-template',
    name: 'Email Templates',
    description: 'Create professional email campaigns',
    icon: '📧',
  },
  {
    id: 'menu-description',
    name: 'Menu Descriptions',
    description: 'Write appetizing food descriptions',
    icon: '🍽️',
  },
  {
    id: 'business-proposal',
    name: 'Business Proposals',
    description: 'Generate professional service proposals',
    icon: '📄',
  },
];

export default function AIToolsPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch('/api/ai/usage');
      const data = await res.json();
      setUsage(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Failed to load usage:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  const usagePercent = usage
    ? Math.round((usage.usage.totalTokens / usage.limit) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">AI Tools</h1>
        <p className="text-muted-foreground">
          AI-powered content generation for your business
        </p>
      </div>

      {/* Usage Card */}
      {!loading && usage && (
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold">Token Usage This Month</h3>
              <p className="text-sm text-muted-foreground">
                Plan: <Badge>{usage.plan}</Badge>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {usage.usage.totalTokens.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                of {usage.limit.toLocaleString()} tokens
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
              role="progressbar"
              aria-valuenow={usagePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Token usage percentage"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2" aria-live="polite">
            {usage.remaining.toLocaleString()} tokens remaining
          </p>
        </Card>
      )}

      {/* Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AI_TOOLS.map((tool) => (
          <Card
            key={tool.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => router.push(`/dashboard/ai/${tool.id}`)}
            tabIndex={0}
            role="button"
            aria-label={`Open ${tool.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/dashboard/ai/${tool.id}`);
              }
            }}
          >
            <div className="text-4xl mb-4" aria-hidden="true">{tool.icon}</div>
            <h3 className="font-semibold mb-2">{tool.name}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </Card>
        ))}
      </div>

      {/* No API Key Warning */}
      {!loading && !usage && (
        <Card className="p-6 bg-yellow-50 border-yellow-200" role="alert">
          <p className="text-sm">
            ⚠️ AI features require an OpenAI API key. Add{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">OPENAI_API_KEY</code> to your environment variables to
            enable AI tools.
          </p>
        </Card>
      )}
    </div>
  );
}
