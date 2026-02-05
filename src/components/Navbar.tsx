'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, Home, User, Search, ChevronRight, LogOut, X, Sparkles, ArrowRight, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase, useFirestore, useAuth } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Customer, MOCK_PRODUCTS } from '@/lib/mock-data';
import { signOut } from 'firebase/auth';
import { getLocalCart, CartItem } from '@/lib/cart-actions';
import Image from 'next/image';
import { useCollection } from '@/firebase';
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
  const [isMenuScrolled, setIsMenuScrolled] = useState(false);
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

  const categoriesQuery = useMemoFirebase(() => query(collection(db, 'categories'), where('isActive', '==', true)), [db]);
  const { data: liveCategories } = useCollection<any>(categoriesQuery);

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

  const isAdmin = customer?.role === 'owner' || customer?.role === 'store admin' || user?.email === 'hk8913114@gmail.com';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Marketplace', icon: Store },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin/dashboard', label: 'Command', icon: LayoutDashboard });
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

  const logoTextColor = showTransparent ? "text-white" : "text-primary";
  const navUnderline = showTransparent ? "bg-white" : "bg-primary";

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const hasMinQuery = normalizedQuery.length > 1;

  const matchedCategories = hasMinQuery && liveCategories
    ? liveCategories.filter((cat: any) => cat.name.toLowerCase().includes(normalizedQuery))
    : [];

  const suggestions = hasMinQuery
    ? MOCK_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery)
      ).slice(0, 3)
    : [];

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
                    placeholder="Search treasures, collections, origins..."
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
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Live Collections</p>
                        <div className="flex flex-wrap gap-2">
                          {matchedCategories.map((cat: any) => (
                            <Link 
                              key={cat.id} 
                              href={`/shop?q=${cat.name}`}
                              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-primary/10 rounded-full text-xs font-bold text-secondary hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                              <Tag className="h-3 w-3" />
                              {cat.name}
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
                      Explore Complete Archive <ArrowRight className="h-4 w-4" />
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
                    <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] p-2 bg-white shadow-2xl border-none">
                      <DropdownMenuLabel className="font-headline text-lg px-3">Collector Profile</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/account">
                        <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3 gap-2 font-medium">
                          <User className="h-4 w-4" /> Account Settings
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account?tab=orders">
                        <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3 gap-2 font-medium">
                          <Package className="h-4 w-4" /> My Acquisitions
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3 gap-2 text-destructive font-bold" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Secure Sign Out
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
              <Sheet onOpenChange={(open) => { 
                if(!open) {
                  setIsMobileSearchActive(false);
                  setIsMenuScrolled(false);
                }
              }}>
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
                <SheetContent 
                  side="right" 
                  className="inset-4 sm:left-auto sm:right-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] sm:max-w-sm rounded-[3.5rem] p-0 overflow-hidden border border-white/30 flex flex-col bg-white/20 backdrop-blur-[40px] shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <div 
                    onScroll={(e) => setIsMenuScrolled(e.currentTarget.scrollTop > 10)}
                    className="flex-1 px-8 py-10 space-y-10 overflow-y-auto relative z-0"
                  >
                      {/* Integrated Floating Logo - Always Hover Aesthetic + Scroll Reactive Pill */}
                      <div className={cn(
                        "sticky top-0 z-50 flex items-center justify-center gap-4 transition-all duration-700 cursor-pointer mx-auto group",
                        isMenuScrolled 
                          ? "py-3 bg-white/50 backdrop-blur-3xl border border-white/40 rounded-full shadow-2xl w-[90%] -translate-y-2" 
                          : "py-6 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] w-full"
                      )}>
                        <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                            <div className="absolute inset-0 bg-primary rounded-xl animate-artisanal-rotation shadow-lg" />
                            <span className="relative text-white font-black text-xl">V</span>
                        </div>
                        <SheetTitle className="font-headline text-2xl text-secondary transition-colors duration-300 group-hover:text-primary m-0">
                          Vridhira
                        </SheetTitle>
                      </div>

                      {/* Search & Action Hub */}
                      <div className="space-y-6">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 px-4">
                            {isMobileSearchActive ? 'Refine Search' : 'Registry Navigation'}
                          </p>
                          
                          <div className="relative transition-all duration-500">
                            {isMobileSearchActive ? (
                              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                  <Input
                                    ref={mobileSearchRef}
                                    placeholder="Find handcrafted treasures..."
                                    className="h-16 rounded-3xl border-white/20 pl-14 bg-white/40 backdrop-blur-xl shadow-2xl focus:ring-primary text-lg text-secondary placeholder:text-secondary/60"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    className="absolute right-5 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full hover:bg-white/20"
                                    onClick={() => { setIsMobileSearchActive(false); setSearchQuery(''); }}
                                  >
                                    <X className="h-5 w-5" />
                                  </Button>
                                </form>

                                {(matchedCategories.length > 0 || suggestions.length > 0) && (
                                  <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                    {matchedCategories.length > 0 && (
                                      <div className="p-6 border-b border-white/10 bg-primary/10">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-4">Live Categories</p>
                                        <div className="flex flex-wrap gap-3">
                                          {matchedCategories.map((cat: any) => (
                                            <Link 
                                              key={cat.id} 
                                              href={`/shop?q=${cat.name}`}
                                              onClick={() => { setIsMobileSearchActive(false); setSearchQuery(''); }}
                                              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 border border-white/10 rounded-full text-xs font-bold text-secondary hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                              <Tag className="h-3 w-3" />
                                              {cat.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {suggestions.length > 0 && (
                                      <>
                                        <div className="p-5 border-b border-white/10 bg-muted/20">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Top Results</p>
                                        </div>
                                        <div className="divide-y divide-white/10">
                                          {suggestions.map((product) => (
                                            <Link 
                                              key={product.id} 
                                              href={`/shop/${product.id}`}
                                              className="flex items-center gap-5 p-5 hover:bg-white/10 transition-colors group"
                                              onClick={() => { setIsMobileSearchActive(false); setSearchQuery(''); }}
                                            >
                                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/20">
                                                <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base truncate group-hover:text-primary transition-colors text-secondary">{product.title}</p>
                                                <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-tight">{product.category} • ${product.price}</p>
                                              </div>
                                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                    
                                    <Button 
                                      variant="ghost" 
                                      className="w-full h-16 rounded-none text-primary font-bold text-sm gap-2 hover:bg-primary/20 border-t border-white/10"
                                      onClick={() => handleSearchSubmit()}
                                    >
                                      View Complete Archive <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                                  <Button 
                                    variant="outline" 
                                    className="h-20 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border-white/20 gap-4 justify-start px-8 group hover:bg-white/30 transition-all shadow-xl"
                                    onClick={() => setIsMobileSearchActive(true)}
                                  >
                                      <Search className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                      <span className="font-black text-sm uppercase tracking-widest text-secondary">Find</span>
                                  </Button>
                                  <Button variant="outline" className="h-20 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border-white/20 gap-4 justify-start px-8 relative group hover:bg-white/30 transition-all shadow-xl" asChild>
                                      <Link href="/cart">
                                          <ShoppingBag className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                          <span className="font-black text-sm uppercase tracking-widest text-secondary">Cart</span>
                                          {cartCount > 0 && (
                                            <span className="absolute top-1/2 -translate-y-1/2 right-8 w-7 h-7 bg-primary text-white text-xs flex items-center justify-center rounded-full font-black shadow-lg ring-4 ring-white/20">
                                              {cartCount}
                                            </span>
                                          )}
                                      </Link>
                                  </Button>
                              </div>
                            )}
                          </div>
                      </div>

                      {/* Discover Links */}
                      <div className="space-y-6">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 px-4">Discover</p>
                          <div className="grid gap-3">
                              {navLinks.map((link) => (
                                  <Link key={link.href} href={link.href} className={cn("flex items-center justify-between p-5 rounded-[2.2rem] transition-all duration-500 border border-white/20 shadow-lg", pathname === link.href ? "bg-primary text-white scale-[1.02] shadow-primary/20" : "bg-white/20 backdrop-blur-xl text-secondary hover:bg-white/30 hover:border-white/30")}>
                                      <div className="flex items-center gap-5">
                                        <div className={cn("p-2.5 rounded-2xl", pathname === link.href ? "bg-white/30" : "bg-primary/20")}>
                                          <link.icon className={cn("h-5 w-5", pathname === link.href ? "text-white" : "text-primary")} />
                                        </div>
                                        <span className="text-lg font-headline font-bold">{link.label}</span>
                                      </div>
                                      <ChevronRight className={cn("h-5 w-5 transition-transform duration-500", pathname === link.href ? "opacity-100 translate-x-1" : "opacity-40")} />
                                  </Link>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Glass Base Actions */}
                  <div className="px-8 py-8 border-t border-white/20 bg-white/20 backdrop-blur-3xl relative z-10 mt-auto">
                    {user ? (
                      <div className="flex flex-col gap-4">
                        <Link href="/account" className="w-full">
                          <Button className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground text-sm font-bold gap-3 shadow-2xl hover:scale-[1.01] transition-transform">
                            <User className="h-5 w-5" />Collector Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 rounded-xl text-destructive font-black text-[10px] uppercase tracking-widest border-destructive/30 bg-destructive/10 hover:bg-destructive/20 transition-colors" 
                          onClick={handleSignOut}
                        >
                          Secure Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Link href={loginUrl}>
                        <Button className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground text-base font-bold shadow-2xl animate-pulse-glow hover:scale-[1.01] transition-transform">Secure Sign In</Button>
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
