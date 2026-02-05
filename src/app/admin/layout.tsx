
'use client';

import { AdminSidebar } from '@/components/AdminSidebar';
import { useUser } from '@/firebase';
import { 
  Home,
  ShoppingCart,
  ShoppingBag,
  Layers,
  Tags,
  TicketPercent,
  Link as LinkIcon,
  Users,
  BarChart3,
  CreditCard,
  Palette,
  PiggyBank,
  Settings,
  X,
  Command,
  ArrowLeft,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { name: 'Home', href: '/admin/dashboard', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Collections', href: '/admin/collections', icon: Layers },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
  { name: 'Create Link', href: '/admin/create-link', icon: LinkIcon },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Theme', href: '/admin/customization', icon: Palette },
  { name: 'Revenue', href: '/admin/fee-optimization', icon: PiggyBank, role: 'owner' },
  { name: 'Global', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, userRole } = useUser();
  const pathname = usePathname();
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const effectiveRole = user?.email === 'hk8913114@gmail.com' ? 'owner' : userRole;
  const isAuthorized = effectiveRole === 'owner' || effectiveRole === 'store admin';

  // Handle click outside to close FAB
  useEffect(() => {
    if (!isFabExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsFabExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFabExpanded]);

  // Close FAB on navigation
  useEffect(() => {
    setIsFabExpanded(false);
  }, [pathname]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-6 pt-24">
        <div className="bg-destructive/10 p-4 rounded-full">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-secondary">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          This area is reserved for Vridhira Marketplace administrators. 
          If you believe this is an error, please contact the platform owner.
        </p>
        <Link href="/">
          <Button variant="default" className="bg-primary hover:bg-primary/90 rounded-full px-8">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background pt-20 overflow-x-hidden relative">
      {/* Sidebar - Fixed on Desktop */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area - Adjusted Margin based on Sidebar state */}
      <main className={cn(
        "flex-1 min-w-0 bg-background/40 backdrop-blur-sm p-4 md:p-8 lg:p-12 animate-in fade-in duration-700 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* Admin Command FAB - Mobile Only */}
      <div 
        ref={fabRef}
        className={cn(
          "fixed bottom-6 right-6 z-[60] md:hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isFabExpanded ? "w-[calc(100%-3rem)]" : "w-14 h-14"
        )}
      >
        <div 
          className={cn(
            "bg-white/40 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
            isFabExpanded ? "p-6 max-h-[600px] opacity-100" : "p-0 max-h-14 h-14 opacity-100"
          )}
        >
          {/* Expanded Grid Content */}
          <div className={cn(
            "grid grid-cols-4 gap-4 transition-all duration-500 ease-out",
            isFabExpanded ? "opacity-100 translate-y-0 delay-100" : "opacity-0 translate-y-10 pointer-events-none"
          )}>
            <div className="col-span-4 flex items-center justify-between mb-4 border-b border-black/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white animate-artisanal-rotation">
                  <Command className="h-4 w-4" />
                </div>
                <span className="font-headline font-black text-secondary tracking-tight">Admin Terminal</span>
              </div>
              <Link href="/shop" className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                <ArrowLeft className="h-3 w-3" /> Shop
              </Link>
            </div>

            {adminNavItems.map((item) => {
              if (item.role && item.role !== effectiveRole) return null;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-300",
                    isActive ? "bg-primary text-white shadow-lg scale-105" : "bg-white/20 text-secondary hover:bg-white/40"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "")} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-center">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Trigger Button (Floating State) */}
          <button 
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
              isFabExpanded ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            <div className="relative w-full h-full flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-glow" />
              <Command className={cn(
                "h-6 w-6 text-primary transition-transform duration-500 group-hover:scale-110",
                "animate-artisanal-rotation"
              )} />
            </div>
          </button>

          {/* Close Trigger (Expanded State) */}
          {isFabExpanded && (
            <button 
              onClick={() => setIsFabExpanded(false)}
              className="mt-6 w-full h-12 rounded-2xl bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center transition-colors animate-in fade-in zoom-in-95 duration-300"
            >
              <X className="h-5 w-5 text-secondary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
