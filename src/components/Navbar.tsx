
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Shop', icon: Store },
    { href: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-headline font-bold text-secondary">Vridhira</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Button variant="secondary" size="sm" className="bg-secondary text-secondary-foreground">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Cart
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 text-lg font-medium",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
          <Button variant="secondary" className="w-full">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Cart
          </Button>
        </div>
      )}
    </nav>
  );
}
