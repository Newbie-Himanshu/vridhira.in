'use client';

import { Bell, ShieldCheck, Tag, Package, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationsTab = () => {
  const settings = [
    { id: 'orders', title: 'Order Protocol', desc: 'Updates on acquisition progress, shipping, and delivery.', icon: Package },
    { id: 'security', title: 'Registry Security', desc: 'Alerts regarding your heritage identity and access.', icon: ShieldCheck },
    { id: 'promos', title: 'Collector Exclusives', desc: 'Early access to limited heritage drops and events.', icon: Star },
    { id: 'offers', title: 'Artisan Messages', desc: 'Direct communications and custom commission updates.', icon: Tag },
  ];

  return (
    <div className="flex-1 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-end justify-between border-b border-black/5 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-secondary">Alert Preferences</h2>
          <p className="text-muted-foreground italic">Calibrate how the registry communicates with you.</p>
        </div>
        <Bell className="h-8 w-8 text-primary opacity-20" />
      </div>

      <div className="bg-white/40 rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden divide-y divide-black/5">
        {settings.map((s) => (
          <div key={s.id} className="p-8 flex items-center justify-between hover:bg-white/20 transition-all group">
            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-2xl bg-white/60 shadow-inner flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <Label htmlFor={s.id} className="text-lg font-bold text-secondary cursor-pointer">{s.title}</Label>
                <p className="text-sm text-muted-foreground max-w-md font-light leading-relaxed">{s.desc}</p>
              </div>
            </div>
            <Switch id={s.id} defaultChecked className="data-[state=checked]:bg-primary" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsTab;
