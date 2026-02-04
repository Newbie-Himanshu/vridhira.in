'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, Home, User, Search, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import { signOut } from 'firebase/auth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  }

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-500 border-b",
      isScrolled 
        ? "bg-background/80 backdrop-blur-md h-16 shadow-sm border-border/50" 
        : "bg-background h-20 shadow-none border-transparent"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center relative">
        
        {/* Left Column: Logo */}
        <div className="flex-[1_0_0] flex justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 rounded-lg animate-artisanal-rotation" />
                <span className="relative font-headline font-bold text-2xl text-primary transition-transform duration-300 group-hover:scale-110">V</span>
            </div>
          </Link>
        </div>

        {/* Center Column: Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-1 text-xs font-bold transition-all hover:text-primary tracking-widest uppercase group",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              <span className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}
        </nav>

        {/* Right Column: Actions */}
        <div className="flex-[1_0_0] flex justify-end items-center gap-1 sm:gap-4">
          
          <Button variant="ghost" size="icon" className="flex text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative group text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300" asChild>
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-active:scale-90" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-in zoom-in-0 duration-500">
                0
              </span>
            </Link>
          </Button>

          {/* Account/Auth Buttons */}
          {mounted && (
            <div className="hidden lg:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-2 bg-secondary text-secondary-foreground hover:opacity-90 rounded-full px-5 h-10 border-none transition-all font-bold hover:scale-105 active:scale-95 shadow-md">
                      <User className="h-4 w-4" />
                      <span className="max-w-[100px] truncate">
                          {user.displayName || customer?.firstName || 'Account'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white shadow-2xl border-none">
                    <DropdownMenuLabel className="font-headline text-lg">My Profile</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/account">
                      <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 gap-2">
                        <User className="h-4 w-4" /> Account Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      className="rounded-xl cursor-pointer py-2 px-3 gap-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="secondary" size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all rounded-full px-7 h-10 font-bold tracking-widest uppercase text-[11px] hover:scale-105 active:scale-95 shadow-lg animate-pulse-glow shine-effect">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-secondary hover:bg-primary/5 rounded-full transition-transform active:scale-90">
                  <Menu className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden border-none flex flex-col animate-in slide-in-from-right duration-500">
                <SheetHeader className="p-8 pb-4 text-left border-b bg-muted/30">
                  <SheetTitle className="font-headline text-3xl text-secondary flex items-center gap-4">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary rounded-lg animate-artisanal-rotation" />
                        <span className="relative text-white font-bold text-xl">V</span>
                    </div>
                    <span className="font-headline font-bold text-2xl tracking-tight animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
                      Vridhira
                    </span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 px-8 py-10 space-y-8 overflow-y-auto">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Discover</p>
                        <div className="grid gap-2">
                            {navLinks.map((link, idx) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 animate-in fade-in slide-in-from-right-4",
                                        pathname === link.href 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                            : "bg-muted/50 text-secondary hover:bg-muted"
                                    )}
                                    style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <link.icon className="h-5 w-5" />
                                        <span className="text-lg font-bold">{link.label}</span>
                                    </div>
                                    <ChevronRight className={cn("h-5 w-5 opacity-50 transition-transform", pathname === link.href && "opacity-100 rotate-90")} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/cart" className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl gap-2 hover:bg-primary/5 transition-all duration-300 group active:scale-95 animate-in fade-in zoom-in-95 duration-700 delay-500">
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                                    <ShoppingBag className="h-6 w-6 text-primary group-hover:text-white" />
                                </div>
                                <span className="font-bold text-secondary">Cart</span>
                            </Link>
                            <Link href="/search" className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl gap-2 hover:bg-primary/5 transition-all duration-300 group active:scale-95 animate-in fade-in zoom-in-95 duration-700 delay-600">
                                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                                    <Search className="h-6 w-6 text-primary group-hover:text-white" />
                                </div>
                                <span className="font-bold text-secondary">Search</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t bg-muted/30">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <Link href="/account" className="w-full">
                        <Button className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold gap-3 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:opacity-90 transition-all active:scale-95">
                          <User className="h-5 w-5" />
                          My Account
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 font-bold" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold shadow-[0_0_30px_5px_hsl(var(--primary)/0.6)] hover:opacity-90 transition-all active:scale-95 shine-effect animate-pulse-glow">
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