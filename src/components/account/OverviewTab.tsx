'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowRight, 
  Truck, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Home, 
  Heart,
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

const OverviewTab = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stats = [
    { label: 'Active Orders', value: '1', sub: 'Estimated delivery tomorrow', icon: Package, color: 'bg-blue-500' },
    { label: 'Total Support', value: '$1,245.00', sub: 'Spent to support local artisans', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Messages', value: '3', sub: 'From 2 active artisans', icon: MessageSquare, color: 'bg-primary' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-secondary">Welcome back, Elena.</h1>
        <p className="text-muted-foreground text-lg italic">Your curations are making a difference across 4 heritage states.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 rounded-[2rem] border-none shadow-xl bg-white/40 hover:bg-white/60 transition-all duration-500 group">
            <div className="flex flex-col gap-4">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black text-secondary">{mounted ? stat.value : '---'}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Recent Order */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold text-secondary">Recent Order</h3>
            <Link href="/account?tab=orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">View All History <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="bg-white/40 rounded-[2.5rem] p-6 border border-white/20 shadow-xl flex flex-col gap-6 group hover:bg-white/60 transition-all">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Shipped</Badge>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Order #8492-33 • Oct 24, 2023</span>
              </div>
              <Truck className="h-4 w-4 text-muted-foreground opacity-40" />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-inner border border-black/5 shrink-0">
                <Image src="https://picsum.photos/seed/pot1/200" alt="Product" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-secondary truncate">Ceramic Vase - Terracotta Series</h4>
                <p className="text-xs text-muted-foreground mt-1">Sold by: <span className="text-primary font-bold">Studio Clay</span></p>
                <p className="text-lg font-black text-secondary mt-2">${mounted ? '125.00' : '---'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="rounded-xl h-11 bg-secondary text-white font-bold text-xs">Track Package</Button>
              <Button variant="outline" className="rounded-xl h-11 border-black/10 hover:bg-black/5 text-xs font-bold">View Invoice</Button>
            </div>
          </div>
        </div>

        {/* Identity Snapshot */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold text-secondary">Identity Details</h3>
            <Button variant="link" className="text-primary p-0 h-auto font-bold text-xs uppercase tracking-widest">Edit</Button>
          </div>
          <div className="bg-white/40 rounded-[2.5rem] p-8 border border-white/20 shadow-xl flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Full Name</p>
                <p className="text-sm font-bold text-secondary">Elena Fisher</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Email</p>
                <p className="text-sm font-bold text-secondary">elena.fisher@example.com</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Phone</p>
                <p className="text-sm font-bold text-secondary">+1 (555) 012-3456</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-black/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Default Address</p>
                <Button variant="link" className="p-0 h-auto text-[9px] font-black uppercase text-primary">Manage</Button>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-bold text-secondary">Home Sanctuary</p>
                  <p>123 Artisan Way, Apt 4B</p>
                  <p>Portland, OR 97205, United States</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Artisans Preview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-headline font-bold text-secondary">Saved Artisans</h3>
          <Button variant="link" className="text-primary p-0 h-auto font-bold text-xs uppercase tracking-widest">View All</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Studio Clay', type: 'Ceramics', loc: 'Portland', init: 'SC' },
            { name: 'Nordic Woods', type: 'Woodwork', loc: 'Seattle', init: 'NW' },
            { name: 'Linen & Flax', type: 'Textiles', loc: 'Austin', init: 'LF' },
          ].map((artisan, i) => (
            <Link key={i} href="#" className="bg-white/40 rounded-3xl p-5 border border-white/20 shadow-lg flex items-center gap-4 hover:bg-white/60 transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">{artisan.init}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-secondary truncate">{artisan.name}</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{artisan.type} • {artisan.loc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default OverviewTab;
