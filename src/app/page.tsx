
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-artisan');

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        {heroImage?.imageUrl ? (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            priority
            className="object-cover brightness-50"
            data-ai-hint={heroImage.imageHint}
          />
        ) : (
          <div className="absolute inset-0 bg-secondary/20" />
        )}
        <div className="container relative z-10 mx-auto px-4 text-center text-white space-y-6">
          <Badge className="bg-primary hover:bg-primary text-white border-none px-4 py-1.5 text-sm uppercase tracking-widest">
            Handcrafted Heritage
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold drop-shadow-lg max-w-4xl mx-auto leading-tight">
            Preserving Souls in Every Stitch
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 font-body">
            Directly support authentic Indian artisans. Discover timeless treasures that carry the heartbeat of centuries-old traditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/shop">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 text-lg font-bold">
                Shop the Collection
              </Button>
            </Link>
            <Link href="#our-story">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 px-8 text-lg">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Markers */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-headline font-bold text-secondary">100% Authentic</h3>
            <p className="text-muted-foreground">Certified products directly sourced from verified master craftsmen.</p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-headline font-bold text-secondary">Fair Trade</h3>
            <p className="text-muted-foreground">85%+ of the sale value goes directly back to the artisan community.</p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-headline font-bold text-secondary">Heirloom Quality</h3>
            <p className="text-muted-foreground">Slow-made pieces designed to last generations, not just seasons.</p>
          </div>
        </div>
      </section>

      {/* Featured Collections Preview */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-secondary">Featured Collections</h2>
            <p className="text-muted-foreground">Handpicked selections from our diverse craft categories.</p>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'silk-saree', name: 'Royal Textiles', desc: 'Hand-woven silks from Varanasi' },
            { id: 'terracotta-pot', name: 'Earth & Clay', desc: 'Terracotta from the Gangetic plains' },
            { id: 'mural-painting', name: 'Sacred Art', desc: 'Madhubani & Pattachitra originals' }
          ].map((cat) => {
            const img = PlaceHolderImages.find(i => i.id === cat.id);
            return (
              <Link key={cat.id} href={`/shop?category=${cat.name}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg">
                {img?.imageUrl ? (
                  <Image
                    src={img.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={img.imageHint}
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-2xl font-headline font-bold text-white">{cat.name}</h3>
                  <p className="text-white/80 text-sm mt-2">{cat.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Impact Story */}
      <section id="our-story" className="bg-secondary text-secondary-foreground py-20 artisan-pattern">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://picsum.photos/seed/artisan-portrait/800/800"
              alt="Artisan Story"
              fill
              className="object-cover"
              data-ai-hint="artisan portrait"
            />
          </div>
          <div className="space-y-8">
            <Badge variant="outline" className="border-primary text-primary">Our Mission</Badge>
            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
              Empowering the Hands that Create.
            </h2>
            <p className="text-lg opacity-80 leading-relaxed">
              At Vridhira, we believe that luxury isn't found in mass production, but in the deliberate, rhythmic motion of a weaver's loom or the steady hand of a sculptor. 
              We bridge the gap between global homes and local villages, ensuring that traditional skills remain economically viable for the next generation.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="text-4xl font-bold text-primary">500+</div>
                <div className="text-sm opacity-60">Artisans Supported</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="text-4xl font-bold text-primary">24+</div>
                <div className="text-sm opacity-60">States Represented</div>
              </div>
            </div>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
                Experience the Craft
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-secondary">Bring Heritage Home</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of collectors who are transforming their spaces with items that tell a story.
          </p>
          <Link href="/shop">
            <Button size="lg" className="rounded-full px-12 bg-secondary hover:bg-secondary/90">
              Go to Marketplace
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
