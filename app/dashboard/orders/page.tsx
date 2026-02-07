'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, CreditCard } from 'lucide-react';
import { NFCOrdersPanel } from '@/components/admin/NFCOrdersPanel';

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all print and NFC product orders
        </p>
      </div>

      <Tabs defaultValue="nfc" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="nfc" className="gap-2">
            <CreditCard className="h-4 w-4" />
            NFC Orders
          </TabsTrigger>
          <TabsTrigger value="print" className="gap-2">
            <Package className="h-4 w-4" />
            Print Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nfc">
          <NFCOrdersPanel />
        </TabsContent>

        <TabsContent value="print">
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Print Orders Coming Soon</h3>
            <p className="text-muted-foreground">
              Print order management will be available in a future update.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
