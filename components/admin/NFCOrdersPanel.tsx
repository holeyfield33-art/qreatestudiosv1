'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Package,
  Truck,
  Copy,
  Check,
  Printer,
  Search,
  Filter,
} from 'lucide-react';
import { getProductById } from '@/lib/types/nfc-products';

interface NFCOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  specifications: any;
  shippingAddress: any;
  customerEmail: string | null;
  customerPhone: string | null;
  trackingNumber: string | null;
  User: {
    name: string | null;
    email: string | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-blue-100 text-blue-800',
  encoding: 'bg-yellow-100 text-yellow-800',
  encoded: 'bg-purple-100 text-purple-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
};

export function NFCOrdersPanel() {
  const [orders, setOrders] = useState<NFCOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<NFCOrder | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/admin/orders/nfc');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        toast.error('Failed to load NFC orders');
      }
    } catch (_error) {
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (_error) {
      toast.error('Error updating order');
    } finally {
      setUpdating(false);
    }
  }

  async function markAsShipped(orderId: string, tracking: string) {
    if (!tracking.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: tracking }),
      });

      if (res.ok) {
        toast.success('Order marked as shipped and customer notified');
        setTrackingDialogOpen(false);
        setTrackingNumber('');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast.error('Failed to mark as shipped');
      }
    } catch (_error) {
      toast.error('Error marking as shipped');
    } finally {
      setUpdating(false);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.User?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-8">Loading NFC orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="encoding">Encoding</SelectItem>
              <SelectItem value="encoded">Encoded</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No NFC orders found</p>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const specs = order.specifications as any;
            const items = specs.items || [];
            const encodeUrl = specs.encodeUrl || '';
            const address = order.shippingAddress as any;

            return (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.User?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Encode URL - Highlighted */}
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          🔗 ENCODE URL
                        </Label>
                        <code className="text-sm font-mono font-semibold break-all">
                          {encodeUrl}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(encodeUrl, 'Encode URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>

                  {/* Products */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      📦 PRODUCTS
                    </Label>
                    <div className="space-y-2">
                      {items.map((item: any, idx: number) => {
                        const product = getProductById(item.productId);
                        return (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>
                              {item.quantity}x {product?.name || item.productId}
                              {item.designFileUrl && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Custom Design
                                </Badge>
                              )}
                            </span>
                            {item.designFileUrl && (
                              <a
                                href={item.designFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                View Design
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      📍 SHIP TO
                    </Label>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{address.name}</div>
                      <div>{address.line1}</div>
                      {address.line2 && <div>{address.line2}</div>}
                      <div>
                        {address.city}, {address.state} {address.zip}
                      </div>
                      <div>{address.country}</div>
                      {address.phone && <div>📞 {address.phone}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const formatted = `${address.name}\n${address.line1}\n${address.line2 ? address.line2 + '\n' : ''}${address.city}, ${address.state} ${address.zip}\n${address.country}${address.phone ? '\n' + address.phone : ''}`;
                        copyToClipboard(formatted, 'Shipping address');
                      }}
                      className="mt-2"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {order.status === 'paid' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'encoding')}
                        disabled={updating}
                        size="sm"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Mark as Encoding
                      </Button>
                    )}
                    
                    {order.status === 'encoding' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'encoded')}
                        disabled={updating}
                        size="sm"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Encoded
                      </Button>
                    )}
                    
                    {(order.status === 'encoded' || order.status === 'encoding') && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingDialogOpen(true);
                        }}
                        disabled={updating}
                        size="sm"
                        variant="default"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Mark as Shipped
                      </Button>
                    )}

                    {order.trackingNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(order.trackingNumber!, 'Tracking number')}
                      >
                        Tracking: {order.trackingNumber}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Label
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Shipped</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the tracking number. Customer will be notified via email automatically.
            </p>
            
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                placeholder="1Z999AA10123456784"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTrackingDialogOpen(false);
                setTrackingNumber('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && markAsShipped(selectedOrder.id, trackingNumber)}
              disabled={!trackingNumber.trim() || updating}
            >
              {updating ? 'Processing...' : 'Mark as Shipped'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
