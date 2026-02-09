'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Assuming this exists or using standard input
import { Separator } from '@/components/ui/separator';
import { AddressSchema, CreateOrderSchema } from '@/lib/validators';
import { getLocalCart, CartItem } from '@/lib/cart-actions';
import { createClient } from '@/lib/supabase/client';
// We need to fetch product details to show title/price in summary since LocalCart only has IDs
// For MVP, we'll fetch details on mount.

type CheckoutFormValues = z.infer<typeof AddressSchema>;

export default function CheckoutPage() {
    const router = useRouter();
    const supabase = createClient();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartDetails, setCartDetails] = useState<any[]>([]); // { ...product, quantity }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(AddressSchema),
        defaultValues: {
            country: 'India',
        },
    });

    // 1. Fetch Cart & Product Details
    useEffect(() => {
        async function fetchCart() {
            // Logic: Prefer Cloud Cart if logged in, else Local Cart (but Checkout requires login usually)
            // For now, let's assume we sync local to cloud on login, so we fetch from cloud if auth.

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?next=/checkout');
                return;
            }

            // Fetch cloud cart
            const { data: cartData } = await supabase
                .from('carts')
                .select('items')
                .eq('user_id', user.id)
                .single();

            let items: CartItem[] = [];
            if (cartData && cartData.items && Array.isArray(cartData.items)) {
                items = cartData.items as unknown as CartItem[];
            } else {
                // Fallback to local if nothing in cloud (edge case)
                items = getLocalCart();
            }

            setCartItems(items);

            if (items.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch Product Details for UI
            const productIds = items.map(i => i.productId);
            const { data: products } = await supabase
                .from('products')
                .select('id, title, price, sale_price, image_url')
                .in('id', productIds);

            if (products) {
                const details = items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                        ...item,
                        product,
                    };
                }).filter(i => i.product); // Filter out if product blocked/deleted
                setCartDetails(details);
            }

            setLoading(false);
        }

        fetchCart();
    }, [supabase, router]);

    // 2. Calculate Totals
    const subtotal = cartDetails.reduce((acc, item) => {
        const price = item.product.sale_price || item.product.price;
        return acc + (price * item.quantity);
    }, 0);

    const shipping = 0; // Free shipping for now
    const total = subtotal + shipping;

    // 3. Handle Submit
    async function onSubmit(data: CheckoutFormValues) {
        setSubmitting(true);
        try {
            // Construct the payload matching CreateOrderSchema
            const payload = {
                items: cartDetails.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.sale_price || item.product.price // Client side price for schema, backend verifies
                })),
                shippingAddress: data,
                totalAmount: total,
                paymentMethod: paymentMethod
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to place order');
            }

            toast({
                title: "Order Placed Successfully!",
                description: `Order ID: ${result.data.id}`,
            });

            router.push('/checkout/success'); // Create this page next

        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Order Failed",
                description: error.message,
            });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Button onClick={() => router.push('/shop')}>Continue Shopping</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-headline font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Shipping Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" />
                                Shipping Information
                            </CardTitle>
                            <CardDescription>Where should we send your treasures?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input id="fullName" {...form.register('fullName')} placeholder="John Doe" />
                                        {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" {...form.register('phone')} placeholder="+91 98765 43210" />
                                        {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" {...form.register('email')} type="email" placeholder="john@example.com" />
                                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="addressLine1">Address Line 1</Label>
                                    <Input id="addressLine1" {...form.register('addressLine1')} placeholder="Street, Sector, House No." />
                                    {form.formState.errors.addressLine1 && <p className="text-xs text-destructive">{form.formState.errors.addressLine1.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                                    <Input id="addressLine2" {...form.register('addressLine2')} placeholder="Apartment, Studio, or Floor" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" {...form.register('city')} />
                                        {form.formState.errors.city && <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input id="state" {...form.register('state')} />
                                        {form.formState.errors.state && <p className="text-xs text-destructive">{form.formState.errors.state.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">PIN Code</Label>
                                        <Input id="postalCode" {...form.register('postalCode')} />
                                        {form.formState.errors.postalCode && <p className="text-xs text-destructive">{form.formState.errors.postalCode.message}</p>}
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="cod" onValueChange={(val) => setPaymentMethod(val as any)} className="space-y-3">
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">Cash on Delivery (COD)</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors opacity-50 relative">
                                    <RadioGroupItem value="razorpay" id="razorpay" disabled />
                                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer font-medium">Online Payment (Coming Soon)</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                                {cartDetails.map((item) => (
                                    <div key={item.productId} className="flex gap-4 text-sm">
                                        <div className="h-16 w-16 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            {/* Use simple img for now or Import Image if needed */}
                                            <img src={item.product.image_url} alt={item.product.title} className="object-cover h-full w-full" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium line-clamp-1">{item.product.title}</p>
                                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right font-medium">
                                            ${((item.product.sale_price || item.product.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                form="checkout-form"
                                className="w-full h-12 text-lg font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}
