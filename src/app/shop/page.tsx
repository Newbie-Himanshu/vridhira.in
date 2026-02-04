
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS, CATEGORIES, Category } from '@/lib/mock-data';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  // Sync search state with URL query parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    // Optional: update URL as user types for shareability
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <Sparkles className="h-4 w-4" />
          Directly from the Artisan's Hands
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-secondary">
          The Marketplace
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover a curated collection of hand-woven textiles, intricate pottery, and timeless art pieces from across the Indian subcontinent.
        </p>
      </section>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, descriptions, or categories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('All')}
            className="rounded-full"
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-xl font-headline font-semibold text-muted-foreground">
            No treasures found matching your search.
          </p>
          <Button
            variant="link"
            onClick={() => {
              handleSearchChange('');
              setSelectedCategory('All');
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
