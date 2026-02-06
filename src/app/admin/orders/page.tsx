'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Order } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Loader2, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Calendar as CalendarIcon,
  RotateCcw,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export default function OrdersManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let result = orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const orderDate = new Date(order.date);
      let matchesDate = true;
      
      if (dateFrom) {
        matchesDate = matchesDate && (isAfter(orderDate, startOfDay(dateFrom)) || orderDate.getTime() === startOfDay(dateFrom).getTime());
      }
      if (dateTo) {
        matchesDate = matchesDate && (isBefore(orderDate, endOfDay(dateTo)) || orderDate.getTime() === endOfDay(dateTo).getTime());
      }
      
      return matchesSearch && matchesDate;
    });

    return result.slice(0, parseInt(pageSize));
  }, [orders, searchQuery, dateFrom, dateTo, pageSize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary tracking-tight">Acquisitions Ledger</h1>
          <p className="text-muted-foreground italic">Monitor and fulfill every handcrafted dream across the globe.</p>
        </div>
      </div>

      {/* Advanced Filters Section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-secondary">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Order ID..." 
                  className="pl-10 h-11 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-secondary">Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 rounded-xl border-input",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>mm/dd/yyyy</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-secondary">Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 rounded-xl border-input",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>mm/dd/yyyy</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-4">
            <Button 
              variant="outline" 
              className="rounded-lg gap-2 h-10 border-input"
              onClick={clearFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-[80px] h-9 rounded-lg">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                  <TableHead className="px-8 h-14 font-bold text-secondary">Order ID</TableHead>
                  <TableHead className="h-14 font-bold text-secondary">Customer</TableHead>
                  <TableHead className="h-14 font-bold text-secondary">Date</TableHead>
                  <TableHead className="h-14 font-bold text-secondary">Total</TableHead>
                  <TableHead className="h-14 font-bold text-secondary">Status</TableHead>
                  <TableHead className="text-right px-8 h-14 font-bold text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="px-8 py-5 font-black text-primary">{order.id}</TableCell>
                    <TableCell className="font-bold text-secondary">{order.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {mounted ? new Date(order.date).toLocaleDateString() : '---'}
                    </TableCell>
                    <TableCell className="font-bold text-secondary">
                      {mounted ? `$${order.totalAmount.toFixed(2)}` : '---'}
                    </TableCell>
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
              </TableBody>
            </Table>
            
            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-primary/5 p-8 rounded-full mb-6">
                  <ShoppingBag className="h-16 w-16 text-primary/20" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">No All Orders</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  There are currently no all orders in your store.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
