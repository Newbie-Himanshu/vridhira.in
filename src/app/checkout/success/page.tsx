'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag, Package } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm text-center animate-in fade-in zoom-in duration-500">
                <CardHeader className="flex flex-col items-center space-y-4 pt-12">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce-short shadow-inner">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-headline font-bold text-green-700">Order Placed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground text-lg">
                        Thank you for your purchase. We've received your order and are getting it ready!
                    </p>
                    <div className="p-6 bg-muted/50 rounded-xl text-sm text-left space-y-3 border border-border/50">
                        <p className="font-semibold text-foreground">What happens next?</p>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                You'll receive an email confirmation shortly.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                Track your order status in your profile.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                We'll notify you when your package ships.
                            </li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Link href="/orders" className="w-full">
                        <Button className="w-full h-12 text-lg font-bold" variant="default">
                            <Package className="mr-2 h-4 w-4" />
                            View My Orders
                        </Button>
                    </Link>
                    <Link href="/shop" className="w-full">
                        <Button className="w-full h-12 text-lg font-medium" variant="outline">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
