'use client';

import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AddressTab = () => {
  const addresses = [
    { id: 1, title: 'Home Sanctuary', name: 'Elena Fisher', street: '123 Artisan Way, Apt 4B', city: 'Portland', state: 'OR', zip: '97205', country: 'USA', isDefault: true },
    { id: 2, title: 'Heritage Studio', name: 'Elena Fisher', street: '45 Studio Blvd', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA', isDefault: false },
  ];

  return (
    <div className="flex-1 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-end justify-between border-b border-black/5 pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-secondary">Address Registry</h2>
          <p className="text-muted-foreground italic">Manage your heritage delivery coordinates.</p>
        </div>
        <Button className="rounded-full bg-primary text-white font-bold text-xs gap-2 px-6">
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <Card key={addr.id} className="p-8 rounded-[2.5rem] border border-white/40 bg-white/40 shadow-xl hover:bg-white/60 transition-all flex flex-col gap-6 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary">{addr.title}</h4>
                  {addr.isDefault && <span className="text-[8px] font-black uppercase tracking-widest text-primary">Primary Location</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
              <p className="font-bold text-secondary">{addr.name}</p>
              <p>{addr.street}</p>
              <p>{addr.city}, {addr.state} {addr.zip}</p>
              <p>{addr.country}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddressTab;
