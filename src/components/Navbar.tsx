
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, X, Home, Palette, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const { data: customer } = useDoc<Customer>(customerRef);

  const isAdmin = customer?.role === 'owner' || customer?.role === 'store admin';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Store },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard });
    navLinks.push({ href: '/admin/customization', label: 'Customize', icon: Palette });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center">
        {/* Left Section: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-headline font-bold text-secondary">Vridhira</span>
          </Link>
        </div>

        {/* Middle Section: Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center justify-center gap-6">
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
        </div>

        {/* Right Section: Cart, Auth, and Toggle */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Cart
            </Button>
            
            {user ? (
              <Button variant="secondary" size="sm" className="gap-2 bg-secondary text-secondary-foreground">
                <User className="h-4 w-4" />
                {customer?.firstName || 'Account'}
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm" className="bg-secondary text-secondary-foreground px-6">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
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
          <Button variant="ghost" className="w-full justify-start">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Cart
          </Button>
          {!user && (
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="secondary" className="w-full bg-secondary text-secondary-foreground">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
