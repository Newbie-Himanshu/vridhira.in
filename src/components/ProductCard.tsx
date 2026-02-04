
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge className="absolute top-2 right-2 bg-primary/90 text-white border-none">
            {product.category}
          </Badge>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>
      </Link>
      <CardHeader className="p-4 space-y-1">
        <Link href={`/shop/${product.id}`}>
          <CardTitle className="text-lg font-headline line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-secondary">
            {product.type === 'variable' ? `From $${Math.min(...(product.variants?.map(v => v.price) || [product.price]))}` : `$${product.price.toFixed(2)}`}
          </span>
          <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
