
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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', icon: Home, href: '/admin/dashboard' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Collections', icon: Layers, href: '/admin/collections' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Coupons', icon: Ticket, href: '/admin/coupons' },
  { label: 'Create Link', icon: LinkIcon, href: '/admin/links' },
  { label: 'Customers', icon: Users, href: '/admin/customers' },
  { label: 'Payments', icon: CreditCard, href: '/admin/payments' },
  { label: 'Billing', icon: FileText, href: '/admin/billing' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white h-[calc(100vh-64px)] sticky top-16 flex flex-col">
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t bg-muted/30">
        <Link href="/admin/customization">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
            Store Settings
          </Button>
        </Link>
      </div>
    </aside>
  );
}
