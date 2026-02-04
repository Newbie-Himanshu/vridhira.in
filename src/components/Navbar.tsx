'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, Home, User, Search, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import { signOut } from 'firebase/auth';
import { getLocalCart, CartItem } from '@/lib/cart-actions';
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
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const updateLocal = () => setLocalCart(getLocalCart());
    updateLocal();
    window.addEventListener('cart-updated', updateLocal);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', updateLocal);
    };
  }, []);

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const { data: customer } = useDoc<Customer>(customerRef);

  const cartRef = useMemoFirebase(() => 
    user ? doc(db, 'carts', user.uid) : null,
    [db, user]
  );
  const { data: cloudCart } = useDoc<any>(cartRef);

  const cartCount = user 
    ? (cloudCart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0)
    : localCart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = customer?.role === 'owner' || customer?.role === 'store admin';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: Store },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard });
  }

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center pt-0 transition-all duration-700 ease-in-out">
      <header className={cn(
        "pointer-events-auto transition-all duration-700 ease-in-out flex items-center justify-center overflow-hidden",
        isScrolled 
          ? "mt-4 w-[92%] md:w-[70%] max-w-6xl h-16 bg-background/80 backdrop-blur-md rounded-full border border-border/50 shadow-2xl" 
          : "w-full h-20 bg-background border-b border-transparent shadow-none rounded-none"
      )}>
        <div className={cn(
          "w-full px-6 h-full flex items-center relative transition-all duration-700",
          isScrolled ? "max-w-none" : "container mx-auto"
        )}>
          
          <div className="flex-[1_0_0] flex justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 rounded-lg animate-artisanal-rotation" />
                  <span className="relative font-headline font-bold text-2xl text-primary">V</span>
              </div>
            </Link>
          </div>

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

          <div className="flex-[1_0_0] flex justify-end items-center gap-1 sm:gap-4">
            <Button variant="ghost" size="icon" className="flex text-muted-foreground hover:text-primary transition-all">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative group text-muted-foreground hover:text-primary transition-all" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {mounted && (
              <div className="hidden lg:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="gap-2 bg-secondary text-secondary-foreground hover:opacity-90 rounded-full px-5 h-10 shadow-md">
                        <User className="h-4 w-4" />
                        <span className="max-w-[100px] truncate">{user.displayName || 'Account'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white shadow-2xl border-none">
                      <DropdownMenuLabel className="font-headline text-lg">My Profile</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/account">
                        <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 gap-2"><User className="h-4 w-4" /> Account Settings</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 gap-2 text-destructive" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="secondary" size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-7 h-10 font-bold uppercase text-[11px] shadow-lg animate-pulse-glow shine-effect">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            )}
            
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-secondary">
                    <Menu className="h-7 w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden border-none flex flex-col">
                  <SheetHeader className="p-8 pb-4 text-left border-b bg-muted/30">
                    <SheetTitle className="font-headline text-3xl text-secondary flex items-center gap-4 group cursor-pointer transition-all duration-300">
                      <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                          <div className="absolute inset-0 bg-primary rounded-lg animate-artisanal-rotation" />
                          <span className="relative text-white font-bold text-xl">V</span>
                      </div>
                      <span className="transition-colors duration-300 group-hover:text-primary">Vridhira</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 px-8 py-10 space-y-8 overflow-y-auto">
                      <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Discover</p>
                          <div className="grid gap-2">
                              {navLinks.map((link) => (
                                  <Link key={link.href} href={link.href} className={cn("flex items-center justify-between p-4 rounded-2xl", pathname === link.href ? "bg-primary text-white shadow-lg" : "bg-muted/50 text-secondary")}>
                                      <div className="flex items-center gap-4"><link.icon className="h-5 w-5" /><span className="text-lg font-bold">{link.label}</span></div>
                                      <ChevronRight className="h-5 w-5 opacity-50" />
                                  </Link>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="p-8 border-t bg-muted/30">
                    {user ? (
                      <div className="flex flex-col gap-3">
                        <Link href="/account" className="w-full">
                          <Button className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold gap-3 shadow-md"><User className="h-5 w-5" />My Account</Button>
                        </Link>
                        <Button variant="outline" className="w-full h-12 rounded-xl text-destructive" onClick={handleSignOut}>Sign Out</Button>
                      </div>
                    ) : (
                      <Link href="/login">
                        <Button className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground text-lg font-bold shadow-lg animate-pulse-glow">Sign In</Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}