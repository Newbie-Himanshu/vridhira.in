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
  Command,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ChevronRight
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const effectiveRole = user?.email === 'hk8913114@gmail.com' ? 'owner' : userRole;
  const isAuthorized = effectiveRole === 'owner' || effectiveRole === 'store admin';

  // Body scroll lock logic
  useEffect(() => {
    if (isFabExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFabExpanded]);

  // Close FAB on navigation
  useEffect(() => {
    setIsFabExpanded(false);
  }, [pathname]);

  // Gesture handle logic
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentY = e.targetTouches[0].clientY;
    const distance = currentY - touchStart;
    
    // Only close if swiped down significantly from the handle
    if (distance > 80) {
      setIsFabExpanded(false);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

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

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 min-w-0 bg-background/40 backdrop-blur-sm p-4 md:p-8 lg:p-12 animate-in fade-in duration-700 transition-all duration-700 ease-quint",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* Backdrop Dimmer - Mobile Only */}
      <div 
        className={cn(
          "fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm md:hidden transition-all duration-700 ease-quint",
          isFabExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsFabExpanded(false)}
      />

      {/* Admin Command FAB - Mobile Only with Symmetrical Animations */}
      <div 
        ref={fabRef}
        className={cn(
          "fixed bottom-6 z-[60] md:hidden transition-all duration-700 ease-quint",
          isFabExpanded 
            ? "left-6 right-6 w-[calc(100%-3rem)]" 
            : "right-6 w-14 h-14"
        )}
      >
        <div 
          className={cn(
            "bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden relative transition-all duration-700 ease-quint will-change-[height,width,padding]",
            isFabExpanded ? "p-6 h-[60vh] opacity-100" : "p-0 h-14 opacity-100"
          )}
        >
          {/* Expanded Content Wrapper - Symmetrical fade and scale */}
          <div className={cn(
            "flex flex-col h-full transition-all duration-700 ease-quint",
            isFabExpanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          )}>
            {/* Gesture Handle & Header */}
            <div 
              className="flex flex-col mb-6 shrink-0 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg animate-artisanal-rotation">
                    <Command className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline font-black text-secondary tracking-tight text-lg leading-none uppercase">Vridhira</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Registry Terminal</span>
                  </div>
                </div>
                <Link 
                  href="/shop" 
                  onClick={() => setIsFabExpanded(false)}
                  className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase bg-white/20 px-4 py-2 rounded-full tracking-widest shadow-sm border border-white/10"
                >
                  <ArrowLeft className="h-3 w-3" /> Shop
                </Link>
              </div>
            </div>

            {/* Scrollable Navigation List */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto scrollbar-none pb-4 px-1 space-y-2 overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {adminNavItems.map((item) => {
                if (item.role && item.role !== effectiveRole) return null;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsFabExpanded(false)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] group relative",
                      isActive ? "bg-white/20 border border-white/20 shadow-xl" : "bg-white/5 text-secondary hover:bg-white/15"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/10 text-primary"
                      )}>
                        <item.icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "")} />
                      </div>
                      <span className={cn(
                        "text-[11px] font-black uppercase tracking-[0.15em] leading-tight",
                        isActive ? "text-primary" : "text-secondary"
                      )}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(224,124,84,0.8)]" />
                      )}
                      <ChevronRight className={cn("h-4 w-4 transition-all opacity-20 group-hover:opacity-100", isActive && "opacity-100")} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Trigger Button (Floating State) - Reverse transition handle */}
          <button 
            onClick={() => setIsFabExpanded(true)}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-quint",
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
        </div>
      </div>
    </div>
  );
}
