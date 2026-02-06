'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Receipt, 
  Truck, 
  Store, 
  CreditCard, 
  Settings, 
  Users, 
  FileText, 
  ChevronRight, 
  Headset, 
  MessageSquare,
  ArrowRight,
  Home
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: Receipt, title: 'Buying & Orders', desc: 'Tracking, returns, cancellations and order issues.' },
    { icon: Truck, title: 'Shipping & Delivery', desc: 'Delivery times, shipping costs, and international policies.' },
    { icon: Store, title: 'Selling & Shop', desc: 'Managing listings, shop policies, and sales analytics.' },
    { icon: CreditCard, title: 'Payments & Billing', desc: 'Payout schedules, taxes, fees and banking setup.' },
    { icon: Settings, title: 'Account Settings', desc: 'Password resets, profile updates, and privacy controls.' },
    { icon: Users, title: 'Community', desc: 'Forums, artisan teams, local events and workshops.' },
  ];

  const articles = [
    { icon: FileText, title: 'How do I open a shop?', desc: 'Step-by-step guide to setting up your first artisan storefront.' },
    { icon: Truck, title: 'Tracking my handmade order', desc: 'Find out when your unique item will arrive.' },
    { icon: CreditCard, title: 'Understanding artisan fees', desc: 'Breakdown of listing fees, transaction costs, and VAT.' },
  ];

  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 pt-20 bg-background-light dark:bg-background-dark animate-in fade-in duration-1000">
      {/* Classic Full-Screen Hero */}
      <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/heritage-help/1920/1080" 
            alt="Support Background" 
            className="w-full h-full object-cover brightness-[0.4]"
            data-ai-hint="heritage support"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background-light dark:to-background-dark" />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl px-6 text-center flex flex-col items-center gap-8">
          <div className="space-y-4">
            <span className="inline-flex px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.3em] animate-subtle-float">
              Knowledge Base
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
              How can we help you?
            </h1>
          </div>

          <div className="w-full max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden group-focus-within:bg-white/20 transition-all">
              <Search className="ml-6 h-6 w-6 text-white/60" />
              <Input 
                className="h-16 md:h-20 border-none bg-transparent text-lg md:text-xl text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-4" 
                placeholder="Search articles, policies, or topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="mr-3 h-12 md:h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl transition-all">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="border-b border-border-light dark:border-border-dark bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
            <Link className="hover:text-primary transition-colors flex items-center gap-1" href="/">
              <Home className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 opacity-30" />
            <span className="text-text-main-light dark:text-white">Help Center</span>
          </nav>
        </div>
      </div>

      {/* Main Content Sections - Preservation of existing structure */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Aside Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1">
            <div className="sticky top-32 space-y-10">
              <div>
                <h3 className="font-headline text-lg font-bold mb-6 text-text-main-light dark:text-white uppercase tracking-widest opacity-60">Registry Navigation</h3>
                <nav className="space-y-2">
                  {[
                    { icon: Home, label: 'Overview', active: true },
                    { icon: Receipt, label: 'Buying' },
                    { icon: Store, label: 'Selling' },
                    { icon: Settings, label: 'Account' },
                    { icon: MessageSquare, label: 'Trust & Safety' },
                  ].map((item, i) => (
                    <Link 
                      key={i} 
                      className={cn(
                        "group flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-500",
                        item.active 
                          ? "bg-primary/10 text-primary font-bold shadow-sm border-l-4 border-primary" 
                          : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-white dark:hover:bg-white/5 hover:text-primary"
                      )} 
                      href="#"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-border-light dark:border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Headset className="h-40 w-40" />
                </div>
                <h4 className="font-headline font-bold text-xl mb-3 relative z-10">Personal Assistance</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 relative z-10 leading-relaxed font-light">
                  Our heritage support team is standing by to assist with complex inquiries.
                </p>
                <Button className="w-full h-12 bg-secondary text-white rounded-xl shadow-lg font-bold gap-2 group/btn relative z-10">
                  Contact Support <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 order-1 lg:order-2 space-y-20">
            <section>
              <div className="flex items-end justify-between mb-8 border-b border-border-light dark:border-white/10 pb-6">
                <div>
                  <h2 className="font-headline text-3xl text-text-main-light dark:text-white font-bold">Browse Categories</h2>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 font-light">Select a collection to find solutions.</p>
                </div>
              </div>
              
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((cat, i) => (
                    <Link key={i} className="group flex flex-col p-8 bg-white dark:bg-white/5 rounded-[2rem] border border-transparent hover:border-primary/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700" href="#">
                      <div className="mb-6 h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        <cat.icon className="h-7 w-7" />
                      </div>
                      <h3 className="font-headline text-xl font-bold text-text-main-light dark:text-white mb-2 group-hover:text-primary transition-colors">{cat.title}</h3>
                      <p className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark font-light">{cat.desc}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <p className="text-xl font-headline font-bold text-muted-foreground">No categories matched your query.</p>
                </div>
              )}
            </section>

            <section className="bg-white dark:bg-white/5 rounded-[3rem] p-8 md:p-12 shadow-xl border border-border-light dark:border-white/10">
              <div className="flex items-baseline justify-between mb-10">
                <h2 className="font-headline text-3xl font-bold text-text-main-light dark:text-white">Frequent Articles</h2>
                <Link className="text-sm font-bold text-primary hover:underline flex items-center gap-2" href="#">View Archive <ArrowRight className="h-4 w-4" /></Link>
              </div>
              
              {filteredArticles.length > 0 ? (
                <div className="space-y-4">
                  {filteredArticles.map((art, i) => (
                    <Link key={i} className="group flex items-center gap-6 p-6 rounded-[1.5rem] hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10" href="#">
                      <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <art.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-headline font-bold text-lg text-text-main-light dark:text-white truncate group-hover:text-primary transition-colors">{art.title}</h4>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 truncate font-light">{art.desc}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all opacity-40" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground font-light italic">No matching articles found.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Footer Design Callout */}
      <div className="mt-auto border-t border-border-light dark:border-white/10 bg-white dark:bg-background-dark py-20 artisan-pattern">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse-glow">
            <Headset className="h-10 w-10" />
          </div>
          <div className="space-y-4">
            <h2 className="font-headline text-4xl font-bold text-text-main-light dark:text-white">Still searching?</h2>
            <p className="text-lg leading-relaxed text-text-secondary-light dark:text-text-secondary-dark font-light max-w-lg mx-auto">
              Our master support team is available 24/7 to safeguard your creative journey and shop experience.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button className="w-full sm:w-auto h-14 px-12 rounded-full bg-primary text-white font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-transform shine-effect">
              Start Chat
            </Button>
            <Button variant="outline" className="w-full sm:w-auto h-14 px-12 rounded-full border-primary/20 text-primary font-bold text-lg hover:bg-primary/5 transition-colors">
              Community Forum
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
