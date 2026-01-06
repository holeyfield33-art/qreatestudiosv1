'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AIUpgradeDialog } from './AIUpgradeDialog';
import { cn } from '@/lib/utils';
import type { AIFeature } from '@/lib/ai/ai-service';

interface AIFeatureButtonProps {
  feature: AIFeature;
  context?: Record<string, any>;
  onComplete: (result: any) => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  prompt: string;
  className?: string;
  disabled?: boolean;
  model?: 'gpt-4o-mini' | 'gpt-4o';
}

export function AIFeatureButton({
  feature,
  context = {},
  onComplete,
  label = 'AI Generate',
  variant = 'default',
  prompt,
  className,
  disabled = false,
  model = 'gpt-4o-mini',
}: AIFeatureButtonProps) {
  const [loading, setLoading] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  async function handleClick() {
    if (disabled || loading) return;

    setLoading(true);
    
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          prompt,
          context,
          model,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsUpgrade) {
          setUpgradeMessage(data.error);
          setUpgradeDialogOpen(true);
          return;
        }
        throw new Error(data.error || 'AI request failed');
      }

      // Parse JSON response if it's a string
      let result = data.data;
      try {
        result = JSON.parse(data.data);
      } catch {
        // Not JSON, use as-is
      }

      onComplete(result);
      toast.success('AI generation complete!');
    } catch (error: any) {
      console.error('AI Feature Button Error:', error);
      toast.error(error.message || 'Failed to generate AI content');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        disabled={disabled || loading}
        className={cn(
          'gap-2 relative overflow-hidden group',
          variant === 'default' && 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
          className
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>{label}</span>
          </>
        )}
      </Button>

      <AIUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        message={upgradeMessage}
      />
    </>
  );
}
