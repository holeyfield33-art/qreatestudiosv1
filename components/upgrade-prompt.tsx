'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  feature: string;
  requiredPlan: string;
  description: string;
}

export default function UpgradePrompt({ feature, requiredPlan, description }: UpgradePromptProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="p-8 text-center max-w-lg border-2 border-blue-200 bg-blue-50">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-2xl font-bold mb-2">{feature}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="bg-white rounded-lg p-4 mb-6 inline-block">
          <p className="text-sm text-muted-foreground mb-1">Available on</p>
          <p className="text-2xl font-bold text-blue-600">{requiredPlan} Plan</p>
        </div>

        <Button 
          size="lg" 
          onClick={() => router.push('/pricing')}
          className="w-full"
        >
          Upgrade to {requiredPlan}
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          30-day money-back guarantee
        </p>
      </Card>
    </div>
  );
}
