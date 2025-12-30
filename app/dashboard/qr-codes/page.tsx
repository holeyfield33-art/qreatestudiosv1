'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Plus, Search } from 'lucide-react';

export default function QRCodesPage() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQRCodes();
  }, [search]);

  async function fetchQRCodes() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/qr?${params}`);
      const data = await res.json();
      
      if (data.qrCodes) {
        setQrCodes(data.qrCodes);
      }
    } catch (error) {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground">Manage your QR codes</p>
        </div>
        <Button onClick={() => router.push('/dashboard/qr-codes/create')}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create QR Code
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search QR codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search QR codes"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : qrCodes.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <p className="text-lg font-medium mb-2">No QR codes yet</p>
          <p className="text-muted-foreground mb-4">Create your first QR code to get started</p>
          <Button onClick={() => router.push('/dashboard/qr-codes/create')}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Create Your First QR Code
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Scans</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {qrCodes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{qr.name}</td>
                    <td className="px-4 py-3 text-sm">{qr.type}</td>
                    <td className="px-4 py-3 text-sm">{qr.scanCount}</td>
                    <td className="px-4 py-3">
                      <Badge variant={qr.isActive ? 'default' : 'secondary'}>
                        {qr.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(qr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/qr-codes/${qr.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
