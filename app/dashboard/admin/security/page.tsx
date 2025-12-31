'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SecurityReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch(`/api/security/reports?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Failed to load reports:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReportAction(reportId: string, status: string, action?: string) {
    try {
      const res = await fetch(`/api/security/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, action }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Report updated successfully');
        fetchReports();
      } else {
        toast.error(data.error || 'Failed to update report');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Report action error:', error);
      }
      toast.error('An error occurred');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-muted-foreground">Loading security reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Reports</h1>
        <p className="text-muted-foreground">Review and moderate reported content</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2" role="tablist" aria-label="Report status filter">
        {['pending', 'reviewed', 'dismissed', 'actioned'].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            variant={filter === status ? 'default' : 'outline'}
            className="min-h-[44px]"
            role="tab"
            aria-selected={filter === status}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4" role="list" aria-label="Security reports">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Card key={report.id} className="p-6" role="listitem">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{report.reportType}</h3>
                    <Badge 
                      variant={
                        report.status === 'pending' ? 'destructive' :
                        report.status === 'reviewed' ? 'default' :
                        'secondary'
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>QR Code:</strong> {report.qrCode?.name || 'Unknown'} 
                      ({report.qrCode?.shortCode})
                    </p>
                    <p>
                      <strong>URL:</strong> {report.qrCode?.redirectUrl}
                    </p>
                    {report.reporterIp && (
                      <p>
                        <strong>Reporter IP:</strong> {report.reporterIp}
                      </p>
                    )}
                    <p>
                      <strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {report.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <strong>Description:</strong> {report.description}
                    </div>
                  )}
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2 mt-4" role="group" aria-label="Report actions">
                  <Button
                    onClick={() => handleReportAction(report.id, 'dismissed')}
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => handleReportAction(report.id, 'actioned', 'deactivate')}
                    variant="default"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    Deactivate QR
                  </Button>
                  <Button
                    onClick={() => handleReportAction(report.id, 'actioned', 'ban')}
                    variant="destructive"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    Ban User
                  </Button>
                </div>
              )}

              {report.reviewedAt && (
                <div className="mt-4 text-xs text-muted-foreground">
                  Reviewed on {new Date(report.reviewedAt).toLocaleString()}
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No {filter} reports</p>
              <p className="text-sm">
                {filter === 'pending' 
                  ? 'All security reports have been reviewed' 
                  : `There are no ${filter} reports`}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
