'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, Home, User, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const { data: customer } = useDoc<Customer>(customerRef);

  const isAdmin = customer?.role === 'owner' || customer?.role === 'store admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Store },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard });
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background",
      isScrolled 
        ? "backdrop-blur-md h-16 shadow-sm border-border/50" 
        : "h-20 shadow-none border-transparent"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center relative">
        
        {/* Left Column: Logo & Brand */}
        <div className="flex-[1_0_0] flex justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 rotate-45 rounded-lg group-hover:rotate-90 transition-transform duration-500" />
                <span className="relative font-headline font-bold text-2xl text-primary">V</span>
            </div>
            <span className="text-xl md:text-2xl font-headline font-bold text-secondary hidden sm:inline-block tracking-tight">
              Vridhira
            </span>
          </Link>
        </div>

        {/* Center Column: Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-1 text-xs font-bold transition-all hover:text-primary tracking-widest uppercase",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Column: Actions */}
        <div className="flex-[1_0_0] flex justify-end items-center gap-1 sm:gap-4">
          
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-primary">
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart Button */}
          <Button variant="ghost" size="icon" className="relative group text-muted-foreground hover:text-primary" asChild>
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                0
              </span>
            </Link>
          </Button>

          {/* Sign In / Account (Desktop only - hidden when side menu toggle is present) */}
          <div className="hidden lg:block">
            {user ? (
              <Link href="/account">
                <Button variant="secondary" size="sm" className="gap-2 bg-secondary text-secondary-foreground hover:opacity-90 rounded-full px-5 h-10 border-none transition-all font-bold">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">
                      {customer?.firstName || 'Account'}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all rounded-full px-7 h-10 font-bold tracking-widest uppercase text-[11px]">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle (Below LG) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-secondary hover:bg-primary/5 rounded-full">
                  <Menu className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden border-none flex flex-col">
                <SheetHeader className="p-8 pb-4 text-left border-b bg-muted/30">
                  <SheetTitle className="font-headline text-3xl text-secondary flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">V</div>
                    Vridhira
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 px-8 py-10 space-y-8 overflow-y-auto">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Discover</p>
                        <div className="grid gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl transition-all",
                                        pathname === link.href 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                            : "bg-muted/50 text-secondary hover:bg-muted"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <link.icon className="h-5 w-5" />
                                        <span className="text-lg font-bold">{link.label}</span>
                                    </div>
                                    <ChevronRight className={cn("h-5 w-5 opacity-50", pathname === link.href && "opacity-100")} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/cart" className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl gap-2 hover:bg-primary/5 transition-colors group">
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-secondary">Cart</span>
                            </Link>
                            <Link href="/search" className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl gap-2 hover:bg-primary/5 transition-colors group">
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                    <Search className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-bold text-secondary">Search</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t bg-muted/30">
                    {user ? (
                        <Link href="/account">
                            <Button className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold gap-3 shadow-lg">
                                <User className="h-5 w-5" />
                                My Account
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold shadow-lg">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
