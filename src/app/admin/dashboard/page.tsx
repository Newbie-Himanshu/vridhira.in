'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { MOCK_ORDERS, MOCK_PRODUCTS } from '@/lib/mock-data';
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
  Sparkles
} from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

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
  const db = useFirestore();

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const totalRevenue = MOCK_ORDERS.reduce((acc, order) => acc + order.totalAmount, 0);
  const avgOrderValue = totalRevenue / (MOCK_ORDERS.length || 1);

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
          <Button variant="outline" className="flex-1 sm:flex-none rounded-full px-6 bg-white border-primary/20 hover:bg-primary/5">Last 30 Days</Button>
          <Button className="flex-1 sm:flex-none rounded-full px-8 bg-secondary text-white shadow-lg">Download Report</Button>
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
            <div className="text-3xl font-black text-secondary">${totalRevenue.toLocaleString()}</div>
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
            <div className="text-3xl font-black text-secondary">{MOCK_ORDERS.length}</div>
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
            <div className="text-3xl font-black text-secondary">${avgOrderValue.toFixed(2)}</div>
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
            {MOCK_PRODUCTS.slice(0, 4).map((product, i) => (
              <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-primary border-2 border-transparent group-hover:border-primary/20 transition-all">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-secondary group-hover:text-primary transition-colors">{product.title}</p>
                  <Badge variant="outline" className="text-[10px] mt-1 px-2 border-primary/20 text-primary">{product.category}</Badge>
                </div>
                <div className="text-sm font-black text-secondary">${product.price.toFixed(0)}</div>
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
          <Button variant="outline" className="gap-2 w-full sm:w-auto rounded-full px-6 border-primary/20 hover:bg-primary/10">
            View Ledger
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 px-8">Order</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Customer</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6 text-center">Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Date</TableHead>
                  <TableHead className="text-right font-black uppercase tracking-widest text-[10px] py-6 px-8">Investment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ORDERS.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-black text-primary py-6 px-8">{order.id}</TableCell>
                    <TableCell className="font-bold text-secondary max-w-[150px] truncate">{order.customerName}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                        order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">{order.date}</TableCell>
                    <TableCell className="text-right font-black text-secondary py-6 px-8">${order.totalAmount.toFixed(2)}</TableCell>
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
