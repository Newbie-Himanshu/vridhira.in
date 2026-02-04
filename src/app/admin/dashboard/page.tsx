
"use client";

import { MOCK_ORDERS, MOCK_PRODUCTS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShoppingCart, IndianRupee, TrendingUp, Package, Wand2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const totalRevenue = MOCK_ORDERS.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalFees = MOCK_ORDERS.reduce((acc, order) => acc + order.platformFee, 0);
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'Pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your artisan marketplace and oversee growth.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/fee-optimization">
            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
              <Wand2 className="h-4 w-4" />
              Fee Optimizer
            </Button>
          </Link>
          <Button className="bg-secondary">Export Reports</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">${totalFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average 10% take rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{MOCK_ORDERS.length}</div>
            <p className="text-xs text-muted-foreground">{pendingOrders} awaiting fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{MOCK_PRODUCTS.length}</div>
            <p className="text-xs text-muted-foreground">Across 5 craft categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Orders</CardTitle>
          <CardDescription>A summary of the latest transactions on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Platform Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-primary">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'} className={order.status === 'Delivered' ? 'bg-green-100 text-green-800 border-none' : ''}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-right font-bold text-secondary">${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${order.platformFee.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
