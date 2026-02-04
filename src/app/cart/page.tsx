
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { updateCartItemQuantityAction, removeCartItemAction, getLocalCart, CartData, CartItem } from '@/lib/cart-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const updateLocal = () => setLocalCart(getLocalCart());
    updateLocal();
    window.addEventListener('cart-updated', updateLocal);
    return () => window.removeEventListener('cart-updated', updateLocal);
  }, []);

  const cartRef = useMemoFirebase(() => 
    user ? doc(db, 'carts', user.uid) : null,
    [db, user]
  );
  
  const { data: cloudCart, isLoading: isCartLoading } = useDoc<CartData>(cartRef);

  if (isUserLoading || (user && isCartLoading)) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const items = user ? (cloudCart?.items || []) : localCart;
  
  const cartDetailedItems = items.map(item => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    const variant = product?.variants?.find(v => v.id === item.variantId);
    return {
      ...item,
      product,
      variant,
      price: variant ? variant.price : (product?.price || 0)
    };
  });

  const subtotal = cartDetailedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const platformFee = subtotal * 0.10;
  const total = subtotal + platformFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-10 animate-in fade-in duration-1000">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-artisanal-rotation" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-primary/40" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-headline font-bold text-secondary tracking-tight">Your Collection is Empty</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
            Every masterpiece begins with a single selection. Start your journey into Indian heritage.
          </p>
        </div>
        <Link href="/shop" className="inline-block">
          <Button size="lg" className="rounded-full px-16 h-16 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all shine-effect overflow-hidden">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-in slide-in-from-top-4 duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Curated Treasures
          </div>
          <h1 className="text-5xl md:text-6xl font-headline font-bold text-secondary leading-none">
            Your Collection
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            A selection of timeless pieces reserved specifically for your home and legacy.
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm border border-border/50 px-8 py-4 rounded-3xl shadow-sm flex flex-col items-center">
          <span className="text-4xl font-headline font-bold text-primary">{items.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unique Items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          {cartDetailedItems.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`} className="border-none shadow-xl shadow-black/5 overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] transition-all hover:bg-white">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="relative w-full sm:w-44 aspect-square rounded-[2rem] overflow-hidden shrink-0 shadow-inner group">
                    <Image src={item.product?.imageUrl || ''} alt={item.product?.title || ''} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-2xl md:text-3xl font-headline font-bold text-secondary">{item.product?.title}</h3>
                        <p className="text-2xl font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline" className="bg-white text-[10px] uppercase tracking-wider font-bold border-border/50">{item.product?.category}</Badge>
                        {item.variant && <Badge className="bg-secondary/10 text-secondary text-[10px] uppercase tracking-wider font-bold">Style: {item.variant.name}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
                      <div className="flex items-center gap-4 bg-muted/30 rounded-2xl px-4 py-2 border border-border/20">
                        <Button variant="ghost" size="icon" onClick={() => updateCartItemQuantityAction(db, user?.uid || null, item.productId, item.variantId, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg min-w-[30px] text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateCartItemQuantityAction(db, user?.uid || null, item.productId, item.variantId, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-2 font-bold" onClick={() => removeCartItemAction(db, user?.uid || null, item.productId, item.variantId)}>
                        <Trash2 className="h-5 w-5" />
                        <span className="hidden sm:inline uppercase text-[10px] tracking-widest">Remove Piece</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <Card className="border-none shadow-2xl bg-secondary text-secondary-foreground rounded-[3rem] overflow-hidden artisan-pattern relative">
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="p-10 space-y-10 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold text-white">Collection Summary</h2>
                  <p className="text-sm text-white/80">Complete your acquisition to support Indian artisans.</p>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-lg font-medium">Subtotal</span>
                    <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span className="text-lg font-medium">Heritage Platform Fee</span>
                    <span className="text-xl font-bold">${platformFee.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex flex-col text-white">
                      <span className="font-headline text-3xl font-bold">Total</span>
                      <span className="text-[10px] uppercase tracking-widest text-white/70">Incl. all taxes</span>
                    </div>
                    <span className="text-4xl font-bold text-primary drop-shadow-sm">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full h-20 rounded-3xl bg-primary hover:bg-primary/90 text-white font-bold text-xl shadow-2xl animate-pulse-glow shine-effect overflow-hidden">
                  Complete Purchase <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
