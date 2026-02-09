'use client';

import { use, useState, useEffect } from 'react';
import { Product, PageSettings } from '@/lib/mock-data';
import { V0Template } from '@/components/product-templates/V0Template';
import { ModernTemplate } from '@/components/product-templates/ModernTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProductPage(props: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(props.params);
  const productId = params.productId;

  const supabase = createClient();

  const [settings, setSettings] = useState<PageSettings | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Parallel fetch
      const [settingsRes, productRes] = await Promise.all([
        supabase.from('page_customizations').select('*').eq('id', 'global-settings').single(),
        supabase.from('products').select('*').eq('id', productId).single()
      ]);

      if (settingsRes.data) setSettings(settingsRes.data as PageSettings);
      if (productRes.data) setProduct(productRes.data as Product);

      // If product not found in DB, check mock data (optional fallback if migration is partial)
      // but strictly we should rely on DB now.

      setIsLoading(false);
    };

    fetchData();
  }, [supabase, productId]);

  if (isLoading) {
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
