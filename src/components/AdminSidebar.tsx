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
import { useState } from 'react';
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

export function AdminSidebar() {
  const pathname = usePathname();
  const { userRole, isUserLoading, user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isUserLoading) {
    return (
      <aside className={cn(
        "sticky top-20 h-[calc(100vh-5rem)] bg-background border-r p-4 hidden md:flex flex-col shrink-0 transition-all duration-500",
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
        "sticky top-20 h-[calc(100vh-5rem)] bg-background border-r p-4 hidden md:flex flex-col shrink-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-40",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Toggle Button */}
        <Button 
          variant="secondary" 
          size="icon" 
          className={cn(
            "absolute -right-4 top-6 h-8 w-8 rounded-full border shadow-md bg-white hover:bg-muted z-50 transition-transform duration-500",
            isCollapsed ? "rotate-180" : ""
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Header/Logo */}
        <div className={cn(
          "flex items-center gap-3 px-2 py-6 border-b mb-6 group transition-all duration-500",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-primary/10 rounded-xl animate-artisanal-rotation" />
            <Command className="relative h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500 overflow-hidden">
              <span className="font-headline font-black text-lg text-secondary leading-none whitespace-nowrap">Command</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 whitespace-nowrap">Terminal v2.0</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 flex-1 scrollbar-none overflow-y-auto overflow-x-hidden px-1">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(effectiveRole as string)) {
              return null;
            }
            const isActive = pathname === item.href;
            
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 hover:translate-x-1 group",
                  isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
                  isCollapsed && "px-0 justify-center"
                )}
              >
                <div className={cn("shrink-0 transition-transform duration-300", isCollapsed ? "scale-110" : "group-hover:scale-110")}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-4 duration-500 whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-secondary text-white font-bold rounded-xl border-none shadow-2xl ml-2 px-4 py-2">
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
              <TooltipContent side="right" className="bg-primary text-white font-bold rounded-xl border-none shadow-2xl ml-2 px-4 py-2">
                Back to Shop
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/shop">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="whitespace-nowrap">Back to Shop</span>
              </button>
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
