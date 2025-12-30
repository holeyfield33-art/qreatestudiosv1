'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminPrintQueuePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/print-orders?status=${filter}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    try {
      const res = await fetch(`/api/print/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber }),
      });

      if (res.ok) {
        toast.success(`Order marked as ${status}`);
        fetchOrders();
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      toast.error('Error updating order');
    }
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const totalValue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          body {
            font-size: 12pt;
          }
          h1, h2, h3 {
            color: black !important;
          }
        }
      `}</style>

      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Print Order Queue</h1>
          <p className="text-muted-foreground">
            Manage and fulfill print orders from home
          </p>
        </div>
        <Button onClick={() => window.print()} className="min-h-[44px]">
          Print Batch Slips
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
          <p className="text-3xl font-bold text-orange-600" aria-label={`${pendingCount} pending orders`}>
            {pendingCount}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Processing</h3>
          <p className="text-3xl font-bold text-blue-600" aria-label={`${processingCount} orders in processing`}>
            {processingCount}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
          <p className="text-3xl font-bold" aria-label={`Total value $${totalValue.toFixed(2)}`}>
            ${totalValue.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-4 print:hidden">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter orders by status"
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="printed">Printed</option>
          <option value="shipped">Shipped</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12" role="status" aria-live="polite">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No orders in this status</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6 print:break-inside-avoid print:border-2 print:border-black">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={
                    order.status === 'pending'
                      ? 'bg-orange-500'
                      : order.status === 'shipped'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }
                >
                  {order.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                {/* Order Details */}
                <div>
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Product:</dt>
                      <dd className="font-medium">{order.productType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Quantity:</dt>
                      <dd className="font-medium">{order.quantity}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Size:</dt>
                      <dd className="font-medium">{order.specifications?.size}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Material:</dt>
                      <dd className="font-medium">{order.specifications?.material}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">QR Code:</dt>
                      <dd className="font-medium">{order.qrCode?.name}</dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <dt className="text-muted-foreground font-bold">Total:</dt>
                      <dd className="font-bold">${order.totalPrice.toFixed(2)}</dd>
                    </div>
                  </dl>

                  {order.specialInstructions && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200 print:bg-gray-100">
                      <p className="text-xs font-semibold text-yellow-800 mb-1 print:text-black">
                        Special Instructions:
                      </p>
                      <p className="text-sm">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2">Ship To:</h4>
                  <address className="not-italic text-sm bg-gray-50 p-4 rounded border-2 border-gray-300 print:bg-white print:border-black">
                    <p className="font-bold">{order.shippingAddress?.name}</p>
                    <p>{order.shippingAddress?.street}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                      {order.shippingAddress?.zip}
                    </p>
                    {order.shippingAddress?.phone && (
                      <p className="mt-2">
                        <a
                          href={`tel:${order.shippingAddress.phone}`}
                          className="text-blue-600 print:text-black"
                        >
                          {order.shippingAddress.phone}
                        </a>
                      </p>
                    )}
                    {order.customerEmail && (
                      <p className="mt-1">
                        <a
                          href={`mailto:${order.customerEmail}`}
                          className="text-blue-600 print:text-black text-xs"
                        >
                          {order.customerEmail}
                        </a>
                      </p>
                    )}
                  </address>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap print:hidden">
                {order.status === 'pending' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'processing')}
                    variant="outline"
                    className="min-h-[44px]"
                  >
                    Start Processing
                  </Button>
                )}
                {order.status === 'processing' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'printed')}
                    variant="outline"
                    className="min-h-[44px]"
                  >
                    Mark as Printed
                  </Button>
                )}
                {order.status === 'printed' && (
                  <Button
                    onClick={() => {
                      const tracking = prompt('Enter tracking number:');
                      if (tracking) {
                        updateOrderStatus(order.id, 'shipped', tracking);
                      }
                    }}
                    className="min-h-[44px]"
                  >
                    Mark as Shipped
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Download high-res QR for printing
                    window.open(`/api/qr/${order.qrCodeId}/download?format=pdf&dpi=300`);
                  }}
                  className="min-h-[44px]"
                >
                  Download QR (High-Res)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
