'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AIOptimizationDialog } from '@/components/qr/AIOptimizationDialog';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import { downloadQRCode } from '@/lib/utils/qr-download';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
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
  QrCode as QrCodeIcon,
  CreditCard,
  Share2
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
  const [_editing, _setEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [_qrDataUrl, setQrDataUrl] = useState<string>('');
  const [aiCredits, setAiCredits] = useState({ remaining: 0, plan: 'free' });

  useEffect(() => {
    if (qrId) {
      fetchQRCode();
      fetchAICredits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrId]);

  async function fetchAICredits() {
    try {
      const res = await fetch('/api/ai/credits');
      if (res.ok) {
        const data = await res.json();
        setAiCredits({ remaining: data.remaining, plan: data.plan });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch AI credits:', error);
      }
    }
  }

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
    } catch (_error) {
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

  async function handleDownload(format: 'png' | 'svg', size: number = 2048) {
    try {
      const filename = qrCode.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await downloadQRCode('.qr-code-container', filename, format, size);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Download error:', error);
      }
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
    } catch (_error) {
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
          <div className="flex justify-center mb-4">
            <QRCodeDisplay
              value={qrCode.redirectUrl || `${window.location.origin}/${qrCode.shortCode}`}
              size={300}
              fgColor={qrCode.style?.fgColor || '#000000'}
              bgColor={qrCode.style?.bgColor || '#FFFFFF'}
              level="M"
              includeMargin={true}
            />
          </div>
          
          {/* Download Options */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDownload('png', 512)} 
                className="flex-1"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                PNG (512px)
              </Button>
              <Button 
                onClick={() => handleDownload('png', 1024)} 
                variant="outline" 
                className="flex-1"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                PNG (1024px)
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDownload('png', 2048)} 
                variant="outline" 
                className="flex-1"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                PNG (2048px)
              </Button>
              <Button 
                onClick={() => handleDownload('svg')} 
                variant="outline" 
                className="flex-1"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                SVG
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={copyShortUrl}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copy Share Link
            </Button>
          </div>

          {/* NFC Product Order CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full mt-4 border-blue-200 hover:border-blue-300 hover:bg-blue-50 relative overflow-hidden group"
              onClick={() => router.push(`/dashboard/qr-codes/${qrCode.id}/order-nfc`)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <CreditCard className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">Get Physical NFC Card/Sticker</span>
            </Button>
          </motion.div>
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
              <Label className="text-muted-foreground text-sm font-medium">Short URL</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mt-1 hover:bg-gray-100 transition-colors">
                <span className="text-sm font-mono truncate flex-1 text-gray-700">
                  {window.location.origin.replace(/^https?:\/\//, '')}/{qrCode.shortCode}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={copyShortUrl}
                  className="flex-shrink-0 h-8 w-8 p-0"
                  aria-label="Copy short URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(`/${qrCode.shortCode}`, '_blank')}
                  className="flex-shrink-0 h-8 w-8 p-0"
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
          {/* AI Optimize Dialog */}
          {qrCode && (
            <AIOptimizationDialog
              qrCode={{
                id: qrCode.id,
                url: qrCode.targetUrl || qrCode.redirectUrl,
                name: qrCode.name,
                scans: qrCode.scanCount || 0,
              }}
              remainingCredits={aiCredits.remaining}
              plan={aiCredits.plan}
              onOptimizationComplete={() => {
                fetchAICredits();
                toast.success('Check the suggestions above!');
              }}
            />
          )}

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
            <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
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
