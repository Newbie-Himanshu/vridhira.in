
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, Home, User, Search, ChevronRight, LogOut, X, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer, MOCK_PRODUCTS, CATEGORIES } from '@/lib/mock-data';
import { signOut } from 'firebase/auth';
import { getLocalCart, CartItem } from '@/lib/cart-actions';
import Image from 'next/image';
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
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle clicks outside desktop search to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopSearchContainerRef.current && !desktopSearchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isMobileSearchActive && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchActive]);

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileSearchActive(false);
      setSearchQuery('');
    }
  };

  const isLandingPage = pathname === '/';
  const showTransparent = isLandingPage && !isScrolled;

  const textColor = showTransparent ? "text-white" : "text-secondary";
  const logoTextColor = showTransparent ? "text-white" : "text-primary";
  const navUnderline = showTransparent ? "bg-white" : "bg-primary";

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const hasMinQuery = normalizedQuery.length > 1;

  const matchedCategories = hasMinQuery
    ? CATEGORIES.filter(cat => cat.toLowerCase().includes(normalizedQuery))
    : [];

  const suggestions = hasMinQuery
    ? MOCK_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery)
      ).slice(0, 3)
    : [];

  // Create a smart login URL that redirects back to current page
  const loginUrl = pathname === '/login' ? '/login' : `/login?returnTo=${encodeURIComponent(pathname)}`;

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center pt-0 transition-all duration-700 ease-in-out">
      <header className={cn(
        "pointer-events-auto transition-all duration-700 ease-in-out flex items-center justify-center",
        isScrolled 
          ? "mt-4 w-[92%] md:w-[70%] max-w-6xl h-16 bg-background/60 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl" 
          : "w-full h-20 bg-transparent border-b border-transparent shadow-none rounded-none"
      )}>
        <div className={cn(
          "w-full px-6 h-full flex items-center relative transition-all duration-700",
          isScrolled ? "max-w-none" : "container mx-auto"
        )}>
          
          <div className="flex-[1_0_0] flex justify-start">
            <Link href="/" className="flex items-center gap-2 group pointer-events-auto">
              <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
                  <div className={cn(
                    "absolute inset-0 rounded-lg animate-artisanal-rotation transition-colors duration-500",
                    showTransparent ? "bg-white/20" : "bg-primary/10"
                  )} />
                  <span className={cn(
                    "relative font-headline font-bold text-2xl transition-colors duration-500",
                    logoTextColor
                  )}>V</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-[2_0_0] justify-center relative px-8" ref={desktopSearchContainerRef}>
            {isSearchOpen ? (
              <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 relative">
                <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                  <Search className={cn("absolute left-4 h-4 w-4", showTransparent ? "text-white" : "text-primary")} />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search treasures, categories, origins..."
                    className={cn(
                      "h-11 w-full rounded-full pl-11 pr-12 border-transparent transition-all duration-500 shadow-lg backdrop-blur-sm",
                      showTransparent 
                        ? "bg-white/10 text-white placeholder:text-white/50 focus:bg-white/20" 
                        : "bg-white/50 border-primary/30 text-secondary focus:ring-primary"
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "absolute right-1.5 h-8 w-8 rounded-full",
                      showTransparent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-destructive"
                    )}
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>

                {(matchedCategories.length > 0 || suggestions.length > 0) && (
                  <div className="absolute top-14 left-0 w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                    {matchedCategories.length > 0 && (
                      <div className="p-5 border-b bg-primary/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Suggested Collections</p>
                        <div className="flex flex-wrap gap-2">
                          {matchedCategories.map((cat) => (
                            <Link 
                              key={cat} 
                              href={`/shop?q=${cat}`}
                              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/10 rounded-full text-xs font-bold text-secondary hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                              <Tag className="h-3 w-3" />
                              {cat}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.length > 0 && (
                      <div className="divide-y divide-border/30">
                        <div className="p-4 px-6 bg-muted/20">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Handcrafted Matches</p>
                        </div>
                        {suggestions.map((product) => (
                          <Link 
                            key={product.id} 
                            href={`/shop/${product.id}`}
                            className="flex items-center gap-4 p-4 px-6 hover:bg-muted/50 transition-colors group"
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                          >
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-border/20">
                              <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{product.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-medium">{product.category} • ${product.price}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full h-14 rounded-none text-primary font-bold text-xs gap-2 hover:bg-primary/5 border-t"
                      onClick={() => handleSearchSubmit()}
                    >
                      Explore Complete Collection <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <nav className="flex items-center gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative py-1 text-xs font-bold transition-all tracking-widest uppercase group pointer-events-auto duration-500",
                      pathname === link.href ? (showTransparent ? "text-white" : "text-primary") : (showTransparent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-primary")
                    )}
                  >
                    {link.label}
                    <span className={cn(
                      "absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300",
                      navUnderline,
                      pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex-[1_0_0] flex justify-end items-center gap-1 sm:gap-4">
            <div className="hidden lg:block pointer-events-auto">
              {!isSearchOpen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "transition-all rounded-full",
                    showTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative group transition-all rounded-full pointer-events-auto",
                showTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-primary"
              )} 
              asChild
            >
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg ring-2",
                    showTransparent ? "bg-white text-secondary ring-black/20" : "bg-primary text-white ring-background"
                  )}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {mounted && (
              <div className="hidden lg:block pointer-events-auto">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className={cn(
                          "gap-2 rounded-full px-5 h-10 shadow-md transition-all duration-500",
                          showTransparent 
                            ? "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm" 
                            : "bg-secondary text-secondary-foreground hover:opacity-90"
                        )}
                      >
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
                  <Link href={loginUrl}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className={cn(
                        "rounded-full px-7 h-10 font-bold uppercase text-[11px] shadow-lg animate-pulse-glow shine-effect transition-all duration-500",
                        showTransparent 
                          ? "bg-white text-secondary hover:bg-white/90" 
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      )}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            )}
            
            <div className="lg:hidden pointer-events-auto">
              <Sheet onOpenChange={(open) => { if(!open) setIsMobileSearchActive(false); }}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-full transition-all duration-500",
                      showTransparent ? "text-white" : "text-secondary"
                    )}
                  >
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
                  <div className="flex-1 px-8 py-10 space-y-10 overflow-y-auto">
                      <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                            {isMobileSearchActive ? 'Refine Search' : 'Quick Access'}
                          </p>
                          
                          <div className="relative transition-all duration-500">
                            {isMobileSearchActive ? (
                              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                  <Input
                                    ref={mobileSearchRef}
                                    placeholder="Type to find treasures..."
                                    className="h-16 rounded-2xl border-primary pl-12 bg-white shadow-xl focus:ring-primary"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                    onClick={() => { setIsMobileSearchActive(false); setSearchQuery(''); }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </form>

                                {(matchedCategories.length > 0 || suggestions.length > 0) && (
                                  <div className="bg-white rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                    {matchedCategories.length > 0 && (
                                      <div className="p-4 border-b bg-primary/5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Matching Categories</p>
                                        <div className="flex flex-wrap gap-2">
                                          {matchedCategories.map((cat) => (
                                            <Link 
                                              key={cat} 
                                              href={`/shop?q=${cat}`}
                                              onClick={() => { setIsMobileSearchActive(false); setSearchQuery(''); }}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/20 rounded-full text-xs font-bold text-secondary hover:bg-primary hover:text-white transition-all"
                                            >
                                              <Tag className="h-3 w-3" />
                                              {cat}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {suggestions.length > 0 && (
                                      <>
                                        <div className="p-4 border-b bg-muted/20">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Products</p>
                                        </div>
                                        <div className="divide-y divide-border/30">
                                          {suggestions.map((product) => (
                                            <Link 
                                              key={product.id} 
                                              href={`/shop/${product.id}`}
                                              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
                                              onClick={() => { setIsMobileSearchActive(false); setSearchQuery(''); }}
                                            >
                                              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                                                <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{product.title}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">{product.category} • ${product.price}</p>
                                              </div>
                                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                    
                                    <Button 
                                      variant="ghost" 
                                      className="w-full h-12 rounded-none text-primary font-bold text-xs gap-2 hover:bg-primary/5"
                                      onClick={() => handleSearchSubmit()}
                                    >
                                      View All Results <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                
                                {searchQuery.trim().length > 1 && matchedCategories.length === 0 && suggestions.length === 0 && (
                                  <div className="bg-white rounded-3xl border border-border/50 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
                                    <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground italic">No matches found for your search.</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
                                  <Button 
                                    variant="outline" 
                                    className="h-16 rounded-2xl border-muted-foreground/20 gap-3 justify-start px-6 group hover:border-primary transition-all"
                                    onClick={() => setIsMobileSearchActive(true)}
                                  >
                                      <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                      <span className="font-bold text-sm">Search</span>
                                  </Button>
                                  <Button variant="outline" className="h-16 rounded-2xl border-muted-foreground/20 gap-3 justify-start px-6 relative group hover:border-primary transition-all" asChild>
                                      <Link href="/cart">
                                          <ShoppingBag className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                          <span className="font-bold text-sm">View Cart</span>
                                          {cartCount > 0 && (
                                            <span className="absolute top-1/2 -translate-y-1/2 right-6 w-6 h-6 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
                                              {cartCount}
                                            </span>
                                          )}
                                      </Link>
                                  </Button>
                              </div>
                            )}
                          </div>
                      </div>

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
                      <Link href={loginUrl}>
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
