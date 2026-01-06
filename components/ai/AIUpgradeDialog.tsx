'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AIUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function AIUpgradeDialog({ open, onOpenChange, message }: AIUpgradeDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <DialogTitle>Upgrade for More AI Power</DialogTitle>
          </div>
          <DialogDescription>
            {message || "You've reached your AI request limit. Upgrade to unlock more."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 my-6">
          {/* Pro Plan */}
          <Card className="p-4 border-2 hover:border-blue-300 transition-colors">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Pro</div>
              <div className="text-3xl font-bold mb-1">$29</div>
              <div className="text-sm text-muted-foreground mb-4">/month</div>
              
              <div className="space-y-2 text-left text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>100 AI requests/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>QR optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Design suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Copy writing</span>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  router.push('/pricing');
                  onOpenChange(false);
                }}
                variant="outline"
                className="w-full"
              >
                Upgrade to Pro
              </Button>
            </div>
          </Card>

          {/* Business Plan */}
          <Card className="p-4 border-2 border-purple-300 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Business</div>
              <div className="text-3xl font-bold mb-1">$99</div>
              <div className="text-sm text-muted-foreground mb-4">/month</div>
              
              <div className="space-y-2 text-left text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">500 AI requests/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>All AI features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Landing page generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Branding tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Content creation</span>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  router.push('/pricing');
                  onOpenChange(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Business
              </Button>
            </div>
          </Card>

          {/* Agency Plan */}
          <Card className="p-4 border-2 hover:border-blue-300 transition-colors">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Agency</div>
              <div className="text-3xl font-bold mb-1">$299</div>
              <div className="text-sm text-muted-foreground mb-4">/month</div>
              
              <div className="space-y-2 text-left text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Unlimited AI requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>All features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>White label</span>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  router.push('/pricing');
                  onOpenChange(false);
                }}
                variant="outline"
                className="w-full"
              >
                Upgrade to Agency
              </Button>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
