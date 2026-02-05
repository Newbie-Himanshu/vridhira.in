'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { MOCK_PRODUCTS, Customer } from '@/lib/mock-data';
import { updateCartItemQuantityAction, removeCartItemAction, getLocalCart, CartData, CartItem } from '@/lib/cart-actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Trash2, Plus, Minus, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const updateLocal = () => setLocalCart(getLocalCart());
    updateLocal();
    window.addEventListener('cart-updated', updateLocal);
    return () => window.removeEventListener('cart-updated', updateLocal);
  }, []);

  const cartRef = useMemoFirebase(() => user ? doc(db, 'carts', user.uid) : null, [db, user]);
  const { data: cloudCart, isLoading: isCartLoading } = useDoc<CartData>(cartRef);

  const customerRef = useMemoFirebase(() => user ? doc(db, 'customers', user.uid) : null, [db, user]);
  const { data: customer } = useDoc<Customer>(customerRef);

  const settingsRef = useMemoFirebase(() => doc(db, 'platform_settings', 'global'), [db]);
  const { data: platformSettings } = useDoc<any>(settingsRef);

  if (isUserLoading || (user && isCartLoading)) return <div className="container mx-auto px-4 py-32 flex justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  const items = user ? (cloudCart?.items || []) : localCart;
  const cartDetailedItems = items.map(item => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    const variant = product?.variants?.find(v => v.id === item.variantId);
    return { ...item, product, variant, price: variant ? variant.price : (product?.price || 0) };
  });

  const subtotal = cartDetailedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const feePercentage = platformSettings?.platformFeePercentage ?? 0.10;
  const platformFee = subtotal * feePercentage;
  const total = subtotal + platformFee;

  const isMaintenance = platformSettings?.maintenanceMode === true;
  const isUnverified = user && !customer?.isVerified;

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/login?returnTo=/cart`);
      return;
    }
    if (isUnverified) {
      toast({ 
        variant: "destructive", 
        title: "Certification Pending", 
        description: "Please certify your heritage identity in My Account before completing acquisitions." 
      });
      router.push('/account');
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Create Order
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        customerName: `${customer?.firstName} ${customer?.lastName}` || user.displayName || 'Heritage Collector',
        items: cartDetailedItems.map(i => ({ 
          productId: i.productId, 
          variantId: i.variantId || null, 
          quantity: i.quantity, 
          price: i.price 
        })),
        totalAmount: total,
        status: 'Pending',
        date: new Date().toISOString(),
        platformFee
      });

      // 2. Decrement Stock (Simplified for Prototype)
      for (const item of cartDetailedItems) {
        const prodRef = doc(db, 'products', item.productId);
        updateDoc(prodRef, { stock: increment(-item.quantity) });
      }

      // 3. Clear Cart
      if (cartRef) {
        updateDoc(cartRef, { items: [] });
      }

      toast({ title: "Acquisition Confirmed", description: "Your handcrafted treasure has been secured." });
      router.push('/account?tab=orders');
    } catch (e) {
      toast({ variant: "destructive", title: "Checkout Failed", description: "A system error occurred during processing." });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-48 text-center space-y-10 animate-in fade-in duration-700">
        <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-16 w-16 text-primary/40" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-headline font-bold text-secondary">Your Collection is Empty</h1>
          <p className="text-muted-foreground text-lg">No treasures have been reserved yet.</p>
        </div>
        <Link href="/shop" className="inline-block">
          <Button className="bg-primary text-white rounded-full px-12 h-16 text-xl font-bold shadow-2xl hover:scale-105 transition-transform">Explore the Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl animate-in fade-in duration-700">
      {isMaintenance && (
        <Alert variant="destructive" className="mb-8 rounded-3xl border-2 p-6 shadow-lg bg-destructive/5">
          <ShieldAlert className="h-8 w-8" />
          <AlertTitle className="text-xl font-bold">Platform Maintenance Active</AlertTitle>
          <AlertDescription className="text-lg">Checkout is temporarily suspended while we polish the artisans' tools. Please try again soon.</AlertDescription>
        </Alert>
      )}
      {isUnverified && (
        <Alert className="mb-8 border-primary bg-primary/5 rounded-3xl p-6 shadow-sm border-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <AlertTitle className="text-xl font-bold text-secondary">Identity Certification Required</AlertTitle>
          <AlertDescription className="text-lg">
            Certified members only. Complete your identity protocol in <Link href="/account" className="underline font-bold text-primary">My Account</Link> to unlock acquisitions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-headline font-bold text-secondary">Acquisition Registry</h2>
            <Badge variant="outline" className="rounded-full border-primary/20 text-primary bg-primary/5 px-4 font-bold">{cartDetailedItems.length} Pieces</Badge>
          </div>
          {cartDetailedItems.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`} className="border-none shadow-xl rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 hover:bg-white/80 transition-all">
              <div className="flex flex-col sm:grid sm:grid-cols-12 gap-8 items-center">
                <div className="sm:col-span-3 relative aspect-square w-full rounded-3xl overflow-hidden shadow-inner border border-white/20">
                  <Image src={item.product?.imageUrl || ''} alt={item.product?.title || ''} fill className="object-cover" />
                </div>
                <div className="sm:col-span-9 flex flex-col justify-between h-full w-full py-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest">{item.product?.category}</Badge>
                      <h3 className="text-2xl font-headline font-bold text-secondary">{item.product?.title}</h3>
                      {item.variant && <p className="text-sm font-bold text-primary opacity-80 uppercase tracking-tighter">Variant: {item.variant.name}</p>}
                    </div>
                    <p className="text-2xl font-black text-secondary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-6 bg-muted/30 rounded-2xl px-6 py-2 border border-black/5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white" onClick={() => updateCartItemQuantityAction(db, user?.uid || null, item.productId, item.variantId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                      <span className="font-black text-lg w-4 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white" onClick={() => updateCartItemQuantityAction(db, user?.uid || null, item.productId, item.variantId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <Button variant="ghost" className="text-destructive/60 hover:text-destructive hover:bg-destructive/5 rounded-full" onClick={() => removeCartItemAction(db, user?.uid || null, item.productId, item.variantId)}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-4">
          <Card className="border-none shadow-2xl bg-secondary text-white rounded-[3rem] p-10 space-y-10 sticky top-32 artisan-pattern">
            <div className="absolute inset-0 bg-secondary/90 pointer-events-none rounded-[3rem]" />
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl font-headline font-black tracking-tight">Summary</h2>
              <div className="space-y-6">
                <div className="flex justify-between text-lg opacity-80 font-medium"><span>Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg opacity-80 font-medium"><span>Platform Fee ({(feePercentage * 100).toFixed(1)}%)</span><span className="font-bold">${platformFee.toFixed(2)}</span></div>
                <Separator className="bg-white/20" />
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold opacity-60">Total Investment</span>
                  <span className="text-5xl font-black text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout}
                disabled={isMaintenance || checkoutLoading}
                className="w-full h-24 rounded-[2rem] bg-primary text-white font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 shine-effect border-none"
              >
                {checkoutLoading ? <Loader2 className="animate-spin h-8 w-8" /> : isUnverified ? "Complete Verification" : "Confirm Purchase"}
              </Button>
              <p className="text-[10px] text-center opacity-40 uppercase tracking-[0.2em] font-bold">Secure Heritage Transaction Protected</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
