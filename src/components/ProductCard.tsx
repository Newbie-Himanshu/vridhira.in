'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/index';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Sparkles, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { addToCartAction } from '@/lib/cart-actions';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useUser();
  const supabase = createClient();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCartAction(supabase, user?.id || null, {
        productId: product.id,
        quantity: 1
      });
      toast({
        title: "Added to collection",
        description: `${product.title} is now in your cart.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add item to cart."
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm rounded-[2rem] hover:-translate-y-2">
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full border-none shadow-lg">
            {product.category}
          </Badge>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Button variant="secondary" size="sm" className="font-bold bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-md border-none">
              <Eye className="h-4 w-4 mr-2" />
              View Treasure
            </Button>
          </div>
        </div>
      </Link>
      <CardHeader className="p-6 pb-2 space-y-2">
        <Link href={`/shop/${product.id}`}>
          <CardTitle className="text-xl font-headline line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {product.title}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] font-light leading-relaxed">
          {product.description}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
            Starting from
          </span>
          <span className="text-2xl font-black text-secondary">
            {mounted ? `$${product.price.toFixed(2)}` : '---'}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 font-bold px-2 py-0.5">
          <Sparkles className="h-2.5 w-2.5 mr-1" />
          {product.stock} available
        </Badge>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-2xl h-12 animate-pulse-glow shadow-lg transition-transform active:scale-95"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
          Add to Collection
        </Button>
      </CardFooter>
    </Card>
  );
}
