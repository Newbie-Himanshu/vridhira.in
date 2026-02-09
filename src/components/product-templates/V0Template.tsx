'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Share2, Info, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { addToCartAction } from '@/lib/cart-actions';
import { useToast } from '@/hooks/use-toast';

export function V0Template({ product }: { product: Product }) {
  const { user } = useUser();
  const supabase = createClient();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [isAdding, setIsAdding] = useState(false);

  const price = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCartAction(supabase, user?.id || null, {
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity: 1
      });
      toast({ title: "Treasure secured", description: "Item added to your collection." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Couldn't add that to your collection." });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-background p-6 rounded-xl border animate-in fade-in duration-700">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted shadow-inner">
        <Image src={product.image_url} alt={product.title} fill className="object-cover" priority />
      </div>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Badge variant="outline">{product.category}</Badge>
          <h1 className="text-3xl font-headline font-bold text-secondary">{product.title}</h1>
          <div className="text-2xl font-bold text-primary">${price.toFixed(2)}</div>
        </div>
        <p className="text-muted-foreground">{product.description}</p>
        {product.type === 'variable' && product.variants && (
          <RadioGroup value={selectedVariant?.id} onValueChange={(val) => setSelectedVariant(product.variants?.find(v => v.id === val) || null)} className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <div key={v.id} className="flex items-center space-x-2">
                <RadioGroupItem value={v.id} id={v.id} className="sr-only" />
                <Label htmlFor={v.id} className={`px-4 py-2 rounded-md border cursor-pointer ${selectedVariant?.id === v.id ? 'bg-secondary text-white' : 'bg-white'}`}>{v.name}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-6 animate-pulse-glow" onClick={handleAddToCart} disabled={isAdding}>
          {isAdding ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
          Add to Collection
        </Button>
      </div>
    </div>
  );
}
