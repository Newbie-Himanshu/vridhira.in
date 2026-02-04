
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { updateCartItemQuantityAction, removeCartItemAction, CartData } from '@/lib/cart-actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const cartRef = useMemoFirebase(() => 
    user ? doc(db, 'carts', user.uid) : null,
    [db, user]
  );
  
  const { data: cart, isLoading: isCartLoading } = useDoc<CartData>(cartRef);

  if (isUserLoading || isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const items = cart?.items || [];
  
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
  const platformFee = subtotal * 0.10; // Placeholder 10%
  const total = subtotal + platformFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-10 w-10 text-primary opacity-40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold text-secondary">Your Collection is Empty</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Discover unique treasures and start your journey with Indian craftsmanship.</p>
        </div>
        <Link href="/shop">
          <Button size="lg" className="rounded-full px-12 bg-primary hover:bg-primary/90 text-white font-bold h-14 shadow-xl">
            Explore Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-secondary flex items-center gap-3">
            <ShoppingBag className="h-10 w-10 text-primary" />
            Your Collection
          </h1>
          <p className="text-muted-foreground mt-2">Treasures selected for your home and heritage.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          {items.length} Unique Pieces
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cartDetailedItems.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`} className="border-none shadow-sm overflow-hidden bg-white/70 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={item.product?.imageUrl || ''}
                      alt={item.product?.title || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-headline font-bold text-secondary truncate">
                        {item.product?.title}
                      </h3>
                      <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground">Style: {item.variant.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.product?.category}</p>
                    
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-full px-3 py-1 border border-border/50">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateCartItemQuantityAction(db, user!.uid, item.productId, item.variantId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateCartItemQuantityAction(db, user!.uid, item.productId, item.variantId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-destructive gap-2 font-bold"
                        onClick={() => removeCartItemAction(db, user!.uid, item.productId, item.variantId)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-2xl bg-secondary text-secondary-foreground sticky top-24 rounded-[2rem] overflow-hidden">
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-headline font-bold border-b border-white/10 pb-4">Collection Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="opacity-70">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Heritage Platform Fee</span>
                  <span className="font-bold">${platformFee.toFixed(2)}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-xl">
                  <span className="font-headline font-bold">Total</span>
                  <span className="font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl transition-all active:scale-95 shine-effect overflow-hidden">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-[10px] text-center opacity-50 uppercase tracking-widest leading-relaxed">
                By checking out, you directly support Indian artisans and heritage preservation.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
