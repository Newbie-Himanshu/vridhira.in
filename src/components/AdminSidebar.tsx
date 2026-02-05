'use client';

import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Tags, Palette, PiggyBank, Settings, Package2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { name: 'Products', href: '/admin/products', icon: <ShoppingBag className="h-4 w-4" /> },
  { name: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { name: 'Customers', href: '/admin/customers', icon: <Users className="h-4 w-4" /> },
  { name: 'Categories', href: '/admin/categories', icon: <Tags className="h-4 w-4" /> },
  { name: 'Customization', href: '/admin/customization', icon: <Palette className="h-4 w-4" /> },
  { name: 'Fee Optimization', href: '/admin/fee-optimization', icon: <PiggyBank className="h-4 w-4" />, roles: ['owner'] },
  { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { userRole, isUserLoading, user } = useUser();

  if (isUserLoading) {
    return <div className="p-4 w-64 border-r h-screen">Loading sidebar...</div>;
  }

  const effectiveRole = user?.email === 'hk8913114@gmail.com' ? 'owner' : userRole;

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 bg-background border-r p-4 flex flex-col shrink-0">
      <div className="flex items-center gap-2 px-2 py-4 border-b mb-4">
        <Package2 className="h-6 w-6 text-primary" />
        <span className="font-headline font-bold text-lg text-secondary">Vridhira Admin</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(effectiveRole as string)) {
            return null;
          }
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
