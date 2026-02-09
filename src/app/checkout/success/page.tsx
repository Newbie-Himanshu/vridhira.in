'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm text-center">
                <CardHeader className="flex flex-col items-center space-y-4 pt-12">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce-short">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-headline font-bold text-green-700">Order Placed!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-lg">
                        Thank you for your order. We have received your request and will start processing it right away.
                    </p>
                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-left space-y-2">
                        <p><strong>Next Steps:</strong></p>
                        <ul className="list-disc list-inside text-muted-foreground">
                            <li>You will receive an email confirmation.</li>
                            <li>You can track your order status in your profile.</li>
                            <li>We will notify you when it ships.</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pb-8">
                    <Link href="/orders" className="w-full">
                        <Button className="w-full h-12 text-lg font-bold" variant="default">
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
