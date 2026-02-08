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
  RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const MyOrdersTab = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const orders = [
    { id: '#8492-33', date: 'Oct 24, 2023', status: 'Shipped', total: '125.00', items: 1, img: 'https://picsum.photos/seed/pot1/200' },
    { id: '#8411-09', date: 'Sep 12, 2023', status: 'Delivered', total: '450.00', items: 3, img: 'https://picsum.photos/seed/saree1/200' },
    { id: '#8302-15', date: 'Aug 05, 2023', status: 'Cancelled', total: '85.00', items: 1, img: 'https://picsum.photos/seed/elephant1/200' },
  ];

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

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-white/20 shadow-xl hover:bg-white/60 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-inner border border-black/5 shrink-0">
                  <Image src={order.img} alt="Order Thumbnail" fill className="object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">{order.id}</span>
                  <h4 className="text-lg font-bold text-secondary">
                    {order.items} {order.items === 1 ? 'Treasure' : 'Treasures'} Acquired
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Ordered {mounted ? order.date : '---'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-6 md:pt-0">
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Value</p>
                  <p className="text-xl font-black text-secondary">${mounted ? order.total : '---'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn(
                    "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                    order.status === 'Delivered' ? "bg-green-100 text-green-700" : 
                    order.status === 'Cancelled' ? "bg-destructive/10 text-destructive" : "bg-blue-100 text-blue-700"
                  )}>
                    {order.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary gap-1.5 px-3">
                    Details <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-black/5 flex flex-wrap gap-3">
              {order.status === 'Delivered' && (
                <Button className="rounded-xl h-10 bg-secondary text-white font-bold text-xs gap-2 px-6">
                  <RotateCcw className="h-3 w-3" /> Reorder Piece
                </Button>
              )}
              <Button variant="outline" className="rounded-xl h-10 border-black/10 hover:bg-black/5 text-xs font-bold px-6">Track Package</Button>
              <Button variant="ghost" className="rounded-xl h-10 text-xs font-bold text-muted-foreground px-6">Contact Artisan</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default MyOrdersTab;
