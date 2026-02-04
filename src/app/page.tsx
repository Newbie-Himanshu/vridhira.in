import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const heroDesktop = PlaceHolderImages.find(img => img.id === 'hero-artisan');
  const heroMobile = PlaceHolderImages.find(img => img.id === 'hero-artisan-mobile');

  return (
    <div className="flex flex-col gap-24 md:gap-32 pb-32">
      {/* Hero Section */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden py-24 px-4">
        <div className="absolute inset-0 z-0">
          {/* Desktop Image */}
          {heroDesktop && (
            <div className="hidden md:block absolute inset-0">
              <Image
                src={heroDesktop.imageUrl}
                alt={heroDesktop.description}
                fill
                priority
                className="object-cover brightness-[0.7] transition-all duration-1000"
                data-ai-hint={heroDesktop.imageHint}
              />
            </div>
          )}
          {/* Mobile Image */}
          {heroMobile && (
            <div className="md:hidden absolute inset-0">
              <Image
                src={heroMobile.imageUrl}
                alt={heroMobile.description}
                fill
                priority
                className="object-cover brightness-[0.7] transition-all duration-1000"
                data-ai-hint={heroMobile.imageHint}
              />
            </div>
          )}
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="container relative z-10 mx-auto text-center text-white space-y-8 md:space-y-10">
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <Badge className="bg-primary hover:bg-primary text-white border-none px-6 py-2 text-[10px] md:text-sm uppercase tracking-[0.3em] shadow-lg animate-subtle-float">
              Handcrafted Heritage
            </Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-headline font-bold drop-shadow-2xl max-w-5xl mx-auto leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Buy The Story & <br /> Collect The Unseen.
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto opacity-95 font-body animate-in fade-in duration-1000 delay-500 leading-relaxed px-4 drop-shadow-md">
            Directly support authentic Indian artisans. Discover timeless treasures that carry the heartbeat of centuries-old traditions.
          </p>
          
          <div className="flex flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 w-full mx-auto">
            <Link href="/shop" className="w-auto">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 md:px-12 h-12 text-sm md:text-base font-bold rounded-full shadow-xl hover:scale-105 hover:shadow-primary/20 active:scale-95 transition-all duration-300 shine-effect border-none">
                Shop
              </Button>
            </Link>
            <Link href="#our-story" className="w-auto">
              <Button size="lg" variant="outline" className="text-white border-white/80 hover:bg-white/10 px-6 md:px-10 h-12 text-sm md:text-base font-medium rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Markers */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 text-center">
          {[
            { icon: ShieldCheck, title: "100% Authentic", text: "Certified products directly sourced from verified master craftsmen." },
            { icon: Heart, title: "Fair Trade", text: "85%+ of the sale value goes directly back to the artisan community." },
            { icon: Sparkles, title: "Heirloom Quality", text: "Slow-made pieces designed to last generations, not just seasons." }
          ].map((item, idx) => (
            <div key={idx} className="space-y-4 group hover:scale-105 transition-transform duration-300 p-8 rounded-[2rem] hover:bg-white hover:shadow-2xl">
              <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner">
                <item.icon className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-headline font-bold text-secondary">{item.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collections Preview */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-secondary">Featured Collections</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl">Handpicked selections from our diverse craft categories.</p>
          </div>
          <Link href="/shop" className="flex items-center gap-2 text-primary text-lg font-bold hover:gap-4 transition-all duration-300 hover:underline">
            View All <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[
            { id: 'silk-saree', name: 'Royal Textiles', desc: 'Hand-woven silks from Varanasi' },
            { id: 'terracotta-pot', name: 'Earth & Clay', desc: 'Terracotta from the Gangetic plains' },
            { id: 'mural-painting', name: 'Sacred Art', desc: 'Madhubani & Pattachitra originals' }
          ].map((cat) => {
            const img = PlaceHolderImages.find(i => i.id === cat.id);
            return (
              <Link key={cat.id} href={`/shop?category=${cat.name}`} className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-4">
                {img?.imageUrl ? (
                  <Image
                    src={img.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    data-ai-hint={img.imageHint}
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/20 to-transparent flex flex-col justify-end p-8 transition-opacity duration-300">
                  <h3 className="text-2xl md:text-3xl font-headline font-bold text-white group-hover:translate-x-2 transition-transform duration-300">{cat.name}</h3>
                  <p className="text-white/90 text-xs md:text-base mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 font-light">{cat.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Impact Story */}
      <section id="our-story" className="bg-secondary text-secondary-foreground py-20 md:py-32 artisan-pattern overflow-hidden relative">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group order-2 lg:order-1">
            <Image
              src="https://picsum.photos/seed/artisan-portrait/1200/1200"
              alt="Artisan Story"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              data-ai-hint="artisan portrait"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <Badge variant="outline" className="border-primary text-primary px-6 py-2 animate-pulse uppercase tracking-[0.3em] text-[10px]">Our Mission</Badge>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold leading-[1.1]">
              Empowering the Hands that Create.
            </h2>
            <p className="text-base md:text-lg opacity-90 leading-relaxed font-light max-w-xl">
              At Vridhira, we believe that luxury isn't found in mass production, but in the deliberate, rhythmic motion of a weaver's loom or the steady hand of a sculptor. 
              We bridge the gap between global homes and local villages.
            </p>
            <div className="flex gap-12 md:gap-16">
              <div className="group">
                <div className="text-4xl md:text-6xl font-bold text-primary group-hover:scale-110 transition-transform">500+</div>
                <div className="text-[10px] md:text-xs opacity-60 font-bold uppercase tracking-[0.2em] mt-2">Artisans</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="group">
                <div className="text-4xl md:text-6xl font-bold text-primary group-hover:scale-110 transition-transform">24+</div>
                <div className="text-[10px] md:text-xs opacity-60 font-bold uppercase tracking-[0.2em] mt-2">States</div>
              </div>
            </div>
            <Link href="/shop" className="inline-block pt-4">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-12 h-14 md:h-16 text-lg md:text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all shine-effect w-full sm:w-auto">
                Experience the Craft
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 md:p-24 text-center space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] -mr-60 -mt-60 transition-transform duration-1000 group-hover:scale-150" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[100px] -ml-60 -mb-60 transition-transform duration-1000 group-hover:scale-150" />
          
          <h2 className="text-4xl md:text-6xl font-headline font-bold text-secondary relative z-10 leading-tight">Bring Heritage Home</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg md:text-xl relative z-10 leading-relaxed font-light">
            Join thousands of collectors who are transforming their spaces with unique, hand-made items.
          </p>
          <div className="relative z-10 pt-4">
            <Link href="/shop" className="w-full sm:w-auto inline-block">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-12 h-14 md:h-16 bg-secondary hover:bg-secondary/90 text-lg md:text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 shine-effect">
                Go to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
