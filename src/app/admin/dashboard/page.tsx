'use client';

import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import { Product, Order, Customer } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Database,
  CheckCircle2
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS } from '@/lib/mock-data';

const chartData = [
  { month: "Jan", sales: 4500 },
  { month: "Feb", sales: 5200 },
  { month: "Mar", sales: 4800 },
  { month: "Apr", sales: 6100 },
  { month: "May", sales: 5900 },
  { month: "Jun", sales: 7200 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const supabase = createClient();
  const { user } = useUser();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('date', { ascending: false }).limit(10)
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);

      if (user) {
        const customerRes = await supabase.from('customers').select('*').eq('id', user.id).single();
        if (customerRes.data) setCustomer(customerRes.data as Customer);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user, supabase]);

  const stats = useMemo(() => {
    if (!orders) return { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const orderCount = orders.length;
    const avgOrderValue = totalRevenue / (orderCount || 1);
    return { totalRevenue, orderCount, avgOrderValue };
  }, [orders]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      // Seed Products
      for (const p of MOCK_PRODUCTS) {
        await supabase.from('products').upsert(p);
      }

      // Seed Customers
      for (const c of MOCK_CUSTOMERS) {
        await supabase.from('customers').upsert(c);
      }

      // Seed Orders
      for (const o of MOCK_ORDERS) {
        await supabase.from('orders').upsert({
          id: o.id,
          user_id: o.userId,
          customer_name: o.customerName,
          items: o.items,
          total_amount: o.totalAmount,
          status: o.status,
          created_at: o.date,
          platform_fee: o.platformFee
        });
      }

      toast({
        title: "Database Seeded",
        description: "Heritage catalog, demo transactions, and mock users have been added to your Supabase.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: "Could not populate database with initial data.",
      });
    } finally {
      setSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isOwner = customer?.role === 'owner';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <Badge variant="outline" className="bg-primary/10 text-primary border-none font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
            Live Marketplace Stats
          </Badge>
          <h1 className="text-4xl font-headline font-bold text-secondary">Dashboard Overview</h1>
          <p className="text-muted-foreground italic font-medium">Monitoring the pulse of artisanal heritage.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {isOwner && (
            <Button
              variant="outline"
              onClick={handleSeedData}
              disabled={seeding}
              className="flex-1 sm:flex-none h-10 md:h-12 lg:h-14 px-4 md:px-8 lg:px-12 rounded-full bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary font-bold text-xs md:text-sm lg:text-base"
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Seed Demo Data
            </Button>
          )}
          <Button className="flex-1 sm:flex-none h-10 md:h-12 lg:h-14 px-4 md:px-8 lg:px-12 rounded-full bg-secondary text-white shadow-lg text-xs md:text-sm lg:text-base font-bold">
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-secondary">
              {mounted ? `$${stats.totalRevenue.toLocaleString()}` : '---'}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Orders</CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-secondary">{stats.orderCount}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-bold">
              <TrendingUp className="h-3 w-3" />
              <span>+4 new today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Avg. Basket</CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-secondary">
              {mounted ? `$${stats.avgOrderValue.toFixed(2)}` : '---'}
            </div>
            <div className="flex items-center gap-1 text-xs text-destructive mt-2 font-bold">
              <TrendingDown className="h-3 w-3" />
              <span>-2.1% seasonality drop</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-secondary text-white rounded-3xl overflow-hidden artisan-pattern relative">
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Active Artisans</CardTitle>
            <Users className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black">142</div>
            <p className="text-xs mt-2 font-medium opacity-70">Empowering 24 categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="font-headline text-2xl">Revenue Performance</CardTitle>
            <CardDescription>Visualizing growth across heritage collections.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-8">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  className="font-bold text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                  className="font-bold text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">Top Treasures</CardTitle>
              <CardDescription>Most sought-after pieces.</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {products?.slice(0, 4).map((product, i) => (
              <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-primary border-2 border-transparent group-hover:border-primary/20 transition-all">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-secondary group-hover:text-primary transition-colors">{product.title}</p>
                  <Badge variant="outline" className="text-[10px] mt-1 px-2 border-primary/20 text-primary">{product.category}</Badge>
                </div>
                <div className="text-sm font-black text-secondary">
                  {mounted ? `$${product.price.toFixed(0)}` : '---'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 bg-muted/30 border-b">
          <div className="space-y-1">
            <CardTitle className="font-headline text-2xl">Latest Acquisitions</CardTitle>
            <CardDescription>Real-time transaction log for the marketplace.</CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline" className="gap-2 w-full sm:w-auto rounded-full px-6 border-primary/20 hover:bg-primary/10">
              View Ledger
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8">Order</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Customer</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 text-center">Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Date</TableHead>
                  <TableHead className="text-right font-black uppercase tracking-widest text-[10px] py-6 px-8">Investment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-black text-primary py-6 px-8">{order.id}</TableCell>
                    <TableCell className="font-bold text-secondary max-w-[150px] truncate">{order.customerName}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                        order.status === 'Delivered' ? "bg-green-100 text-green-700" :
                          order.status === 'Cancelled' ? "bg-destructive/10 text-destructive" : "bg-blue-100 text-blue-700"
                      )}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {mounted ? new Date(order.date).toLocaleDateString() : '---'}
                    </TableCell>
                    <TableCell className="text-right font-black text-secondary py-6 px-8">
                      {mounted ? `$${order.totalAmount.toFixed(2)}` : '---'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
