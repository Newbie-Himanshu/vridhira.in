
import Image from 'next/image';
import { Product } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
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
      </div>
      <CardHeader className="p-4 space-y-1">
        <CardTitle className="text-lg font-headline line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-secondary">${product.price.toFixed(2)}</span>
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
