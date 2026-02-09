'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/mock-data';
import { Category, Product } from '@/types/index';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('is_hidden', false)
        .is('is_blocked', false)
        .order('title', { ascending: true });

      if (data) {
        setProducts(data as Product[]);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  // Sync search state with URL query parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-48 flex justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-24">
      {/* Hero Section */}
      <section className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm border border-primary/5">
          <Sparkles className="h-3.5 w-3.5" />
          Handcrafted Heritage Registry
        </div>
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-secondary tracking-tighter leading-none">
          The Marketplace
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed italic">
          Discover a curated collection of hand-woven textiles, intricate pottery, and timeless art pieces from across the Indian subcontinent.
        </p>
      </section>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search treasures, descriptions, or origins..."
            className="h-14 rounded-2xl pl-12 bg-card/50 backdrop-blur-xl border-border/50 focus:ring-primary shadow-inner text-base"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-none px-1">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "rounded-full h-14 px-8 font-bold uppercase text-[10px] tracking-widest transition-all",
              selectedCategory === 'All' ? "shadow-lg scale-105" : "bg-card/30"
            )}
          >
            All Pieces
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full h-14 px-8 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap transition-all",
                selectedCategory === cat ? "shadow-lg scale-105" : "bg-card/30"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/50 backdrop-blur-sm">
          <SlidersHorizontal className="mx-auto h-16 w-16 text-muted-foreground mb-6 opacity-20" />
          <p className="text-2xl font-headline font-bold text-secondary mb-2">
            No treasures found in this classification.
          </p>
          <p className="text-muted-foreground mb-8 font-light">Try broadening your search or adjusting your registry filters.</p>
          <Button
            variant="link"
            className="text-primary font-black uppercase tracking-[0.2em] text-xs hover:no-underline"
            onClick={() => {
              handleSearchChange('');
              setSelectedCategory('All');
            }}
          >
            Clear All Registry Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 pt-32 flex justify-center min-h-[600px] items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
