'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, Activity, Download } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const qrId = searchParams.get('qr');
  
  const [overviewData, setOverviewData] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'qr'>('overview');

  useEffect(() => {
    if (qrId) {
      setSelectedView('qr');
      fetchQRAnalytics(qrId);
    } else {
      fetchOverviewAnalytics();
    }
  }, [qrId]);

  async function fetchOverviewAnalytics() {
    try {
      const res = await fetch('/api/analytics/overview');
      const result = await res.json();
      setOverviewData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQRAnalytics(id: string) {
    try {
      const res = await fetch(`/api/analytics/${id}`);
      const result = await res.json();
      setQrData(result);
    } catch (error) {
      console.error('Failed to load QR analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (selectedView === 'qr' && qrData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">QR Code Analytics</h1>
          <p className="text-muted-foreground">Detailed performance metrics</p>
        </div>

        {/* QR-specific stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-blue-500" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
                <p className="text-2xl font-bold">{qrData.totalScans || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-500" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Unique Scans</h3>
                <p className="text-2xl font-bold">{qrData.uniqueScans || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-purple-500" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Avg Daily</h3>
                <p className="text-2xl font-bold">
                  {qrData.scansByDay?.length > 0
                    ? Math.round(qrData.totalScans / qrData.scansByDay.length)
                    : 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-orange-500" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Return Rate</h3>
                <p className="text-2xl font-bold">
                  {qrData.uniqueScans > 0
                    ? Math.round(((qrData.totalScans - qrData.uniqueScans) / qrData.totalScans) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Scans over time chart */}
        {qrData.scansByDay && qrData.scansByDay.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scans Over Time</h3>
            <div className="h-80" role="img" aria-label="Line chart showing QR code scans over time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qrData.scansByDay}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    name="Scans"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="sr-only">
              Chart data: {qrData.scansByDay.map((day: any) => 
                `${new Date(day.date).toLocaleDateString()}: ${day.count} scans`
              ).join(', ')}
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Device breakdown */}
          {qrData.deviceBreakdown && qrData.deviceBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Types</h3>
              <div className="h-64" role="img" aria-label="Pie chart showing device type distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qrData.deviceBreakdown}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {qrData.deviceBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="sr-only">
                Device breakdown: {qrData.deviceBreakdown.map((device: any) => 
                  `${device.type}: ${device.count} scans`
                ).join(', ')}
              </div>
            </Card>
          )}

          {/* Browser breakdown */}
          {qrData.browserBreakdown && qrData.browserBreakdown.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Browsers</h3>
              <div className="h-64" role="img" aria-label="Bar chart showing browser distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qrData.browserBreakdown}>
                    <XAxis dataKey="browser" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" name="Scans" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="sr-only">
                Browser breakdown: {qrData.browserBreakdown.map((browser: any) => 
                  `${browser.browser}: ${browser.count} scans`
                ).join(', ')}
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground">Track your QR code performance</p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-blue-500" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
              <p className="text-3xl font-bold">{overviewData?.totalScans || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Activity className="h-10 w-10 text-green-500" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active QR Codes</h3>
              <p className="text-3xl font-bold">{overviewData?.activeQRCodes || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-10 w-10 text-purple-500" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Avg Scans/QR</h3>
              <p className="text-3xl font-bold">
                {overviewData?.activeQRCodes > 0
                  ? Math.round(overviewData.totalScans / overviewData.activeQRCodes)
                  : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent scans */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Scans</h3>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export
          </Button>
        </div>
        {overviewData?.recentScans?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">QR Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Device</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Browser</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {overviewData.recentScans.map((scan: any) => (
                  <tr key={scan.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{scan.qrCode.name}</td>
                    <td className="px-4 py-3 text-sm capitalize">{scan.deviceType}</td>
                    <td className="px-4 py-3 text-sm">{scan.browser}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(scan.scannedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-muted-foreground">No scans yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create and share your QR codes to start tracking scans
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
