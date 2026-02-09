'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageSettings } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Layout, Palette, CheckCircle2, Loader2, Sparkles, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CustomizationPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [settings, setSettings] = useState<PageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('page_customizations').select('*').eq('id', 'global-settings').single();
    if (data) {
      setSettings(data as any);
    } else {
      setSettings({
        id: 'global-settings',
        template: 'v0',
        show_breadcrumbs: true,
        show_related_products: true,
        enable_zoom: false,
        accent_color: '#E07C54'
      } as any);
    }
    setIsLoading(false);
  };

  const handleUpdate = async (updates: any) => {
    setSaving(true);

    // Transform updates if they come in as camelCase, but here likely already handling any
    // We assume the settings state will now track snake_case
    const newSettings = {
      template: 'v0',
      show_breadcrumbs: true,
      show_related_products: true,
      enable_zoom: false,
      accent_color: '#E07C54',
      ...(settings || {}),
      ...updates,
      id: 'global-settings'
    };

    const { error } = await supabase.from('page_customizations').upsert(newSettings);

    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update settings." });
    } else {
      setSettings(newSettings as PageSettings);
      toast({
        title: "Settings updated",
        description: "The marketplace template has been successfully updated.",
      });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentTemplate = settings?.template || 'v0';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary flex items-center gap-3">
            <Layout className="h-8 w-8 text-primary" />
            Store Appearance
          </h1>
          <p className="text-muted-foreground">Customize the layout and visual style of your product pages.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Monitor className="h-3 w-3" />
          Live Preview Active
        </div>
      </div>

      <div className="grid gap-8">
        {/* Template Selector */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Active Template
            </CardTitle>
            <CardDescription>Choose the primary layout for your individual product listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentTemplate}
              onValueChange={(val) => handleUpdate({ template: val as 'v0' | 'modern' })}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="relative">
                <RadioGroupItem value="v0" id="t-v0" className="sr-only" />
                <Label
                  htmlFor="t-v0"
                  className={`block border-2 rounded-2xl p-6 cursor-pointer transition-all ${currentTemplate === 'v0' ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-white hover:border-primary/40'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-headline font-bold text-xl">v0 Minimalist</span>
                    {currentTemplate === 'v0' && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="aspect-video rounded-lg bg-muted border border-border/50 mb-4 overflow-hidden relative">
                    <div className="absolute top-2 left-2 w-1/2 h-1/2 bg-white/40 rounded shadow-sm" />
                    <div className="absolute bottom-2 right-2 w-1/3 h-1/4 bg-white/40 rounded shadow-sm" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Clean, structured, and focused. Perfect for high-volume catalogs and artisanal tools.
                  </p>
                </Label>
              </div>

              <div className="relative">
                <RadioGroupItem value="modern" id="t-modern" className="sr-only" />
                <Label
                  htmlFor="t-modern"
                  className={`block border-2 rounded-2xl p-6 cursor-pointer transition-all ${currentTemplate === 'modern' ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-white hover:border-primary/40'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-headline font-bold text-xl">Modern Bold</span>
                    {currentTemplate === 'modern' && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="aspect-video rounded-lg bg-secondary/5 border border-border/50 mb-4 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Layout className="h-10 w-10 text-secondary/10" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dynamic, immersive, and high-impact. Ideal for luxury textiles and unique art pieces.
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Interface Options
            </CardTitle>
            <CardDescription>Fine-tune specific features for all product pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Breadcrumb Navigation</Label>
                <p className="text-sm text-muted-foreground">Show path from Home to current Category.</p>
              </div>
              <Switch
                checked={settings?.showBreadcrumbs ?? true}
                onCheckedChange={(val) => handleUpdate({ showBreadcrumbs: val })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Related Products</Label>
                <p className="text-sm text-muted-foreground">Display similar items at the bottom of the page.</p>
              </div>
              <Switch
                checked={settings?.showRelatedProducts ?? true}
                onCheckedChange={(val) => handleUpdate({ showRelatedProducts: val })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Image Hover Zoom</Label>
                <p className="text-sm text-muted-foreground">Allow customers to magnify product images.</p>
              </div>
              <Switch
                checked={settings?.enableZoom ?? false}
                onCheckedChange={(val) => handleUpdate({ enableZoom: val })}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 flex justify-between">
            <span className="text-xs text-muted-foreground italic flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Last auto-saved just now
            </span>
            {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
