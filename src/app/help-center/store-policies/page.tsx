import React from 'react';
import Link from 'next/link';

export default function StorePoliciesPage() {
  return (
    <div className="flex-1 flex justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
          <Link className="text-[#9a6c4c] hover:text-primary transition-colors" href="/">Home</Link>
          <span className="material-symbols-outlined text-[#9a6c4c] text-[16px]">chevron_right</span>
          <Link className="text-[#9a6c4c] hover:text-primary transition-colors" href="/help-center">Help Center</Link>
          <span className="material-symbols-outlined text-[#9a6c4c] text-[16px]">chevron_right</span>
          <span className="font-medium text-text-main-light dark:text-white">Store Policies</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="hidden lg:block">
                <h3 className="text-sm uppercase tracking-wider text-[#9a6c4c] font-bold mb-4 px-3">Policies</h3>
                <nav className="flex flex-col space-y-1">
                  <Link className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-bold border-l-4 border-primary transition-all" href="#">
                    <span>Shipping Policy</span>
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  </Link>
                  {['Returns & Refunds', 'Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Seller Guidelines'].map((policy) => (
                    <Link key={policy} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#f3ece7] dark:hover:bg-[#2c221b] text-[#5c4a3e] dark:text-[#d4c5bb] font-medium transition-colors border-l-4 border-transparent" href="#">
                      <span>{policy}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Dropdown */}
              <div className="lg:hidden">
                <label className="block text-sm font-medium text-text-main-light dark:text-white mb-2" htmlFor="policy-select">Select Policy</label>
                <div className="relative">
                  <select defaultValue="Shipping Policy" className="block w-full rounded-lg border-[#e5e0dc] dark:border-[#3a2e26] bg-white dark:bg-background-dark py-3 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm" id="policy-select">
                    <option>Shipping Policy</option>
                    <option>Returns & Refunds</option>
                    <option>Privacy Policy</option>
                    <option>Terms of Service</option>
                    <option>Cookie Policy</option>
                    <option>Seller Guidelines</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#9a6c4c]">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Contact Support Card */}
              <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main-light dark:text-white mb-1">Need more help?</h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3 leading-relaxed">Our support team is available 24/7 to assist with any questions.</p>
                    <Link className="text-sm font-bold text-primary hover:text-orange-600 inline-flex items-center gap-1" href="#">
                      Contact Support
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-10 lg:p-12">
              {/* Content Header */}
              <header className="mb-10 pb-6 border-b border-[#f3ece7] dark:border-[#2c221b]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Current Policy</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-main-light dark:text-white tracking-tight">Shipping Policy</h1>
                  <p className="text-[#9a6c4c] text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">history</span>
                    Last updated: October 24, 2023
                  </p>
                </div>
              </header>

              {/* Content Body */}
              <div className="prose prose-lg dark:prose-invert max-w-none text-text-secondary-light dark:text-text-secondary-dark">
                <p className="lead text-lg md:text-xl text-text-main-light dark:text-[#e5e0dc] mb-8 leading-relaxed font-outfit">
                  We want you to be completely satisfied with your unique handmade purchase. Because every item on Vridhira is crafted by an independent artist, shipping times and methods may vary slightly, but we hold all our sellers to the following high standards.
                </p>

                <div className="bg-[#fcfaf8] dark:bg-[#221810] p-6 rounded-xl border border-border-light dark:border-border-dark mb-10">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#9a6c4c] mb-4">On this page</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-medium list-none p-0">
                    {['Processing Time', 'Estimated Delivery', 'Tracking Your Order', 'Customs & Import Taxes'].map((item, i) => (
                      <li key={i}><a className="flex items-center gap-2 hover:text-primary transition-colors no-underline" href={`#${item.toLowerCase().replace(/ /g, '-')}`}><span className="material-symbols-outlined text-sm text-primary">arrow_right_alt</span> {item}</a></li>
                    ))}
                  </ul>
                </div>

                <section className="mb-10 scroll-mt-28" id="processing-time">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                    <h2 className="text-2xl font-bold text-text-main-light dark:text-white m-0">Processing Time</h2>
                  </div>
                  <p className="mb-4">
                    The time I need to prepare an order for shipping varies. For details, see individual items. Generally, since items are handmade with care:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                    <li><strong>In-stock items:</strong> Ships within 1-3 business days.</li>
                    <li><strong>Made-to-order items:</strong> Can take 1-2 weeks depending on the complexity of the craft.</li>
                    <li><strong>Custom commissions:</strong> Timelines will be agreed upon directly with the artisan via messages.</li>
                  </ul>
                </section>

                <section className="mb-10 scroll-mt-28" id="estimated-delivery">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                    <h2 className="text-2xl font-bold text-text-main-light dark:text-white m-0">Estimated Delivery Times</h2>
                  </div>
                  <p className="mb-6">
                    Once your order is dispatched, estimated transit times are as follows. We do our best to meet these shipping estimates, but cannot guarantee them.
                  </p>
                  <div className="overflow-hidden rounded-xl border border-border-light dark:border-border-dark">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-surface-subtle dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
                          <th className="p-4 font-bold text-text-main-light dark:text-white">Region</th>
                          <th className="p-4 font-bold text-text-main-light dark:text-white">Standard Shipping</th>
                          <th className="p-4 font-bold text-text-main-light dark:text-white">Express Shipping</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        <tr>
                          <td className="p-4">North America</td>
                          <td className="p-4">3-5 business days</td>
                          <td className="p-4">1-2 business days</td>
                        </tr>
                        <tr>
                          <td className="p-4">Europe</td>
                          <td className="p-4">7-14 business days</td>
                          <td className="p-4">3-5 business days</td>
                        </tr>
                        <tr>
                          <td className="p-4">Asia Pacific</td>
                          <td className="p-4">10-20 business days</td>
                          <td className="p-4">5-7 business days</td>
                        </tr>
                        <tr>
                          <td className="p-4">Australia & NZ</td>
                          <td className="p-4">12-25 business days</td>
                          <td className="p-4">5-10 business days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="mb-10 scroll-mt-28" id="tracking-your-order">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                    <h2 className="text-2xl font-bold text-text-main-light dark:text-white m-0">Tracking Your Order</h2>
                  </div>
                  <p>
                    All orders include a tracking number which will be emailed to you once the label is created. You can also view tracking information by visiting your account dashboard.
                  </p>
                </section>

                <section className="mb-10 scroll-mt-28" id="customs-&-import-taxes">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">4</span>
                    <h2 className="text-2xl font-bold text-text-main-light dark:text-white m-0">Customs and Import Taxes</h2>
                  </div>
                  <p>
                    Buyers are responsible for any customs and import taxes that may apply. Vridhira is not responsible for delays due to customs.
                  </p>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
