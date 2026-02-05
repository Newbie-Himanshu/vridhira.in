
'use client';

import { 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Tags, 
  Palette, 
  PiggyBank, 
  Settings, 
  ArrowLeft,
  Command,
  Layers,
  TicketPercent,
  Link as LinkIcon,
  BarChart3,
  CreditCard,
  Home,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Home', href: '/admin/dashboard', icon: <Home className="h-4 w-4" /> },
  { name: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { name: 'Products', href: '/admin/products', icon: <ShoppingBag className="h-4 w-4" /> },
  { name: 'Collections', href: '/admin/collections', icon: <Layers className="h-4 w-4" /> },
  { name: 'Categories', href: '/admin/categories', icon: <Tags className="h-4 w-4" /> },
  { name: 'Coupons', href: '/admin/coupons', icon: <TicketPercent className="h-4 w-4" /> },
  { name: 'Create Link', href: '/admin/create-link', icon: <LinkIcon className="h-4 w-4" /> },
  { name: 'Customers', href: '/admin/customers', icon: <Users className="h-4 w-4" /> },
  { name: 'Payments', href: '/admin/payments', icon: <BarChart3 className="h-4 w-4" /> },
  { name: 'Billing', href: '/admin/billing', icon: <CreditCard className="h-4 w-4" /> },
  { name: 'Theme', href: '/admin/customization', icon: <Palette className="h-4 w-4" /> },
  { name: 'Revenue', href: '/admin/fee-optimization', icon: <PiggyBank className="h-4 w-4" />, roles: ['owner'] },
  { name: 'Global', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { userRole, isUserLoading, user } = useUser();

  if (isUserLoading) {
    return (
      <aside className={cn(
        "fixed left-0 top-20 h-[calc(100vh-5rem)] bg-background border-r p-4 hidden md:flex flex-col shrink-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex items-center justify-center h-full">
          <Command className="h-6 w-6 animate-pulse text-muted-foreground" />
        </div>
      </aside>
    );
  }

  const effectiveRole = user?.email === 'hk8913114@gmail.com' ? 'owner' : userRole;

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "fixed left-0 top-20 h-[calc(100vh-5rem)] bg-background border-r p-4 hidden md:flex flex-col shrink-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-40",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle Button */}
        <Button 
          variant="default" 
          size="icon" 
          className={cn(
            "absolute -right-4 top-6 h-8 w-8 rounded-full border-2 border-background shadow-lg bg-primary text-white hover:bg-primary/90 z-50 transition-transform duration-700",
            isCollapsed ? "rotate-180" : ""
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Header/Logo */}
        <div className={cn(
          "flex items-center gap-3 px-2 py-6 border-b mb-6 group transition-all duration-700",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-primary/10 rounded-xl animate-artisanal-rotation" />
            <span className="relative font-headline font-bold text-xl text-primary">V</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-700 overflow-hidden">
              <span className="font-headline font-black text-xl text-secondary leading-none whitespace-nowrap uppercase tracking-tighter">Vridhira</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 whitespace-nowrap opacity-60">Admin System</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 flex-1 scrollbar-none overflow-y-auto overflow-x-hidden px-1">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(effectiveRole as string)) {
              return null;
            }
            const isActive = pathname === item.href;
            
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 group relative",
                  isActive 
                    ? 'bg-primary/5 text-primary border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary border-l-4 border-transparent',
                  isCollapsed && "px-0 justify-center border-l-0"
                )}
              >
                <div className={cn("shrink-0 transition-transform duration-300", isCollapsed ? "scale-110" : "group-hover:scale-110")}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between animate-in fade-in slide-in-from-left-4 duration-700">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap">
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_rgba(224,124,84,0.6)]" />
                    )}
                  </div>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      {linkContent}
                      {isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(224,124,84,0.8)]" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-secondary text-white font-bold rounded-xl border-none shadow-2xl ml-2 px-4 py-2 text-[10px] uppercase tracking-widest">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.name}>{linkContent}</div>;
          })}
        </nav>

        {/* Footer Quick Action */}
        <div className="pt-6 border-t mt-6">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/shop">
                  <button className="w-full flex items-center justify-center p-3 rounded-2xl text-primary hover:bg-primary/10 transition-all duration-300">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-primary text-white font-bold rounded-xl border-none shadow-2xl ml-2 px-4 py-2 text-[10px] uppercase tracking-widest">
                Back to Shop
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/shop" className="w-full">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all duration-300 animate-in fade-in slide-in-from-left-2 group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="whitespace-nowrap">Marketplace</span>
              </button>
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
