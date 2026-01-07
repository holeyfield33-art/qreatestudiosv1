'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { QrCode, Globe, BarChart3, Package, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    qrCodes: 0,
    landingPages: 0,
    totalScans: 0,
    printOrders: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [qrRes, lpRes] = await Promise.all([
        fetch('/api/qr-codes'),
        fetch('/api/landing-pages'),
      ]);

      const qrData = await qrRes.json();
      const lpData = await lpRes.json();

      setStats({
        qrCodes: qrData.qrCodes?.length || 0,
        landingPages: lpData.pages?.length || 0,
        totalScans: qrData.qrCodes?.reduce((sum: number, qr: any) => sum + (qr.scanCount || 0), 0) || 0,
        printOrders: 0,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch stats:', error);
      }
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your QR codes and landing pages
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qrCodes}</div>
            <p className="text-xs text-muted-foreground">Active codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Landing Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.landingPages}</div>
            <p className="text-xs text-muted-foreground">Published pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Print Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.printOrders}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              onClick={() => router.push('/dashboard/qr-codes/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/landing-pages/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Landing Page
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => router.push('/dashboard/analytics')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Learn how to use Qreate Studios</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs shrink-0">1</span>
                <span>Create your first QR code with any URL or content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs shrink-0">2</span>
                <span>Build a landing page to enhance your QR experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs shrink-0">3</span>
                <span>Connect your QR code to your landing page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs shrink-0">4</span>
                <span>Order physical NFC cards or print materials</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
