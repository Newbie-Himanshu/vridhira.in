
'use client';

import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Order } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ShoppingBag, 
  ChevronRight, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

export default function OrdersManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('date', 'desc')), [db]);
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const orderRef = doc(db, 'orders', orderId);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    toast({
      title: "Order Updated",
      description: `Order ${orderId} status set to ${newStatus}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-secondary">Acquisitions Ledger</h1>
        <p className="text-muted-foreground">Monitor and fulfill every handcrafted dream across the globe.</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-muted/10 p-8 border-b">
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Active Orders
          </CardTitle>
          <CardDescription>Comprehensive log of all marketplace transactions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-8 font-bold">Order ID</TableHead>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Total</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right px-8 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/10">
                    <TableCell className="px-8 font-black text-primary">{order.id}</TableCell>
                    <TableCell className="font-bold text-secondary">{order.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                        order.status === 'Delivered' ? "bg-green-100 text-green-700" : 
                        order.status === 'Shipped' ? "bg-blue-100 text-blue-700" :
                        order.status === 'Cancelled' ? "bg-destructive/10 text-destructive" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        {order.status === 'Pending' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-blue-600 hover:bg-blue-50"
                            onClick={() => updateOrderStatus(order.id, 'Shipped')}
                            title="Mark as Shipped"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'Shipped' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-green-600 hover:bg-green-50"
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            title="Mark as Delivered"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-destructive hover:bg-destructive/5"
                            onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                            title="Cancel Order"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!orders || orders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Clock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-xl font-headline font-bold text-muted-foreground">No live transactions found.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
