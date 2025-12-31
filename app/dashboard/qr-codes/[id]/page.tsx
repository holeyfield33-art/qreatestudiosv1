'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useFeatureAccess } from '@/lib/hooks/use-feature-access';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  BarChart3,
  Calendar,
  Eye,
  QrCode as QrCodeIcon
} from 'lucide-react';
import Link from 'next/link';

function QRDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function QRDetailPage() {
  const router = useRouter();
  const params = useParams();
  const qrId = params.id as string;
  const { features, isLoading: featuresLoading } = useFeatureAccess();
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (qrId) {
      fetchQRCode();
    }
  }, [qrId]);

  async function fetchQRCode() {
    try {
      const res = await fetch(`/api/qr/${qrId}`);
      const data = await res.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
        // Generate QR code preview
        generateQRPreview(data.qrCode);
      } else {
        toast.error('QR code not found');
        router.push('/dashboard/qr-codes');
      }
    } catch (error) {
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  }

  async function generateQRPreview(qr: any) {
    try {
      // Use qrcode library client-side
      const QRCode = (await import('qrcode')).default;
      const shortUrl = `${window.location.origin}/${qr.shortCode}`;
      const dataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      // Silently fail - QR preview is non-critical
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') console.error('Failed to generate QR preview:', error);
        }
      }
    }
  }

  async function handleDownload(format: 'png' | 'svg') {
    try {
      const res = await fetch(`/api/qr/${qrId}/download?format=${format}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qrCode.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('QR code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/qr/${qrId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('QR code deleted');
        router.push('/dashboard/qr-codes');
      } else {
        toast.error('Failed to delete QR code');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  }

  function copyShortUrl() {
    const shortUrl = `${window.location.origin}/${qrCode.shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short URL copied to clipboard');
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <QRDetailSkeleton />
      </motion.div>
    );
  }

  if (!qrCode) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <QrCodeIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">QR Code not found</p>
        <Link href="/dashboard/qr-codes">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to QR Codes
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{qrCode.name}</h1>
            <p className="text-muted-foreground">{qrCode.description}</p>
          </div>
        </div>
        <Badge variant={qrCode.isActive ? 'default' : 'secondary'}>
          {qrCode.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Preview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">QR Code Preview</h2>
          <div className="flex justify-center bg-white p-6 rounded-lg border mb-4">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR code for ${qrCode.name}`} 
                className="w-64 h-64"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-muted rounded">
                <QrCodeIcon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleDownload('png')} 
              className="flex-1"
              aria-label="Download as PNG"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              PNG
            </Button>
            <Button 
              onClick={() => handleDownload('svg')} 
              variant="outline" 
              className="flex-1"
              aria-label="Download as SVG"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              SVG
            </Button>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p className="font-medium">{qrCode.type}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Short URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/${qrCode.shortCode}`}
                  readOnly
                  className="font-mono text-sm"
                  aria-label="Short URL"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyShortUrl}
                  aria-label="Copy short URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => window.open(`/${qrCode.shortCode}`, '_blank')}
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Destination URL</Label>
              <p className="font-medium break-all">{qrCode.redirectUrl}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  Total Scans
                </Label>
                <p className="text-2xl font-bold">{qrCode.scanCount}</p>
              </div>
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Created
                </Label>
                <p className="text-sm">{new Date(qrCode.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {qrCode.maxScans && (
              <div>
                <Label className="text-muted-foreground">Max Scans</Label>
                <p className="font-medium">{qrCode.maxScans}</p>
              </div>
            )}
            {qrCode.expiresAt && (
              <div>
                <Label className="text-muted-foreground">Expires</Label>
                <p className="font-medium">{new Date(qrCode.expiresAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Analytics */}
      {qrCode.analytics && qrCode.analytics.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Scans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Device</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {qrCode.analytics.slice(0, 10).map((scan: any) => (
                  <tr key={scan.id}>
                    <td className="px-4 py-2 text-sm">
                      {new Date(scan.scannedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm">{scan.device || 'Unknown'}</td>
                    <td className="px-4 py-2 text-sm">{scan.location || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {/* AI Optimize - Pro+ */}
          <Button 
            variant="default"
            onClick={() => {
              if (features.canUseAIOptimization) {
                router.push(`/dashboard/qr-codes/${qrCode.id}/optimize`);
              } else {
                router.push('/pricing');
              }
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            disabled={featuresLoading}
          >
            <span className="mr-2" aria-hidden="true">🤖</span>
            AI Optimize
            {!features.canUseAIOptimization && <Badge className="ml-2" variant="secondary">Pro</Badge>}
          </Button>

          {/* Advanced Analytics - Pro+ */}
          <Button 
            variant="outline"
            onClick={() => {
              if (features.canAccessAdvancedAnalytics) {
                router.push(`/dashboard/analytics/advanced/${qrCode.id}`);
              } else {
                router.push('/pricing');
              }
            }}
            disabled={featuresLoading}
          >
            <span className="mr-2" aria-hidden="true">📊</span>
            Advanced Analytics
            {!features.canAccessAdvancedAnalytics && <Badge className="ml-2" variant="secondary">Pro</Badge>}
          </Button>

          {/* Edit */}
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/qr-codes/${qrCode.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
            Edit
          </Button>

          {/* Basic Analytics */}
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/analytics?qr=${qrCode.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
            View Analytics
          </Button>

          {/* Delete */}
          <Button 
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Delete QR Code</h2>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this QR code? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </motion.div>
  );
}
