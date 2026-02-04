
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, Sparkles, Loader2 } from 'lucide-react';
import { useUser, useFirestore, initiateAnonymousSignIn, useAuth } from '@/firebase';
import { addToCartAction } from '@/lib/cart-actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      let currentUserId = user?.uid;
      
      // If no user, sign in anonymously first to have a UID for the cart
      if (!currentUserId) {
        initiateAnonymousSignIn(auth);
        // Wait briefly for auth state change
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Re-check user after potential anonymous login
      if (user?.uid) {
        await addToCartAction(db, user.uid, {
          productId: product.id,
          quantity: 1
        });
        toast({
          title: "Added to collection",
          description: `${product.title} is now in your cart.`
        });
      }
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
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-border/50 bg-white/50 backdrop-blur-sm rounded-3xl hover:-translate-y-2">
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className="absolute top-4 right-4 bg-primary/90 text-white border-none px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
            {product.category}
          </Badge>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <Button variant="secondary" size="sm" className="gap-2 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-bold bg-white text-secondary hover:bg-primary hover:text-white border-none">
              <Eye className="h-4 w-4" />
              View Treasure
            </Button>
          </div>
        </div>
      </Link>
      <CardHeader className="p-6 pb-2 space-y-2">
        <Link href={`/shop/${product.id}`}>
          <CardTitle className="text-xl font-headline line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {product.title}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {product.description}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Starting from</span>
          <span className="text-2xl font-bold text-secondary">
            {product.type === 'variable' ? `$${Math.min(...(product.variants?.map(v => v.price) || [product.price]))}` : `$${product.price.toFixed(2)}`}
          </span>
        </div>
        <div className="flex flex-col items-end">
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                {product.stock} available
            </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold rounded-2xl h-12 shadow-lg transition-all active:scale-95 group/btn shine-effect overflow-hidden"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />}
          Add to Collection
        </Button>
      </CardFooter>
    </Card>
  );
}
