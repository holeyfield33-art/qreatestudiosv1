'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  totalScans: number;
  uniqueUsers: number;
  scansByHour: Array<{ hour: number; count: number }>;
  scansByDayOfWeek: Array<{ day: string; count: number }>;
  timeSeriesData: Array<{ date: string; count: number }>;
  deviceStats: Record<string, number>;
  browserStats: Record<string, number>;
  geoData: Array<{ city: string; country: string; count: number }>;
  peakHour: { hour: number; count: number };
  peakDay: { day: string; count: number };
}

const COLORS = ['#2563EB', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

export default function AdvancedAnalyticsPage() {
  const params = useParams();
  const qrCodeId = params.qrCodeId as string;
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeName, setQrCodeName] = useState('');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAnalytics();
  }, [qrCodeId]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const url = new URL(`/api/analytics/advanced/${qrCodeId}`, window.location.origin);
      url.searchParams.set('startDate', new Date(startDate).toISOString());
      url.searchParams.set('endDate', new Date(endDate).toISOString());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch analytics');
      
      const data = await res.json();
      setAnalytics(data.analytics);
      setQrCodeName(data.qrCode?.name || 'QR Code');
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportData(format: 'pdf' | 'csv' | 'csv-timeseries') {
    try {
      const url = new URL(`/api/analytics/export/${qrCodeId}`, window.location.origin);
      url.searchParams.set('format', format);
      url.searchParams.set('startDate', new Date(startDate).toISOString());
      url.searchParams.set('endDate', new Date(endDate).toISOString());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `analytics-${qrCodeName}.${format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">No analytics data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">{qrCodeName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => exportData('pdf')} 
            variant="outline"
            aria-label="Export analytics as PDF"
          >
            Export PDF
          </Button>
          <Button 
            onClick={() => exportData('csv')} 
            variant="outline"
            aria-label="Export raw scan data as CSV"
          >
            Export CSV
          </Button>
          <Button 
            onClick={() => exportData('csv-timeseries')} 
            variant="outline"
            aria-label="Export time series data as CSV"
          >
            Export Time Series
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Date Range Filter</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Select start date for analytics"
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Select end date for analytics"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchAnalytics} className="w-full">
              Apply Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6" role="region" aria-label="Analytics summary">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <p className="text-3xl font-bold" aria-label={`Total scans: ${analytics.totalScans}`}>
            {analytics.totalScans.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Unique Users</p>
          <p className="text-3xl font-bold" aria-label={`Unique users: ${analytics.uniqueUsers}`}>
            {analytics.uniqueUsers.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Peak Hour</p>
          <p className="text-3xl font-bold" aria-label={`Peak hour: ${analytics.peakHour.hour}:00 with ${analytics.peakHour.count} scans`}>
            {analytics.peakHour.hour}:00
          </p>
          <p className="text-xs text-muted-foreground">{analytics.peakHour.count} scans</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Peak Day</p>
          <p className="text-3xl font-bold" aria-label={`Peak day: ${analytics.peakDay.day} with ${analytics.peakDay.count} scans`}>
            {analytics.peakDay.day}
          </p>
          <p className="text-xs text-muted-foreground">{analytics.peakDay.count} scans</p>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Scans Over Time</h3>
        <div role="img" aria-label="Line chart showing scans over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                aria-label="Date"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                aria-label="Number of scans"
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2563EB" 
                strokeWidth={2}
                name="Scans"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Text alternative for accessibility */}
        <div className="sr-only">
          Time series data: {analytics.timeSeriesData.map(d => 
            `${d.date}: ${d.count} scans`
          ).join(', ')}
        </div>
      </Card>

      {/* Hourly Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Scans by Hour of Day</h3>
        <div role="img" aria-label="Bar chart showing scans by hour of day">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.scansByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour"
                tick={{ fontSize: 12 }}
                aria-label="Hour of day"
                label={{ value: 'Hour (24h format)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                aria-label="Number of scans"
              />
              <Tooltip />
              <Bar dataKey="count" fill="#7C3AED" name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only">
          Hourly distribution: {analytics.scansByHour.map(h => 
            `Hour ${h.hour}: ${h.count} scans`
          ).join(', ')}
        </div>
      </Card>

      {/* Day of Week Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Scans by Day of Week</h3>
        <div role="img" aria-label="Bar chart showing scans by day of week">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.scansByDayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day"
                tick={{ fontSize: 12 }}
                aria-label="Day of week"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                aria-label="Number of scans"
              />
              <Tooltip />
              <Bar dataKey="count" fill="#EC4899" name="Scans" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only">
          Weekly distribution: {analytics.scansByDayOfWeek.map(d => 
            `${d.day}: ${d.count} scans`
          ).join(', ')}
        </div>
      </Card>

      {/* Device & Browser Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Device Types</h3>
          <div role="img" aria-label="Pie chart showing device type distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.deviceStats).map(([name, value]) => ({ 
                    name, 
                    value 
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(analytics.deviceStats).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Accessible data table */}
          <table className="w-full mt-4 text-sm" aria-label="Device type statistics">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Device</th>
                <th className="text-right p-2">Scans</th>
                <th className="text-right p-2">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.deviceStats).map(([device, count]) => (
                <tr key={device} className="border-b">
                  <td className="p-2">{device}</td>
                  <td className="text-right p-2">{count as number}</td>
                  <td className="text-right p-2">
                    {((count as number / analytics.totalScans) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Browsers</h3>
          <div role="img" aria-label="Pie chart showing browser distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.browserStats).map(([name, value]) => ({ 
                    name, 
                    value 
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(analytics.browserStats).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Accessible data table */}
          <table className="w-full mt-4 text-sm" aria-label="Browser statistics">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Browser</th>
                <th className="text-right p-2">Scans</th>
                <th className="text-right p-2">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.browserStats).map(([browser, count]) => (
                <tr key={browser} className="border-b">
                  <td className="p-2">{browser}</td>
                  <td className="text-right p-2">{count as number}</td>
                  <td className="text-right p-2">
                    {((count as number / analytics.totalScans) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Geographic Data */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Top Locations</h3>
        {analytics.geoData.length > 0 ? (
          <div className="space-y-2" role="list" aria-label="Top scanning locations">
            {analytics.geoData.slice(0, 10).map((location, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                role="listitem"
              >
                <span className="font-medium">
                  {index + 1}. {location.city}, {location.country}
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {location.count} {location.count === 1 ? 'scan' : 'scans'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No geographic data available
          </p>
        )}
      </Card>
    </div>
  );
}
