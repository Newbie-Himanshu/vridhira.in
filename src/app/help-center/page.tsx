import React from 'react';
import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-pattern bg-cover bg-center"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 z-0 bg-primary/10 mix-blend-overlay"></div>
        <div className="relative z-10 w-full max-w-4xl px-gr-3 text-center flex flex-col items-center gap-gr-3">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-widest uppercase">
            Help Center
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-white tracking-tight drop-shadow-sm max-w-2xl mx-auto">
            Crafting solutions for your journey.
          </h1>
          <p className="text-lg leading-relaxed text-white/80 font-light max-w-lg mx-auto">
            Find answers about orders, shipping, and managing your artisan shop.
          </p>
          <div className="w-full max-w-2xl mt-gr-3 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <label className="relative flex w-full items-center bg-surface-light rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <span className="pl-6 text-text-secondary-light">
                <span className="material-symbols-outlined !text-[28px]">search</span>
              </span>
              <input 
                className="w-full h-16 border-none bg-transparent px-4 text-lg text-text-main-light placeholder:text-text-secondary-light/60 focus:ring-0 font-body" 
                placeholder="How can we help you today?" 
                type="text"
              />
              <button className="mr-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors text-sm tracking-wide">
                Search
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-gr-3 md:px-gr-4 lg:px-gr-5 py-gr-2">
          <nav className="flex text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <Link className="hover:text-primary transition-colors" href="/">Home</Link>
            <span className="mx-2 text-border-dark/30 dark:text-border-light/30">/</span>
            <span className="text-text-main-light dark:text-text-main-dark font-medium">Help Center</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-gr-3 md:px-gr-4 lg:px-gr-5 py-gr-5">
        <div className="flex flex-col lg:flex-row gap-gr-5">
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 order-2 lg:order-1">
            <div className="sticky top-24 space-y-gr-4">
              <div>
                <h3 className="font-display text-xl font-semibold mb-gr-2 text-text-main-light dark:text-text-main-dark">Quick Navigation</h3>
                <nav className="space-y-1">
                  <Link className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-subtle dark:bg-surface-dark/50 text-primary font-medium border-l-4 border-primary transition-all" href="/help-center">
                    <span className="material-symbols-outlined text-[20px]">home</span>
                    <span>Overview</span>
                  </Link>
                  <Link className="group flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle dark:hover:bg-surface-dark/50 hover:text-primary transition-all" href="#">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">shopping_bag</span>
                    <span>Buying</span>
                  </Link>
                  <Link className="group flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle dark:hover:bg-surface-dark/50 hover:text-primary transition-all" href="#">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">storefront</span>
                    <span>Selling</span>
                  </Link>
                  <Link className="group flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle dark:hover:bg-surface-dark/50 hover:text-primary transition-all" href="#">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">manage_accounts</span>
                    <span>Account</span>
                  </Link>
                  <Link className="group flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-subtle dark:hover:bg-surface-dark/50 hover:text-primary transition-all" href="#">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">verified_user</span>
                    <span>Trust & Safety</span>
                  </Link>
                </nav>
              </div>
              <div className="p-gr-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 opacity-5">
                  <span className="material-symbols-outlined text-[100px]">support_agent</span>
                </div>
                <h4 className="font-display font-semibold text-lg mb-2 relative z-10">Need personal help?</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4 relative z-10 leading-relaxed">
                  Our artisan support team is here to assist you with specific inquiries.
                </p>
                <button className="w-full py-2.5 px-4 bg-transparent border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-all relative z-10">
                  Contact Support
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 order-1 lg:order-2">
            <section className="mb-gr-5">
              <div className="flex items-end justify-between mb-gr-3 border-b border-border-light dark:border-border-dark pb-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium leading-snug text-text-main-light dark:text-text-main-dark">Browse Categories</h2>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1 font-light">Select a topic to find answers</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gr-3">
                {[
                  { icon: 'receipt_long', title: 'Buying & Orders', desc: 'Tracking, returns, cancellations and order issues.' },
                  { icon: 'local_shipping', title: 'Shipping & Delivery', desc: 'Delivery times, shipping costs, and international policies.' },
                  { icon: 'storefront', title: 'Selling & Shop', desc: 'Managing listings, shop policies, and sales analytics.' },
                  { icon: 'credit_card', title: 'Payments & Billing', desc: 'Payout schedules, taxes, fees and banking setup.' },
                  { icon: 'settings', title: 'Account Settings', desc: 'Password resets, profile updates, and privacy controls.' },
                  { icon: 'diversity_3', title: 'Community', desc: 'Forums, artisan teams, local events and workshops.' },
                ].map((cat, i) => (
                  <Link key={i} className="group flex flex-col p-gr-3 bg-surface-light dark:bg-surface-dark rounded-xl border border-transparent hover:border-border-light dark:hover:border-border-dark shadow-sm hover:shadow-md transition-all duration-300" href="#">
                    <div className="mb-4 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                      <span className="material-symbols-outlined !text-[32px]">{cat.icon}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2 group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">{cat.desc}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-surface-light dark:bg-surface-dark rounded-2xl p-gr-4 shadow-sm border border-border-light/50 dark:border-border-dark/50">
              <div className="flex items-baseline justify-between mb-gr-3">
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium leading-snug text-text-main-light dark:text-text-main-dark">Most Viewed</h2>
                <Link className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors tracking-wide" href="#">View all articles →</Link>
              </div>
              <div className="space-y-4">
                {[
                  { icon: 'article', title: 'How do I open a shop?', desc: 'Step-by-step guide to setting up your first artisan storefront.' },
                  { icon: 'local_shipping', title: 'Tracking my handmade order', desc: 'Find out when your unique item will arrive.' },
                  { icon: 'payments', title: 'Understanding artisan fees', desc: 'Breakdown of listing fees, transaction costs, and VAT.' },
                ].map((art, i) => (
                  <Link key={i} className="group flex items-center gap-gr-3 p-4 rounded-xl hover:bg-surface-subtle dark:hover:bg-background-dark/30 transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark" href="#">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{art.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-lg text-text-main-light dark:text-text-main-dark truncate group-hover:text-primary transition-colors">{art.title}</h4>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 truncate">{art.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-border-dark/20 dark:text-border-light/20 group-hover:text-primary transition-colors">chevron_right</span>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Design-specific "Still can't find" Section */}
      <div className="mt-auto border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark py-gr-5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="mb-gr-3 flex justify-center text-primary">
            <span className="material-symbols-outlined text-[48px]">support</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium leading-snug font-bold mb-4 text-text-main-light dark:text-text-main-dark">Still can't find what you need?</h2>
          <p className="text-lg leading-relaxed text-text-secondary-light dark:text-text-secondary-dark mb-8 font-light max-w-lg mx-auto">
            Our dedicated support team is available 24/7 to assist with your creative journey and shop management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-primary/50 transition-all transform hover:-translate-y-0.5">
              Contact Support
            </button>
            <button className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-surface-subtle dark:bg-white/10 px-8 py-3 text-base font-semibold text-text-main-light dark:text-text-main-dark border border-transparent hover:border-border-light dark:hover:border-white/20 transition-all">
              Visit Community Forum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
