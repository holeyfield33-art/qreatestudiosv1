'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PrintOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch('/api/print/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load orders:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Print Orders</h1>
          <p className="text-muted-foreground">
            Manage your print and physical product orders
          </p>
        </div>
        <Button size="lg" onClick={() => router.push('/dashboard/print-orders/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by ordering professional print materials for your QR codes and landing pages
            </p>
            <Button onClick={() => router.push('/dashboard/print-orders/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {order.productId === 'nfc-cards' && '💳'}
                      {order.productId === 'stickers' && '🏷️'}
                      {order.productId === 'flyers' && '📄'}
                      {order.productId === 'business-cards' && '🎴'}
                      {order.productId === 'posters' && '🖼️'}
                      {order.productId === 'table-tents' && '⛺'}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{order.productName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${order.price}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{order.size || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tracking</p>
                    <p className="font-medium">{order.trackingNumber || 'Pending'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
