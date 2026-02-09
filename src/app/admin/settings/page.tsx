'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShieldAlert,
  Megaphone,
  DollarSign,
  Settings2,
  Loader2,
  Zap,
  Lock,
  Unlock,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function GlobalSettingsPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('platform_settings').select('*').eq('id', 'global').single();
    if (data) {
      setSettings({
        ...data,
        maintenance_mode: data.maintenance_mode,
        platform_fee_percentage: data.platform_fee_percentage,
        show_announcement: data.show_announcement,
        announcement_message: data.announcement_message,
        announcement_type: data.announcement_type,
        analytics_enabled: data.analytics_enabled,
        ga4_measurement_id: data.ga4_measurement_id,
        gtm_container_id: data.gtm_container_id
      });
    } else {
      // Init default if not exists
      setSettings({
        id: 'global',
        maintenance_mode: false,
        platform_fee_percentage: 0.10,
        show_announcement: false,
        announcement_message: "",
        announcement_type: "info",
        analytics_enabled: false,
        ga4_measurement_id: "",
        gtm_container_id: ""
      });
    }
    setIsLoading(false);
  };

  const handleSave = async (updates: any) => {
    setSaving(true);
    const newSettings = { ...settings, ...updates };

    const { error } = await supabase.from('platform_settings').upsert(newSettings);

    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update settings." });
    } else {
      setSettings(newSettings);
      toast({
        title: "Platform Updated",
        description: "Global settings have been applied to the marketplace."
      });
    }
    setSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  const currentSettings = settings || {
    maintenanceMode: false,
    platformFeePercentage: 0.10,
    showAnnouncement: false,
    announcementMessage: "",
    announcementType: "info",
    analyticsEnabled: false,
    ga4MeasurementId: "",
    gtmContainerId: ""
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-secondary flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary" />
          Global Platform Control
        </h1>
        <p className="text-muted-foreground">Master toggles and operational variables for the entire marketplace.</p>
      </div>

      <div className="grid gap-8">
        {/* Maintenance Mode */}
        <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
          <CardHeader className="bg-destructive/10 border-b border-destructive/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Operational Lock (Maintenance)</CardTitle>
                  <CardDescription className="text-destructive/70">Instantly stop all customer checkouts.</CardDescription>
                </div>
              </div>
              <Switch
                checked={currentSettings.maintenanceMode}
                onCheckedChange={(val) => handleSave({ maintenanceMode: val })}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {currentSettings.maintenanceMode ? (
              <Alert variant="destructive" className="bg-white/50 border-destructive/20">
                <Lock className="h-4 w-4" />
                <AlertTitle>Platform is LOCKED</AlertTitle>
                <AlertDescription>Customers can browse but cannot add to cart or checkout.</AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <Unlock className="h-4 w-4" />
                Platform is currently live and accepting orders.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Fee */}
        <Card className="border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Parameters
            </CardTitle>
            <CardDescription>Configure the global fee applied to every transaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6">
              <div className="space-y-2 flex-1">
                <Label>Platform Fee (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={currentSettings.platformFeePercentage * 100}
                    onBlur={(e) => handleSave({ platformFeePercentage: Number(e.target.value) / 100 })}
                    className="h-12 text-lg font-bold pl-10"
                  />
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 w-48 text-center">
                <p className="text-[10px] uppercase font-bold text-primary mb-1">Effective Rate</p>
                <p className="text-3xl font-black text-secondary">{(currentSettings.platformFeePercentage * 100).toFixed(1)}%</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              This fee is automatically calculated during checkout. Changes reflect instantly for all active carts.
            </p>
          </CardContent>
        </Card>

        {/* Global Announcement */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                <CardTitle>Broadcast Banner</CardTitle>
              </div>
              <Switch
                checked={currentSettings.showAnnouncement}
                onCheckedChange={(val) => handleSave({ showAnnouncement: val })}
              />
            </div>
            <CardDescription>Display a site-wide alert message to all visitors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Message</Label>
              <Textarea
                placeholder="e.g., Free shipping on all silk sarees this weekend!"
                value={currentSettings.announcementMessage}
                onChange={(e) => setSettings({ ...currentSettings, announcementMessage: e.target.value })}
                onBlur={() => handleSave({ announcementMessage: currentSettings.announcementMessage })}
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Message Style</Label>
              <Select
                value={currentSettings.announcementType}
                onValueChange={(val) => handleSave({ announcementType: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informational (Blue)</SelectItem>
                  <SelectItem value="success">Success (Green)</SelectItem>
                  <SelectItem value="warning">Warning (Orange)</SelectItem>
                  <SelectItem value="destructive">Urgent (Red)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs italic text-muted-foreground">Changes are live immediately upon toggle.</span>
              {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
          </CardFooter>
        </Card>
        {/* Analytics Configuration */}
        <Card className="shadow-xl border-blue-100">
          <CardHeader className="bg-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <CardTitle>Analytics & Tracking</CardTitle>
              </div>
              <Switch
                checked={currentSettings.analytics_enabled}
                onCheckedChange={(val) => handleSave({ analytics_enabled: val })}
              />
            </div>
            <CardDescription>Configure Google Analytics 4 and Tag Manager integration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GA4 Measurement ID</Label>
                <Input
                  placeholder="G-XXXXXXXXXX"
                  value={currentSettings.ga4_measurement_id || ''}
                  onChange={(e) => setSettings({ ...currentSettings, ga4_measurement_id: e.target.value })}
                  onBlur={() => handleSave({ ga4_measurement_id: currentSettings.ga4_measurement_id })}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Found in GA4 Admin &gt; Data Streams.</p>
              </div>
              <div className="space-y-2">
                <Label>GTM Container ID</Label>
                <Input
                  placeholder="GTM-XXXXXXX"
                  value={currentSettings.gtm_container_id || ''}
                  onChange={(e) => setSettings({ ...currentSettings, gtm_container_id: e.target.value })}
                  onBlur={() => handleSave({ gtm_container_id: currentSettings.gtm_container_id })}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Found in GTM Workspace header.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
