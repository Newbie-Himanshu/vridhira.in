'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  History, 
  ArrowRightAlt, 
  LocalShipping, 
  SupportAgent, 
  ArrowForward,
  ExpandMore
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StorePoliciesPage() {
  const policies = [
    { name: 'Shipping Policy', icon: <LocalShipping className="h-5 w-5" /> },
    { name: 'Returns & Refunds' },
    { name: 'Privacy Policy' },
    { name: 'Terms of Service' },
    { name: 'Cookie Policy' },
    { name: 'Seller Guidelines' }
  ];

  return (
    <div className="flex-1 flex justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link className="text-muted-foreground hover:text-primary transition-colors" href="/">Home</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          <Link className="text-muted-foreground hover:text-primary transition-colors" href="/help-center">Help Center</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          <span className="font-medium text-foreground">Store Policies</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="hidden lg:block">
                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-primary mb-4 px-3">Policies</h3>
                <nav className="flex flex-col space-y-1">
                  {policies.map((policy) => (
                    <Link 
                      key={policy.name} 
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-500",
                        policy.name === 'Shipping Policy' 
                          ? "bg-primary/10 text-primary font-bold shadow-sm" 
                          : "text-muted-foreground hover:bg-card hover:text-primary hover:-translate-x-1"
                      )} 
                      href="#"
                    >
                      <span className="text-sm">{policy.name}</span>
                      {policy.icon}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Dropdown - Liquid Glass Style */}
              <div className="lg:hidden">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 px-2">Select Policy</label>
                <Select defaultValue="Shipping Policy">
                  <SelectTrigger className="h-14 rounded-[1.5rem] border border-white/40 bg-white/20 dark:bg-white/5 backdrop-blur-3xl px-6 text-base font-bold text-foreground shadow-xl">
                    <SelectValue placeholder="Select Policy" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[1.5rem] border-white/20 shadow-2xl">
                    {policies.map((p) => (
                      <SelectItem key={p.name} value={p.name} className="rounded-xl py-3 px-4 focus:bg-primary/10 focus:text-primary">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Support Card */}
              <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl group">
                <div className="flex flex-col gap-4">
                  <div className="p-3 w-fit rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Headset className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Need more help?</h4>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-light">Our support team is available 24/7 to assist with any questions.</p>
                    <Link className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-2" href="#">
                      Contact Support
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-card rounded-[3rem] shadow-2xl border border-border p-8 md:p-12 lg:p-16 relative overflow-hidden">
              {/* Subtle inner glow for identity */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
              
              <header className="mb-12 pb-8 border-b relative z-10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Active Protocol</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground tracking-tighter leading-none">Shipping Policy</h1>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 italic">
                    <History className="h-4 w-4" />
                    Last updated: October 24, 2023
                  </p>
                </div>
              </header>

              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground relative z-10">
                <p className="lead text-lg md:text-xl text-foreground mb-10 leading-relaxed font-light">
                  We want you to be completely satisfied with your unique handmade purchase. Because every item on Vridhira is crafted by an independent artist, shipping times and methods may vary slightly, but we hold all our sellers to the following high standards.
                </p>

                <div className="bg-background/50 border rounded-[2rem] p-8 mb-12 shadow-inner">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">In this Registry</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
                    {['Processing Time', 'Estimated Delivery', 'Tracking Your Order', 'Customs & Import Taxes'].map((item, i) => (
                      <li key={i}>
                        <a className="flex items-center gap-3 text-foreground hover:text-primary transition-all group no-underline text-sm font-bold" href={`#${item.toLowerCase().replace(/ /g, '-')}`}>
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                            <ArrowRight className="h-3 w-3 text-primary" />
                          </div>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <section className="mb-16 scroll-mt-28" id="processing-time">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black">1</div>
                    <h2 className="text-3xl font-headline font-bold text-foreground m-0 tracking-tight">Processing Time</h2>
                  </div>
                  <p className="mb-6 font-light leading-relaxed">
                    The time I need to prepare an order for shipping varies. For details, see individual items. Generally, since items are handmade with care:
                  </p>
                  <ul className="grid gap-4 list-none p-0">
                    {[
                      { label: 'In-stock items', value: 'Ships within 1-3 business days.' },
                      { label: 'Made-to-order items', value: 'Can take 1-2 weeks depending on complexity.' },
                      { label: 'Custom commissions', value: 'Timelines agreed upon directly with the artisan.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 p-4 rounded-2xl border border-dashed border-border/60 bg-white/5">
                        <span className="font-bold text-primary shrink-0">{item.label}:</span>
                        <span className="font-light">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mb-16 scroll-mt-28" id="estimated-delivery">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black">2</div>
                    <h2 className="text-3xl font-headline font-bold text-foreground m-0 tracking-tight">Estimated Delivery</h2>
                  </div>
                  <p className="mb-8 font-light leading-relaxed">
                    Once your order is dispatched, estimated transit times are as follows. We do our best to meet these estimates, but cannot guarantee them.
                  </p>
                  <div className="overflow-hidden rounded-[2rem] border border-border shadow-sm">
                    <table className="w-full text-left border-collapse text-sm m-0">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          <th className="p-6 font-black uppercase tracking-widest text-[10px] text-foreground">Region</th>
                          <th className="p-6 font-black uppercase tracking-widest text-[10px] text-foreground">Standard</th>
                          <th className="p-6 font-black uppercase tracking-widest text-[10px] text-foreground">Express</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          ['North America', '3-5 business days', '1-2 business days'],
                          ['Europe', '7-14 business days', '3-5 business days'],
                          ['Asia Pacific', '10-20 business days', '5-7 business days'],
                          ['Australia & NZ', '12-25 business days', '5-10 business days']
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-muted/10 transition-colors">
                            <td className="p-6 font-bold text-foreground">{row[0]}</td>
                            <td className="p-6 font-light">{row[1]}</td>
                            <td className="p-6 font-light">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}