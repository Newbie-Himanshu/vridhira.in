'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Menu,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const mainNavItems = [
  { label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Fee Optimizer', icon: Sparkles, href: '/admin/fee-optimization' },
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
  { label: 'Store Appearance', icon: Store, href: '/admin/customization' },
  { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const NavContent = ({ collapsed = false, isFloating = false }: { collapsed?: boolean, isFloating?: boolean }) => (
    <div className={cn("flex flex-col h-full", !isFloating && "bg-white")}>
      {/* Spacer for Navbar on Desktop fixed sidebar */}
      {!isFloating && <div className="hidden lg:block h-20 shrink-0" />}
      
      <div className="flex-1 py-6 px-4 space-y-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                          isActive 
                            ? "bg-primary text-white shadow-lg" 
                            : isFloating ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : isFloating ? "text-white/60 group-hover:text-white" : "text-muted-foreground group-hover:text-foreground")} />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {isActive && !collapsed && <ChevronRight className="h-4 w-4" />}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="font-bold">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <div className={cn("pt-4 border-t space-y-1", isFloating ? "border-white/10" : "border-border")}>
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                          isActive 
                            ? "bg-primary text-white shadow-lg" 
                            : isFloating ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          collapsed && "justify-center px-0"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : isFloating ? "text-white/60 group-hover:text-white" : "text-muted-foreground group-hover:text-foreground")} />
                        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="font-bold">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      <div className={cn("p-4 border-t space-y-2", isFloating ? "border-white/10 bg-white/5" : "bg-muted/10")}>
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 transition-colors rounded-xl",
            isFloating ? "text-white/60 hover:text-red-400 hover:bg-white/10" : "text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:block border-r bg-white transition-all duration-300 shrink-0 relative",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn(
          "fixed top-0 bottom-0 border-r bg-white flex flex-col transition-all duration-300 z-30",
          isCollapsed ? "w-20" : "w-64"
        )}>
          <NavContent collapsed={isCollapsed} />
          
          {/* Toggle Button for Desktop */}
          <div className="absolute -right-4 bottom-8 z-50">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-full border bg-white shadow-md hover:bg-primary hover:text-white transition-all"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Glass Floating Window and FAB */}
      <div className="lg:hidden">
        {/* The Floating Window */}
        {isMobileMenuOpen && (
          <>
            {/* Click-outside listener (backdrop) */}
            <div 
              className="fixed inset-0 z-40 bg-black/5" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            
            <div className={cn(
              "fixed bottom-24 right-6 w-[85vw] max-w-[320px] h-[45vh] z-50 rounded-[2.5rem] overflow-hidden border border-white/20 bg-secondary/40 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300",
              "ring-1 ring-white/10"
            )}>
              <div className="p-6 pb-4 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary rounded-lg animate-artisanal-rotation" />
                      <span className="relative text-white font-bold text-sm">V</span>
                  </div>
                  <span className="font-headline font-bold text-white text-lg">Admin Menu</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                <NavContent isFloating />
              </div>
            </div>
          </>
        )}

        {/* The FAB */}
        <Button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 bg-secondary text-white hover:bg-secondary/90 border-none transition-all duration-300",
            isMobileMenuOpen ? "rotate-90 scale-90" : "animate-pulse-glow"
          )}
          size="icon"
        >
          {isMobileMenuOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </Button>
      </div>
    </>
  );
}
