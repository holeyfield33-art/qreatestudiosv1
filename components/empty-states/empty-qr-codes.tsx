'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function EmptyQRCodes() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-primary/10 p-6 rounded-full">
            <QrCode className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold">Create Your First QR Code</h3>
          <p className="text-muted-foreground">
            Start by creating a QR code to track scans, share links, or connect with customers.
            Choose from multiple types including URLs, vCards, WiFi, and more.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/qr-codes/create">
            <Button size="lg" className="min-h-[44px]">
              <QrCode className="mr-2 h-5 w-5" />
              Create QR Code
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button variant="outline" size="lg" className="min-h-[44px]">
              <Sparkles className="mr-2 h-5 w-5" />
              Browse Templates
            </Button>
          </Link>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-medium">Pro Tip:</span> Use templates to create professional QR codes in seconds
          </p>
        </div>
      </div>
    </Card>
  );
}
