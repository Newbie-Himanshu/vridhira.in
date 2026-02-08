'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Package, 
  Bell, 
  Heart, 
  Store, 
  MapPin, 
  CreditCard, 
  Settings, 
  Gift, 
  ChevronRight, 
  LogOut,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const auth = useAuth();
  const activeTab = searchParams.get('tab') || 'overview';

  const menuItems = [
    { id: 'overview', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3 New' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: '12' },
    { id: 'artisans', label: 'Saved Artisans', icon: Store },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'giftcards', label: 'Gift Cards', icon: Gift },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 lg:px-20 animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0 flex flex-col gap-10">
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl shadow-inner animate-artisanal-rotation" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-headline font-bold text-secondary">Elena Fisher</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Member since 2021</p>
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-secondary/5 text-secondary border border-secondary/10 w-fit">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Gold Artisan Supporter</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/account?tab=${item.id}`}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl transition-all duration-500 group relative",
                    isActive 
                      ? "bg-white/60 shadow-xl border border-white/40 translate-x-2" 
                      : "hover:bg-white/20 text-muted-foreground hover:text-secondary"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-colors duration-500",
                      isActive ? "bg-primary text-white shadow-lg" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-sm font-bold tracking-tight",
                      isActive ? "text-secondary" : "group-hover:translate-x-1 transition-transform"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                        isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all duration-500",
                      isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0"
                    )} />
                  </div>
                </Link>
              );
            })}
            
            <button 
              onClick={() => signOut(auth)}
              className="mt-6 flex items-center gap-4 p-5 rounded-2xl text-destructive hover:bg-destructive/5 transition-all font-bold group"
            >
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white transition-colors duration-500">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="text-sm">Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 min-w-0">
          <div className="bg-white/20 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 shadow-2xl p-8 md:p-12 min-h-[800px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="relative z-10 h-full flex flex-col">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AccountLayout;
