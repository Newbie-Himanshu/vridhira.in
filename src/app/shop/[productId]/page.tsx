
'use client';

import { use, useState, useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MOCK_PRODUCTS, Product, PageSettings } from '@/lib/mock-data';
import { V0Template } from '@/components/product-templates/V0Template';
import { ModernTemplate } from '@/components/product-templates/ModernTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage(props: { 
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // In Next.js 15, params and searchParams are Promises that must be unwrapped with React.use()
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const productId = params.productId;
  
  const db = useFirestore();

  // Fetch page settings from Firestore to demonstrate dynamic template switching.
  const settingsRef = useMemoFirebase(() => doc(db, 'page_customizations', 'global-settings'), [db]);
  const { data: settings, isLoading: settingsLoading } = useDoc<PageSettings>(settingsRef);

  // Simulate product fetching
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const found = MOCK_PRODUCTS.find(p => p.id === productId);
    setProduct(found || null);
    setLoading(false);
  }, [productId]);

  if (loading || settingsLoading) {
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
