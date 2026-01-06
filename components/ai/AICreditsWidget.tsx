'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AICreditsWidget({ className }: { className?: string }) {
  const router = useRouter();
  const [credits, setCredits] = useState<{
    remaining: number;
    limit: number;
    resetDate: Date;
    unlimited: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      const res = await fetch('/api/ai/credits');
      if (res.ok) {
        const data = await res.json();
        setCredits({
          ...data,
          resetDate: new Date(data.resetDate),
        });
      }
    } catch (error) {
      console.error('Failed to fetch AI credits:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !credits) {
    return null;
  }

  const getColor = () => {
    if (credits.unlimited) return 'text-purple-600';
    const percentage = (credits.remaining / credits.limit) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getText = () => {
    if (credits.unlimited) return '∞ AI credits';
    if (credits.remaining === 0) return 'Out of AI credits';
    return `${credits.remaining} AI credits`;
  };

  const getTooltipText = () => {
    if (credits.unlimited) {
      return 'Unlimited AI requests on your plan';
    }
    const resetDate = credits.resetDate.toLocaleDateString();
    return `${credits.remaining} of ${credits.limit} remaining. Resets ${resetDate}`;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push('/dashboard/ai-studio')}
      className={cn(
        'gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50',
        className
      )}
      title={getTooltipText()}
    >
      <Sparkles className={cn('h-4 w-4', getColor())} />
      <span className={cn('font-medium', getColor())}>
        {getText()}
      </span>
    </Button>
  );
}
