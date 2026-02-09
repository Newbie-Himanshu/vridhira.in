'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
// import { Order } from '@/types/index'; // Using local interface to match DB exactly for now to avoid conflicts
import { Card, CardContent } from '@/components/ui/card';
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
  Search,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

// Define the exact shape we expect from Supabase + our mapping
interface AdminOrder {
  id: string;
  user_id: string;
  customerName: string;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: any[];
  platform_fee: number;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
}

export default function OrdersManagementPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [pageSize, setPageSize] = useState('10');

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);

    // Fetch orders with RLS (Admins can view all)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error fetching orders",
        description: error.message
      });
      setIsLoading(false);
      return;
    }

    if (data) {
      // Map Supabase fields
      const mappedOrders: AdminOrder[] = data.map((o: any) => ({
        id: o.id,
        user_id: o.user_id,
        // Extract customer name from shipping address or fallback to "Unknown"
        customerName: o.shipping_address?.fullName || 'Guest/Unknown',
        created_at: o.created_at,
        total_amount: o.total_amount,
        status: o.status,
        items: o.items || [],
        platform_fee: o.platform_fee,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        shipping_address: o.shipping_address
      }));
      setOrders(mappedOrders);
    }
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
      return;
    }

    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));

    toast({
      title: "Order Updated",
      description: `Order successfully marked as ${newStatus}.`,
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
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const orderDate = new Date(order.created_at);
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

  if (!mounted) return null;

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
        <Button onClick={() => fetchOrders()} variant="outline" size="sm" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Refresh
        </Button>
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
                  placeholder="Order ID or Customer Name..."
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
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
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
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
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
              <XCircle className="h-4 w-4" />
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
                  <TableHead className="h-14 font-bold text-secondary">Itms</TableHead>
                  <TableHead className="h-14 font-bold text-secondary">Status</TableHead>
                  <TableHead className="text-right px-8 h-14 font-bold text-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/10 transition-colors border-b last:border-0">
                    <TableCell className="px-8 py-5 font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-bold text-secondary">
                      <div className="flex flex-col">
                        <span>{order.customerName}</span>
                        {/* Optional: Add email if needed from join or extra fetch */}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold text-secondary">
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.items?.length || 0}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-blue-600 hover:bg-blue-50"
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            title="Mark as Processing"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-blue-600 hover:bg-blue-50"
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            title="Mark as Shipped"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-green-600 hover:bg-green-50"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            title="Mark as Delivered"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Always show Cancel if not delivered/cancelled */}
                        {['pending', 'processing'].includes(order.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-destructive hover:bg-destructive/5"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            title="Cancel Order"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
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
                <h3 className="text-2xl font-bold text-secondary mb-2">No Matches Found</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  {orders.length === 0 ? "No orders have been placed yet." : "Try adjusting your filters."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let styles = "bg-gray-100 text-gray-700";

  if (s === 'delivered') styles = "bg-green-100 text-green-700";
  else if (s === 'shipped') styles = "bg-blue-100 text-blue-700";
  else if (s === 'processing') styles = "bg-orange-100 text-orange-700";
  else if (s === 'cancelled') styles = "bg-red-100 text-red-700";
  else if (s === 'pending') styles = "bg-yellow-100 text-yellow-800";

  return (
    <Badge className={cn("rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none", styles)}>
      {status}
    </Badge>
  );
}
