'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, QrCode } from 'lucide-react';
import Link from 'next/link';

export function EmptyAnalytics() {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <div className="relative bg-blue-500/10 p-6 rounded-full">
            <BarChart3 className="h-16 w-16 text-blue-500" />
          </div>
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold">No Analytics Data Yet</h3>
          <p className="text-muted-foreground">
            Start scanning your QR codes to see detailed analytics, including scan counts,
            locations, devices, and time-series data.
          </p>
        </div>

        <Link href="/dashboard/qr-codes/create">
          <Button size="lg" className="min-h-[44px]">
            <QrCode className="mr-2 h-5 w-5" />
            Create Your First QR Code
          </Button>
        </Link>

        <div className="pt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            📊 Analytics include: Scan locations, device types, browsers, and time trends
          </p>
        </div>
      </div>
    </Card>
  );
}
