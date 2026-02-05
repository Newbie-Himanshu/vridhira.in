
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { MOCK_PRODUCTS, Customer } from '@/lib/mock-data';
import { updateCartItemQuantityAction, removeCartItemAction, getLocalCart, CartData, CartItem } from '@/lib/cart-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, Sparkles, ShieldAlert, LogIn, CheckCircle2 } from 'lucide-react';
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

  if (isUserLoading || (user && isCartLoading)) return <div className="container mx-auto px-4 py-32 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

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
      toast({ variant: "destructive", title: "Verification Required", description: "Please certify your heritage identity in My Account before checking out." });
      router.push('/account');
      return;
    }

    setCheckoutLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        customerName: user.displayName || 'Heritage Collector',
        items: cartDetailedItems.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        status: 'Pending',
        date: new Date().toISOString(),
        platformFee
      });
      // Clear cart logic here (omitted for brevity, would set carts items to [])
      toast({ title: "Acquisition Successful", description: "Your treasure has been reserved." });
      router.push('/account');
    } catch (e) {
      toast({ variant: "destructive", title: "Checkout Failed", description: "Could not process order." });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-10">
        <ShoppingBag className="h-12 w-12 text-primary/40 mx-auto" />
        <h1 className="text-5xl font-headline font-bold text-secondary">Your Collection is Empty</h1>
        <Link href="/shop"><Button className="bg-primary text-white rounded-full px-12 h-14">Explore Marketplace</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
      {isMaintenance && <Alert variant="destructive" className="mb-8"><ShieldAlert className="h-6 w-6" /><AlertTitle>Maintenance Mode</AlertTitle></Alert>}
      {isUnverified && (
        <Alert className="mb-8 border-primary bg-primary/5">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <AlertTitle className="font-bold">Identity Verification Pending</AlertTitle>
          <AlertDescription>Complete your heritage certification in <Link href="/account" className="underline font-bold">My Account</Link> to unlock checkout.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          {cartDetailedItems.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`} className="border-none shadow-xl rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8">
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden shrink-0 shadow-inner">
                  <Image src={item.product?.imageUrl || ''} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-headline font-bold text-secondary">{item.product?.title}</h3>
                    <p className="text-2xl font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 bg-muted/30 rounded-2xl px-4 py-2">
                      <Button variant="ghost" size="icon" onClick={() => updateCartItemQuantityAction(db, user?.uid || null, item.productId, item.variantId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                      <span className="font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" onClick={() => updateCartItemQuantityAction(db, user?.uid || null, item.productId, item.variantId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <Button variant="ghost" className="text-destructive" onClick={() => removeCartItemAction(db, user?.uid || null, item.productId, item.variantId)}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-4">
          <Card className="border-none shadow-2xl bg-secondary text-white rounded-[3rem] p-10 space-y-8">
            <h2 className="text-3xl font-headline font-black">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Platform Fee ({(feePercentage * 100).toFixed(1)}%)</span><span className="font-bold">${platformFee.toFixed(2)}</span></div>
              <Separator className="bg-white/20" />
              <div className="flex justify-between text-2xl font-black"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
            </div>
            <Button 
              onClick={handleCheckout}
              disabled={isMaintenance || checkoutLoading}
              className="w-full h-20 rounded-3xl bg-primary text-white font-bold text-xl shadow-2xl hover:scale-105 transition-transform"
            >
              {checkoutLoading ? <Loader2 className="animate-spin h-6 w-6" /> : isUnverified ? "Complete Verification" : "Complete Purchase"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
