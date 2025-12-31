'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Failed to load stats:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>
        <Link href="/dashboard/admin/print-orders">
          <Button variant="outline" className="min-h-[44px]">
            Print Orders
          </Button>
        </Link>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 md:grid-cols-4" role="region" aria-label="Platform statistics">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-3xl font-bold" aria-label={`${stats?.totalUsers || 0} total users`}>
            {stats?.totalUsers || 0}
          </p>
          <p className="text-xs text-green-600 mt-1" role="status">
            +{stats?.newUsersThisWeek || 0} this week
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">QR Codes</h3>
          <p className="text-3xl font-bold" aria-label={`${stats?.totalQRCodes || 0} total QR codes`}>
            {stats?.totalQRCodes || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.activeQRCodes || 0} active
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
          <p className="text-3xl font-bold" aria-label={`${stats?.totalScans || 0} total scans`}>
            {stats?.totalScans || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.scansThisMonth || 0} this month
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">MRR</h3>
          <p className="text-3xl font-bold" aria-label={`$${((stats?.totalRevenue || 0) / 100).toFixed(0)} monthly recurring revenue`}>
            ${((stats?.totalRevenue || 0) / 100).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.activeSubscriptions || 0} subscriptions
          </p>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Subscription Breakdown</h3>
        <div className="grid md:grid-cols-4 gap-4" role="list" aria-label="Subscription plans">
          {['FREE', 'PRO', 'BUSINESS', 'AGENCY'].map((plan) => (
            <div 
              key={plan} 
              className="text-center p-4 bg-gray-50 rounded"
              role="listitem"
            >
              <p className="text-2xl font-bold" aria-label={`${stats?.subscriptionsByPlan?.[plan] || 0} ${plan} users`}>
                {stats?.subscriptionsByPlan?.[plan] || 0}
              </p>
              <p className="text-sm text-muted-foreground">{plan}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Users</h3>
          <div className="space-y-2" role="list" aria-label="Recent user registrations">
            {stats?.recentUsers?.length > 0 ? (
              stats.recentUsers.map((user: any) => (
                <div 
                  key={user.id} 
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  role="listitem"
                >
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{user.subscription?.plan || 'FREE'}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent users</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Pending Security Reports</h3>
          <div className="space-y-2" role="list" aria-label="Security reports pending review">
            {stats?.pendingReports?.length > 0 ? (
              stats.pendingReports.map((report: any) => (
                <div 
                  key={report.id} 
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  role="listitem"
                >
                  <div>
                    <p className="font-medium">{report.reportType}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.qrCode?.name || 'Unknown QR'}
                    </p>
                  </div>
                  <Badge variant="destructive">Review</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground" role="status">
                No pending reports ✓
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
