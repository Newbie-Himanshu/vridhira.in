
'use client';

import { use, useState, useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product, PageSettings } from '@/lib/mock-data';
import { V0Template } from '@/components/product-templates/V0Template';
import { ModernTemplate } from '@/components/product-templates/ModernTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage(props: { 
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const productId = params.productId;
  
  const db = useFirestore();

  // Fetch page settings from Firestore to demonstrate dynamic template switching.
  const settingsRef = useMemoFirebase(() => doc(db, 'page_customizations', 'global-settings'), [db]);
  const { data: settings, isLoading: settingsLoading } = useDoc<PageSettings>(settingsRef);

  // Fetch product from Firestore
  const productRef = useMemoFirebase(() => doc(db, 'products', productId), [db, productId]);
  const { data: product, isLoading: productLoading } = useDoc<Product>(productRef);

  if (productLoading || settingsLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-3xl font-headline font-bold">Treasure Not Found</h2>
        <p className="text-muted-foreground">This handcrafted piece might have found a home already.</p>
        <Link href="/shop">
          <Button variant="outline">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  // Default to v0 if no settings found
  const template = settings?.template || 'v0';

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-bold">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="max-w-6xl mx-auto">
        {template === 'modern' ? (
          <ModernTemplate product={product} />
        ) : (
          <V0Template product={product} />
        )}
      </div>
    </div>
  );
}
