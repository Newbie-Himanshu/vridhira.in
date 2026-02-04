
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Share2, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export function V0Template({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );

  const price = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-background p-6 rounded-xl border">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary text-primary">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-headline font-bold text-secondary">{product.title}</h1>
          <div className="text-2xl font-bold text-primary">${price.toFixed(2)}</div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {product.type === 'variable' && product.variants && (
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase tracking-wider">Select Option</Label>
            <RadioGroup 
              value={selectedVariant?.id} 
              onValueChange={(val) => setSelectedVariant(product.variants?.find(v => v.id === val) || null)}
              className="flex flex-wrap gap-2"
            >
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={v.id} id={v.id} className="sr-only" />
                  <Label
                    htmlFor={v.id}
                    className={`px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                      selectedVariant?.id === v.id 
                      ? 'bg-secondary text-white border-secondary' 
                      : 'bg-white hover:bg-muted'
                    }`}
                  >
                    {v.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {product.specs && (
          <div className="pt-6 border-t space-y-4">
            <h3 className="font-headline font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Product Details
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="contents">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="text-right font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
