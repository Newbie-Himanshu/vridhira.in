
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, ShieldCheck, Truck, RefreshCcw, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase';
import { addToCartAction } from '@/lib/cart-actions';
import { useToast } from '@/hooks/use-toast';

export function ModernTemplate({ product }: { product: Product }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [isAdding, setIsAdding] = useState(false);

  const price = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCartAction(db, user?.uid || null, {
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity: 1
      });
      toast({ title: "Masterpiece added", description: "Item is now in your collection." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "We couldn't add that piece." });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" priority />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-secondary">{product.title}</h1>
            <p className="text-3xl font-bold text-primary">${price.toFixed(2)}</p>
          </div>
          <p className="text-lg text-muted-foreground italic">"{product.description}"</p>
          {product.type === 'variable' && product.variants && (
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select Variant</label>
              <Select onValueChange={(val) => setSelectedVariant(product.variants?.find(v => v.id === val) || null)} defaultValue={selectedVariant?.id}>
                <SelectTrigger className="w-full h-12 bg-white"><SelectValue placeholder="Choose an option" /></SelectTrigger>
                <SelectContent>{product.variants.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} - ${v.price}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <Button size="lg" className="w-full bg-secondary text-white hover:bg-secondary/90 py-8 text-xl font-bold rounded-2xl animate-pulse-glow" onClick={handleAddToCart} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <ShoppingCart className="mr-3 h-6 w-6" />}
            Add to Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
