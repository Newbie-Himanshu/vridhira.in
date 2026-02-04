
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Layers, 
  Tag, 
  Ticket, 
  Link as LinkIcon, 
  Users, 
  CreditCard, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Settings,
  Truck,
  Ship,
  Store,
  Bell,
  LogOut,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mainNavItems = [
  { label: 'Home', icon: Home, href: '/admin/dashboard' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Collections', icon: Layers, href: '/admin/collections' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Coupons', icon: Ticket, href: '/admin/coupons' },
  { label: 'Create Link', icon: LinkIcon, href: '/admin/links' },
  { label: 'Customers', icon: Users, href: '/admin/customers' },
  { label: 'Payments', icon: CreditCard, href: '/admin/payments' },
];

const secondaryNavItems = [
  { label: 'Billing', icon: FileText, href: '/admin/billing' },
  { label: 'Delivery Charges', icon: Truck, href: '/admin/delivery' },
  { label: 'Shipping Partners', icon: Ship, href: '/admin/shipping' },
  { label: 'Store', icon: Store, href: '/admin/customization' },
  { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const renderNavItems = (items: typeof mainNavItems) => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <TooltipProvider key={item.href} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {isActive && !isCollapsed && <ChevronRight className="h-4 w-4" />}
                  </div>
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="font-bold">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  return (
    <aside 
      className={cn(
        "fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] bg-white border-r transition-all duration-300 ease-in-out z-40 flex flex-col",
        isCollapsed ? (isMobile ? "w-0 -translate-x-full lg:w-16 lg:translate-x-0" : "w-16") : "w-64 translate-x-0"
      )}
    >
      {/* Mobile Toggle Trigger (when fully hidden) */}
      {isMobile && isCollapsed && (
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 rounded-full shadow-2xl z-50 h-12 w-12 lg:hidden bg-primary text-white hover:bg-primary/90"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      <div className="flex-1 py-6 px-4 space-y-4 overflow-y-auto scrollbar-hide overflow-x-hidden">
        {renderNavItems(mainNavItems)}
        <div className="pt-4 border-t">
          {renderNavItems(secondaryNavItems)}
        </div>
      </div>

      <div className="p-4 border-t bg-muted/10 space-y-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive transition-colors",
            isCollapsed && "justify-center px-0"
          )}
          onClick={() => console.log('Logout clicked')}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </Button>

        {/* The Arrow Toggle at the bottom */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="w-full h-10 flex items-center justify-center hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors border-t border-muted-foreground/10 pt-4"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Collapse Menu</span>
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
}
