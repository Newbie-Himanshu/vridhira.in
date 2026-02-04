
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
  Loader2
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

  // Fetch real data counts where possible
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const categoriesQuery = useMemoFirebase(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  // Fallback to mock data for presentation if DB is empty
  const totalRevenue = MOCK_ORDERS.reduce((acc, order) => acc + order.totalAmount, 0);
  const avgOrderValue = totalRevenue / (MOCK_ORDERS.length || 1);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary">Overview</h1>
          <p className="text-muted-foreground">Welcome back. Here's what's happening in your marketplace today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">Last 30 Days</Button>
          <Button>Download Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">${totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_ORDERS.length}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+4 new today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">${avgOrderValue.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
              <TrendingDown className="h-3 w-3" />
              <span>-2.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Artisans</CardTitle>
            <Users className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>Across 24 categories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white min-w-0">
          <CardHeader>
            <CardTitle className="font-headline">Sales Performance</CardTitle>
            <CardDescription>Monthly revenue growth and trends.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="var(--color-sales)" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-none shadow-sm bg-white min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-headline">Top Products</CardTitle>
              <CardDescription>By revenue this month.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary shrink-0">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_PRODUCTS.slice(0, 4).map((product, i) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-sm font-bold shrink-0">${product.price.toFixed(2)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-sm bg-white min-w-0">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-xl">Recent Orders</CardTitle>
            <CardDescription>Review the latest customer transactions.</CardDescription>
          </div>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            View All Orders
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Order ID</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-primary">{order.id}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      "border-none px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
                      order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{order.date}</TableCell>
                  <TableCell className="text-right font-bold text-secondary whitespace-nowrap">${order.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
