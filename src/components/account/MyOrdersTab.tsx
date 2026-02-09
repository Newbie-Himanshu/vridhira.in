'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const MyOrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const json = await res.json();
      setOrders(json.data || []);
    } catch (err) {
      setError('Could not load your orders instantly. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchOrders} variant="outline">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-end justify-between border-b border-black/5 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-secondary">Acquisition History</h2>
          <p className="text-muted-foreground italic">A registry of your contributions to the artisan heritage.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full">
          {orders.length} Records
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
        <Input
          placeholder="Search by order ID or product name..."
          className="h-14 pl-12 rounded-2xl bg-white/40 border-white/20 shadow-inner focus:ring-primary text-sm"
        />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/20">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-secondary">No orders yet</h3>
          <p className="text-muted-foreground text-sm">Your journey with us hasn't started yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
            const firstImage = order.items[0]?.image_url || 'https://picsum.photos/seed/placeholder/200';

            return (
              <div key={order.id} className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-white/20 shadow-xl hover:bg-white/60 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-inner border border-black/5 shrink-0">
                      <Image src={firstImage} alt="Order Thumbnail" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">#{order.id.slice(0, 8)}</span>
                      <h4 className="text-lg font-bold text-secondary">
                        {itemCount} {itemCount === 1 ? 'Treasure' : 'Treasures'} Acquired
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                          Ordered {mounted ? format(new Date(order.created_at), 'MMM dd, yyyy') : '---'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-6 md:pt-0">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Value</p>
                      <p className="text-xl font-black text-secondary">${order.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={order.status} />
                      <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary gap-1.5 px-3">
                        Details <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 flex flex-wrap gap-3">
                  {order.status === 'delivered' && (
                    <Button className="rounded-xl h-10 bg-secondary text-white font-bold text-xs gap-2 px-6">
                      <RotateCcw className="h-3 w-3" /> Reorder Piece
                    </Button>
                  )}
                  <Button variant="outline" className="rounded-xl h-10 border-black/10 hover:bg-black/5 text-xs font-bold px-6">Track Package</Button>
                  <Button variant="ghost" className="rounded-xl h-10 text-xs font-bold text-muted-foreground px-6">Contact Artisan</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();
  let className = "bg-blue-100 text-blue-700";

  if (normalizedStatus === 'delivered') className = "bg-green-100 text-green-700";
  if (normalizedStatus === 'cancelled') className = "bg-destructive/10 text-destructive";
  if (normalizedStatus === 'processing') className = "bg-yellow-100 text-yellow-700";

  return (
    <Badge className={cn("rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none", className)}>
      {status}
    </Badge>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default MyOrdersTab;
