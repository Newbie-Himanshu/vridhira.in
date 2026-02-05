'use client';

import { 
  LayoutDashboard, 
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
  Home
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

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
  { name: 'Customization', href: '/admin/customization', icon: <Palette className="h-4 w-4" /> },
  { name: 'Fee Optimization', href: '/admin/fee-optimization', icon: <PiggyBank className="h-4 w-4" />, roles: ['owner'] },
  { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { userRole, isUserLoading, user } = useUser();

  if (isUserLoading) {
    return <div className="p-4 w-64 border-r h-screen hidden md:flex">Loading sidebar...</div>;
  }

  const effectiveRole = user?.email === 'hk8913114@gmail.com' ? 'owner' : userRole;

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 bg-background border-r p-4 hidden md:flex flex-col shrink-0 overflow-y-auto scrollbar-none">
      <div className="flex items-center gap-3 px-2 py-6 border-b mb-6 group">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-xl animate-artisanal-rotation" />
          <Command className="relative h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-black text-lg text-secondary leading-none">Command</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Terminal v2.0</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(effectiveRole as string)) {
            return null;
          }
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 hover:translate-x-1",
                isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t mt-6">
        <Link href="/shop">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>
        </Link>
      </div>
    </aside>
  );
}