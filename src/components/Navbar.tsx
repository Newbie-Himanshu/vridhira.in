'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Store, Menu, Home, User, Search, ChevronRight, LogOut, X, Sparkles, ArrowRight, Tag, Package, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { Customer, MOCK_PRODUCTS } from '@/lib/mock-data';
import { getLocalCart, CartItem } from '@/lib/cart-actions';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const { user } = useUser();
  const supabase = createClient();

  const [liveCategories, setLiveCategories] = useState<any[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cloudCart, setCloudCart] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchActive(false);
    setIsMenuScrolled(false);
    setSearchQuery('');
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Hydrate cart from local storage only on client to avoid hydration mismatch
    setLocalCart(getLocalCart());

    const updateLocal = () => setLocalCart(getLocalCart());
    window.addEventListener('cart-updated', updateLocal);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated', updateLocal);
    };
  }, []);

  // Fetch Live Categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      if (data) setLiveCategories(data);
    };
    fetchCategories();
  }, [supabase]);

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

  // Fetch Customer & Cart Data when User is available
  useEffect(() => {
    if (!user) {
      setCustomer(null);
      setCloudCart(null);
      return;
    }

    const fetchUserData = async () => {
      // Fetch Customer
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .single();
      if (customerData) setCustomer(customerData as Customer);

      // Fetch Cart
      const { data: cartData } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (cartData) setCloudCart(cartData);
    };

    fetchUserData();
  }, [user, supabase]);

  const cartCount = user
    ? (cloudCart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0)
    : localCart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = customer?.role === 'owner' || customer?.role === 'store admin' || user?.email === 'hk8913114@gmail.com';

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Marketplace', icon: Store },
    { href: '/help-center', label: 'Help', icon: HelpCircle },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard });
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push('/');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileSearchActive(false);
      setIsMenuOpen(false);
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
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center pt-0">
      <header className={cn(
        "pointer-events-auto transition-all duration-1000 ease-quint flex items-center justify-center transform-gpu translate-z-0 will-change-[width,height,margin,border-radius,background-color,backdrop-filter,box-shadow,border-color]",
        isScrolled
          ? "mt-4 w-[92%] md:w-[70%] max-w-6xl h-16 bg-background/60 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl"
          : "mt-0 w-full h-20 bg-transparent border border-transparent shadow-none rounded-none"
      )}>
        <div className={cn(
          "w-full h-full flex items-center relative transition-all duration-1000 ease-quint will-change-[padding,max-width]",
          isScrolled ? "px-8 max-w-6xl" : "px-6 max-w-7xl mx-auto"
        )}>

          <div className="flex-[1_0_0] flex justify-start transition-all duration-1000 ease-quint">
            <Link href="/" className="flex items-center gap-2 group pointer-events-auto">
              <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center transition-all duration-1000 ease-quint">
                <div className={cn(
                  "absolute inset-0 rounded-lg animate-artisanal-rotation transition-all duration-1000 ease-quint",
                  showTransparent ? "bg-white/20" : "bg-primary/10"
                )} />
                <span className={cn(
                  "relative font-headline font-bold text-2xl transition-all duration-1000 ease-quint",
                  logoTextColor
                )}>V</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-[2_0_0] justify-center relative px-8" ref={desktopSearchContainerRef}>
            {isSearchOpen ? (
              <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000 ease-quint relative">
                <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                  <Search className={cn("absolute left-4 h-4 w-4 transition-colors duration-1000 ease-quint", showTransparent ? "text-white" : "text-primary")} />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search treasures, collections, origins..."
                    className={cn(
                      "h-11 w-full rounded-full pl-11 pr-12 border-transparent transition-all duration-1000 ease-quint shadow-lg backdrop-blur-sm",
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
                      "absolute right-1.5 h-8 w-8 rounded-full transition-all duration-1000 ease-quint",
                      showTransparent ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-destructive"
                    )}
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>

                {(matchedCategories.length > 0 || suggestions.length > 0) && (
                  <div className="absolute top-14 left-0 w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-1000 ease-quint z-50">
                    {matchedCategories.length > 0 && (
                      <div className="p-5 border-b bg-primary/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Live Collections</p>
                        <div className="flex flex-wrap gap-2">
                          {matchedCategories.map((cat: any) => (
                            <Link
                              key={cat.id}
                              href={`/shop?q=${cat.name}`}
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
                          >
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-border/20">
                              <Image src={product.image_url} alt={product.title} fill className="object-cover" />
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
              <nav className="flex items-center gap-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 ease-quint">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative py-1 text-xs font-bold transition-all tracking-widest uppercase group pointer-events-auto duration-1000 ease-quint",
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

          <div className="flex-[1_0_0] flex justify-end items-center gap-1 sm:gap-4 transition-all duration-1000 ease-quint">
            <div className="hidden lg:block pointer-events-auto">
              {!isSearchOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "transition-all duration-1000 ease-quint rounded-full",
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
                "relative group transition-all duration-1000 ease-quint rounded-full pointer-events-auto",
                showTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-primary"
              )}
              asChild
            >
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg ring-2 transition-all duration-1000 ease-quint",
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
                          "rounded-full h-10 shadow-md transition-all duration-1000 ease-quint flex items-center justify-center overflow-hidden",
                          isScrolled ? "px-3 w-10 gap-0" : "px-5 gap-2",
                          showTransparent
                            ? "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                            : "bg-secondary text-secondary-foreground hover:opacity-90"
                        )}
                      >
                        <User className="h-4 w-4 shrink-0" />
                        <span className={cn(
                          "truncate transition-all duration-1000 ease-quint",
                          isScrolled ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
                        )}>
                          {user.displayName || 'Account'}
                        </span>
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
                        "rounded-full px-7 h-10 font-bold uppercase text-[11px] shadow-lg animate-pulse-glow shine-effect transition-all duration-1000 ease-quint",
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
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full transition-all duration-1000 ease-quint",
                      showTransparent ? "text-white" : "text-secondary"
                    )}
                  >
                    <Menu className="h-7 w-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="inset-4 sm:left-auto sm:right-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] sm:max-w-sm rounded-[3.5rem] p-0 overflow-hidden border border-white/40 dark:border-white/10 flex flex-col bg-white/10 dark:bg-white/5 backdrop-blur-[100px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-quint scrollbar-none"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Mobile Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <div className="h-full flex flex-col relative overflow-hidden">
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                      <div
                        onScroll={(e) => setIsMenuScrolled(e.currentTarget.scrollTop > 20)}
                        className="flex-1 px-6 pt-4 pb-8 space-y-5 overflow-y-auto relative z-0 scrollbar-none will-change-transform"
                      >
                        <div
                          className={cn(
                            "sticky top-0 z-50 flex items-center transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] cursor-pointer mx-auto group overflow-hidden",
                            isMenuScrolled
                              ? "py-3 px-6 bg-white/20 backdrop-blur-3xl border border-white/20 rounded-full shadow-2xl scale-90 -translate-y-1 w-fit min-w-[240px] hover:bg-white/30"
                              : "py-6 px-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] w-full hover:bg-white/10"
                          )}
                        >
                          <div
                            className="flex items-center gap-3 flex-1"
                            onClick={() => { setIsMenuOpen(false); router.push('/'); }}
                          >
                            <div className="relative w-8 h-8 flex items-center justify-center transition-transform duration-1000 group-hover:scale-110">
                              <div className="absolute inset-0 bg-primary rounded-lg animate-artisanal-rotation shadow-lg" />
                              <span className="relative text-white font-black text-xl">V</span>
                            </div>
                            <h2 className="font-headline text-2xl text-secondary transition-colors duration-300 group-hover:text-primary m-0">
                              Vridhira
                            </h2>
                          </div>

                          <SheetClose className="shrink-0 p-1 rounded-full hover:bg-primary/10 transition-colors ml-4">
                            <X className="h-4 w-4 text-secondary/40 hover:text-primary" />
                          </SheetClose>
                        </div>

                        <div className="space-y-5">
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/80 px-2">Registry</p>

                          <div className="relative transition-all duration-1000">
                            {isMobileSearchActive ? (
                              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                  <Input
                                    ref={mobileSearchRef}
                                    placeholder="Find handcrafted treasures..."
                                    className="h-14 rounded-[2rem] border-white/20 pl-12 bg-white/40 backdrop-blur-xl shadow-2xl focus:ring-primary text-base text-secondary placeholder:text-secondary/60"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-white/20"
                                    onClick={() => setIsMobileSearchActive(false)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </form>

                                {(matchedCategories.length > 0 || suggestions.length > 0) && (
                                  <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                    {matchedCategories.length > 0 && (
                                      <div className="p-5 border-b border-white/10 bg-primary/10">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-primary mb-3">Live Categories</p>
                                        <div className="flex flex-wrap gap-2">
                                          {matchedCategories.map((cat: any) => (
                                            <Link
                                              key={cat.id}
                                              href={`/shop?q=${cat.name}`}
                                              className="flex items-center gap-2 px-3 py-2 bg-white/20 border border-white/10 rounded-full text-xs font-bold text-secondary hover:bg-primary hover:text-white transition-all shadow-sm"
                                              onClick={() => setIsMenuOpen(false)}
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
                                        <div className="p-4 border-b border-white/10 bg-muted/20">
                                          <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Top Results</p>
                                        </div>
                                        <div className="divide-y divide-white/10">
                                          {suggestions.map((product) => (
                                            <Link
                                              key={product.id}
                                              href={`/shop/${product.id}`}
                                              className="flex items-center gap-4 p-4 hover:bg-white/10 transition-colors group"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 border border-border/20">
                                                <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors text-secondary">{product.title}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">{product.category} • ${product.price}</p>
                                              </div>
                                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                          ))}
                                        </div>
                                      </>
                                    )}

                                    <Button
                                      variant="ghost"
                                      className="w-full h-14 rounded-none text-primary font-bold text-xs gap-2 hover:bg-primary/20 border-t border-white/10"
                                      onClick={() => handleSearchSubmit()}
                                    >
                                      View Archive <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  variant="outline"
                                  className="h-16 rounded-[2rem] bg-white/10 backdrop-blur-xl border-white/20 gap-3 justify-start px-6 group hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shine-effect overflow-hidden"
                                  onClick={() => setIsMobileSearchActive(true)}
                                >
                                  <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform relative z-10" />
                                  <span className="font-black text-xs uppercase tracking-widest text-secondary relative z-10">Find</span>
                                </Button>
                                <Button variant="outline" className="h-16 rounded-[2rem] bg-white/10 backdrop-blur-xl border-white/20 justify-between px-5 group hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shine-effect overflow-hidden" asChild onClick={() => setIsMenuOpen(false)}>
                                  <Link href="/cart">
                                    <div className="flex items-center gap-3 relative z-10">
                                      <ShoppingBag className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                      <span className="font-black text-xs uppercase tracking-widest text-secondary">Cart</span>
                                    </div>
                                    {mounted && cartCount > 0 && (
                                      <span className="w-6 h-6 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-black shadow-lg ring-4 ring-white/20 z-20 shrink-0">
                                        {cartCount}
                                      </span>
                                    )}
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!isMobileSearchActive && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/80 px-2">Discover</p>
                            <div className="grid gap-3">
                              {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className={cn("flex items-center justify-between p-4 rounded-[2rem] transition-all duration-1000 border border-white/20 shadow-lg group shine-effect overflow-hidden hover:scale-[1.02] active:scale-[0.98] backdrop-blur-xl", pathname === link.href ? "bg-primary text-white shadow-primary/20 animate-liquid-flow from-primary via-primary/80 to-primary bg-gradient-to-r" : "bg-white/20 backdrop-blur-xl text-secondary hover:bg-white/30 hover:border-white/30")}>
                                  <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn("p-2 rounded-xl transition-colors duration-1000", pathname === link.href ? "bg-white/30" : "bg-primary/20 group-hover:bg-primary/30")}>
                                      <link.icon className={cn("h-4 w-4 transition-transform duration-1000 group-hover:scale-110", pathname === link.href ? "text-white" : "text-primary")} />
                                    </div>
                                    <span className="text-base font-headline font-bold">{link.label}</span>
                                  </div>
                                  <ChevronRight className={cn("h-4 w-4 transition-all duration-1000 relative z-10", pathname === link.href ? "opacity-100 translate-x-1" : "opacity-40 group-hover:opacity-100 group-hover:translate-x-1")} />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isMobileSearchActive && (
                      <div className="px-6 py-5 border-t border-white/10 bg-white/5 relative z-10 mt-auto shrink-0">
                        {mounted && user ? (
                          <div className="flex items-center gap-3 w-full">
                            <Link href="/account" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                              <Button className="w-full h-11 rounded-2xl bg-secondary/80 backdrop-blur-xl text-secondary-foreground text-xs font-bold gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform animate-liquid-flow from-secondary via-secondary/80 to-secondary bg-gradient-to-r shine-effect overflow-hidden border border-white/10">
                                <User className="h-4 w-4 relative z-10" />
                                <span className="relative z-10">Settings</span>
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              className="flex-1 h-11 rounded-2xl text-destructive font-bold text-xs border border-destructive/20 bg-destructive/10 backdrop-blur-xl hover:bg-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 shine-effect overflow-hidden"
                              onClick={handleSignOut}
                            >
                              <LogOut className="h-4 w-4 relative z-10" />
                              <span className="relative z-10">Sign Out</span>
                            </Button>
                          </div>
                        ) : (
                          <Link href={loginUrl} className="w-full" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full h-11 rounded-2xl bg-secondary/80 backdrop-blur-xl text-secondary-foreground text-xs font-bold shadow-2xl animate-pulse-glow hover:scale-101 active:scale-0.99 transition-transform shine-effect overflow-hidden border border-white/10">
                              <span className="relative z-10">Secure Sign In</span>
                            </Button>
                          </Link>
                        )}
                      </div>
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
