'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  QrCode,
  Layout,
  Palette,
  FileText,
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const AI_CATEGORIES = [
  {
    id: 'qr',
    title: 'QR Code AI',
    description: 'Optimize and design better QR codes with AI insights',
    icon: QrCode,
    features: [
      { name: 'Optimize Performance', desc: 'Get data-driven improvements' },
      { name: 'Design Suggestions', desc: 'AI-powered style recommendations' },
      { name: 'Smart Naming', desc: 'Generate descriptive QR names' },
    ],
    color: 'from-blue-500 to-cyan-500',
    href: '/dashboard/qr-codes',
  },
  {
    id: 'landing',
    title: 'Landing Page AI',
    description: 'Create high-converting landing pages in seconds',
    icon: Layout,
    features: [
      { name: 'Full Page Generation', desc: 'Complete page from description' },
      { name: 'Copy Writing', desc: 'Compelling headlines and body text' },
      { name: 'SEO Optimization', desc: 'Search engine friendly content' },
      { name: 'Image Suggestions', desc: 'Perfect visuals for your page' },
    ],
    color: 'from-purple-500 to-pink-500',
    href: '/dashboard/landing-pages/create',
  },
  {
    id: 'branding',
    title: 'Branding AI',
    description: 'Build your brand identity with AI-powered tools',
    icon: Palette,
    features: [
      { name: 'Business Names', desc: 'Creative, memorable name ideas' },
      { name: 'Logo Concepts', desc: 'Design briefs for your logo' },
      { name: 'Color Palettes', desc: 'Professional brand colors' },
      { name: 'Taglines', desc: 'Catchy, memorable slogans' },
    ],
    color: 'from-orange-500 to-red-500',
    href: '/dashboard/branding',
  },
  {
    id: 'content',
    title: 'Content AI',
    description: 'Create blog posts, social media, and email content',
    icon: FileText,
    features: [
      { name: 'Blog Posts', desc: 'SEO-optimized long-form content' },
      { name: 'Social Media', desc: 'Engaging posts for all platforms' },
      { name: 'Email Marketing', desc: 'Conversion-focused campaigns' },
      { name: 'Idea Brainstorming', desc: 'Creative strategy sessions' },
    ],
    color: 'from-green-500 to-emerald-500',
    href: '/dashboard/content',
  },
  {
    id: 'analytics',
    title: 'Analytics AI',
    description: 'Get insights and predictions from your data',
    icon: TrendingUp,
    features: [
      { name: 'Performance Analysis', desc: 'Deep dive into your metrics' },
      { name: 'Trend Prediction', desc: 'Forecast future performance' },
      { name: 'Smart Suggestions', desc: 'AI-powered improvements' },
    ],
    color: 'from-indigo-500 to-purple-500',
    href: '/dashboard/analytics',
  },
];

export default function AIStudioPage() {
  const [credits, setCredits] = useState<{
    remaining: number;
    limit: number;
    unlimited: boolean;
  } | null>(null);
  const [recentUsage, setRecentUsage] = useState<any[]>([]);

  useEffect(() => {
    fetchCredits();
    fetchRecentUsage();
  }, []);

  async function fetchCredits() {
    try {
      const res = await fetch('/api/ai/credits');
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  }

  async function fetchRecentUsage() {
    // This would fetch recent AI generations
    // For now, we'll leave it empty
    setRecentUsage([]);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Studio
          </h1>
          <Badge variant="secondary" className="ml-2">NEW</Badge>
        </div>
        <p className="text-muted-foreground">
          Supercharge your work with GPT-4 powered AI tools
        </p>
      </div>

      {/* Credits Display */}
      {credits && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Your AI Credits</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {credits.unlimited
                  ? 'Unlimited AI requests on your plan'
                  : `${credits.remaining} of ${credits.limit} requests remaining this month`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {credits.unlimited ? '∞' : credits.remaining}
              </div>
              {!credits.unlimited && (
                <div className="text-sm text-muted-foreground">
                  {((credits.remaining / credits.limit) * 100).toFixed(0)}% left
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* AI Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">AI Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {AI_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${category.color} rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {category.features.map((feature) => (
                      <div key={feature.name} className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium">{feature.name}</div>
                          <div className="text-xs text-muted-foreground">{feature.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href={category.href}>
                    <Button className="w-full gap-2" variant="outline">
                      Try {category.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Start Tips */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Quick Start Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">🎯 Be Specific</p>
            <p className="text-muted-foreground">
              The more details you provide, the better AI can help you.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">🔄 Iterate</p>
            <p className="text-muted-foreground">
              Don't like the first result? Try again with different wording.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">✏️ Customize</p>
            <p className="text-muted-foreground">
              Use AI as a starting point, then customize to match your brand.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">📊 Track Usage</p>
            <p className="text-muted-foreground">
              Monitor your credits to make the most of your plan.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
