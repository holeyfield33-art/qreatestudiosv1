'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { QRCardSkeleton } from '@/components/loading/qr-card-skeleton';
import { EmptyQRCodes } from '@/components/empty-states/empty-qr-codes';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRCodesPage() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQRCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (_error) {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">QR Codes</h1>
          <p className="text-sm text-muted-foreground">Manage your QR codes</p>
        </div>
        <Button onClick={() => router.push('/dashboard/qr-codes/create')} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create QR Code
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <QRCardSkeleton />
          <QRCardSkeleton />
          <QRCardSkeleton />
        </div>
      ) : qrCodes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmptyQRCodes />
        </motion.div>
      ) : (
        <motion.div 
          className="border rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
                <AnimatePresence mode="popLayout">
                  {qrCodes.map((qr, index) => (
                    <motion.tr
                      key={qr.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="hover:bg-muted/50 transition-colors duration-150"
                    >
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
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
