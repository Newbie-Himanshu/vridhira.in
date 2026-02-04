
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Shield, Calendar, Loader2, LogOut, Package, 
  CheckCircle2, AlertTriangle, PhoneIncoming, Info, Clock, 
  LayoutDashboard, ChevronRight, Settings, Palette, Bell, Save,
  Sparkles, MapPin, Phone, Hash, AtSign, Fingerprint
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  
  // Profile Editing State
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    bio: '',
    address: '',
    phoneNumber: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const prefRef = useMemoFirebase(() => 
    user ? doc(db, 'user_preferences', user.uid) : null,
    [db, user]
  );

  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);
  const { data: preferences, isLoading: isPrefsLoading } = useDoc<any>(prefRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      const currentPath = window.location.pathname;
      router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    }
    if (user && customer) {
      setProfileData({
        displayName: user.displayName || '',
        username: customer.username || '',
        bio: customer.bio || '',
        address: customer.address || '',
        phoneNumber: customer.phoneNumber || ''
      });
    }
  }, [user, customer, isUserLoading, router]);

  // Timer for ban status
  useEffect(() => {
    if (!customer?.banUntil) return;
    
    const interval = setInterval(() => {
      const until = new Date(customer.banUntil!).getTime();
      const now = new Date().getTime();
      const diff = until - now;
      
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [customer?.banUntil]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateProfile(user, { displayName: profileData.displayName });
      
      const userRef = doc(db, 'users', user.uid);
      updateDocumentNonBlocking(userRef, { displayName: profileData.displayName });
      
      const customerRef = doc(db, 'customers', user.uid);
      updateDocumentNonBlocking(customerRef, { 
        username: profileData.username,
        bio: profileData.bio,
        address: profileData.address,
        phoneNumber: profileData.phoneNumber
      });
      
      toast({ title: "Profile Updated", description: "Your changes have been successfully saved." });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not save profile changes." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingPhone(true);
    
    // Test code for phone verification
    if (phoneOtp === '123456') {
      setTimeout(() => {
        const customerRef = doc(db, 'customers', user!.uid);
        updateDocumentNonBlocking(customerRef, { phoneNumberVerified: true });
        setVerifyingPhone(false);
        setShowPhoneVerify(false);
        toast({ title: "Phone Verified", description: "Your phone number has been confirmed." });
      }, 1000);
    } else {
      setVerifyingPhone(false);
      toast({ variant: "destructive", title: "Invalid Code", description: "Please enter the correct verification code." });
    }
  };

  const handleUpdatePreference = (key: string, value: any) => {
    if (!user) return;
    setDocumentNonBlocking(prefRef!, { [key]: value }, { merge: true });
    toast({ title: "Preference Saved", description: `${key} updated successfully.` });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customer) return;

    if (customer.banUntil && new Date(customer.banUntil) > new Date()) {
      toast({
        variant: "destructive",
        title: "Access Restricted",
        description: `Too many failed attempts. Try again in ${timeLeft}.`,
      });
      return;
    }

    setVerifying(true);
    
    if (otp === '123456') {
      const customerRef = doc(db, 'customers', user.uid);
      updateDocumentNonBlocking(customerRef, { 
        isVerified: true,
        failedAttempts: 0,
        banUntil: null
      });
      setTimeout(() => {
        setVerifying(false);
        setShowOtpInput(false);
        toast({
          title: "Account Verified",
          description: "Your heritage identity has been successfully confirmed.",
        });
        
        const returnTo = searchParams.get('returnTo');
        if (returnTo) router.push(returnTo);
      }, 1000);
    } else {
      const newAttempts = (customer.failedAttempts || 0) + 1;
      const customerRef = doc(db, 'customers', user.uid);
      
      if (newAttempts >= 5) {
        const banDate = new Date();
        banDate.setHours(banDate.getHours() + 24);
        updateDocumentNonBlocking(customerRef, { 
          failedAttempts: newAttempts,
          banUntil: banDate.toISOString()
        });
        toast({
          variant: "destructive",
          title: "Security Ban Triggered",
          description: "5 failed attempts. Access restricted for 24 hours.",
        });
        setVerifying(false);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        updateDocumentNonBlocking(customerRef, { failedAttempts: newAttempts });
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: `Attempt ${newAttempts} of 5. Please enter the correct code.`,
        });
        setVerifying(false);
      }
    }
  };

  if (isUserLoading || isCustomerLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const isBanned = timeLeft !== null;
  const isAdmin = customer?.role === 'owner' || customer?.role === 'store admin';
  const userInitials = (profileData.displayName || user.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-32 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest px-4 py-1">Member Profile</Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-secondary">Your Heritage</h1>
          <p className="text-muted-foreground italic">Manage your identity and preferences on the marketplace.</p>
        </div>
        <div className="flex gap-4">
          {isAdmin && (
            <Link href="/admin/dashboard">
              <Button className="rounded-full px-6 bg-secondary text-white hover:bg-secondary/90 shadow-lg gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin Portal
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleSignOut} className="rounded-full px-6 border-destructive/20 text-destructive hover:bg-destructive/5">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {!customer?.isVerified && (
        <Alert className="bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
              {isBanned ? <Clock className="h-8 w-8 text-destructive" /> : <PhoneIncoming className="h-8 w-8 text-primary" />}
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <AlertTitle className="text-2xl font-headline font-bold text-secondary mb-2">
                  {isBanned ? "Identity Verification Restricted" : "Verify Your Heritage Identity"}
                </AlertTitle>
                <AlertDescription className="text-muted-foreground text-lg">
                  {isBanned 
                    ? "Too many failed attempts. For your security, identity verification is temporarily locked." 
                    : "Complete our verification process (Code: 123456) to unlock full marketplace features."}
                </AlertDescription>
              </div>
              
              {!isBanned && (
                showOtpInput ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm">
                    <Input 
                      type="text" 
                      maxLength={6} 
                      className="h-16 text-center text-3xl font-black tracking-[0.4em] rounded-2xl border-2" 
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <div className="flex gap-4">
                      <Button className="flex-1 h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold" disabled={verifying}>
                        {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Identity"}
                      </Button>
                      <Button type="button" variant="ghost" className="h-14 rounded-2xl" onClick={() => setShowOtpInput(false)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-2xl" onClick={() => setShowOtpInput(true)}>
                    Enter Verification Code
                  </Button>
                )
              )}
            </div>
          </div>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white/50 backdrop-blur border rounded-full p-1 mb-8 h-14">
          <TabsTrigger value="overview" className="rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-none shadow-xl bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden artisan-pattern">
              <CardHeader className="bg-secondary text-secondary-foreground p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-3xl font-bold shadow-2xl animate-subtle-float">
                    {userInitials}
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-headline">{profileData.displayName || 'Artisan Enthusiast'}</CardTitle>
                    <CardDescription className="text-secondary-foreground/70">{profileData.username ? `@${profileData.username}` : user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase text-primary">Access Level</span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold capitalize">{customer?.role || 'user'}</span>
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase text-primary">Identity Status</span>
                    <div className="flex items-center justify-between">
                      {customer?.isVerified ? (
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive">Unverified</Badge>
                      )}
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-2 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase text-primary">Address</span>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.address || 'No address set'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-white rounded-3xl p-6">
                <h3 className="font-headline font-bold text-xl mb-4 text-secondary flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    User ID
                </h3>
                <div className="bg-muted p-4 rounded-xl flex items-center justify-between group">
                    <code className="text-xs font-code truncate max-w-[150px]">{user.uid}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                        navigator.clipboard.writeText(user.uid);
                        toast({ title: "ID Copied", description: "Your UID has been copied to clipboard." });
                    }}>
                        <Package className="h-4 w-4" />
                    </Button>
                </div>
              </Card>
              <Card className="border-none shadow-lg bg-secondary text-white rounded-3xl p-6">
                <h3 className="font-headline font-bold text-xl mb-2">Heritage Rewards</h3>
                <p className="text-xs opacity-80">Support 5 artisans to reach the next tier.</p>
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-primary" />
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 max-w-2xl mx-auto">
            <CardHeader className="px-0 pt-0 text-center items-center">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 rounded-full border-4 border-muted shadow-xl">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="text-4xl bg-primary text-white font-headline font-bold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full shadow-lg h-10 w-10 bg-white hover:bg-primary hover:text-white transition-all">
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-12">Upload / Generate a new avatar</p>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input 
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="h-14 rounded-2xl border-2 bg-muted/20"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="h-14 rounded-2xl border-2 bg-muted/20 pl-11"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="min-h-[120px] rounded-2xl border-2 bg-muted/20 p-4"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="min-h-[100px] rounded-2xl border-2 bg-muted/20 pl-11 pt-4"
                      placeholder="Street, City, Zip Code"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        className="h-14 rounded-2xl border-2 bg-muted/20 pl-11"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                    {!customer?.phoneNumberVerified && profileData.phoneNumber && (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="h-14 rounded-2xl px-6 bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => setShowPhoneVerify(true)}
                      >
                        Verify
                      </Button>
                    )}
                    {customer?.phoneNumberVerified && (
                        <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                    )}
                  </div>
                  {showPhoneVerify && (
                    <div className="mt-4 p-6 bg-primary/5 rounded-2xl border border-primary/20 animate-in slide-in-from-top-2">
                        <p className="text-sm font-bold text-secondary mb-4">Verify Phone (Test Code: 123456)</p>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="000000" 
                                maxLength={6}
                                value={phoneOtp}
                                onChange={(e) => setPhoneOtp(e.target.value)}
                                className="h-12 text-center text-xl font-bold tracking-widest rounded-xl"
                            />
                            <Button 
                                onClick={handleVerifyPhone}
                                disabled={verifyingPhone}
                                className="h-12 rounded-xl bg-secondary text-white px-8"
                            >
                                {verifyingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => setShowPhoneVerify(false)}
                                className="h-12 rounded-xl"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                  )}
                </div>

                <Button 
                    className="w-full h-16 rounded-[2rem] bg-secondary text-white font-bold text-lg shadow-xl hover:scale-[1.02] transition-all" 
                    disabled={savingProfile}
                >
                  {savingProfile ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3" />}
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <Palette className="h-6 w-6 text-primary" />
                  Appearance & Localization
                </CardTitle>
                <CardDescription>Tailor the app interface to your liking.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-6 space-y-6">
                <div className="space-y-3">
                  <Label>Marketplace Theme</Label>
                  <Select 
                    value={preferences?.theme || 'light'} 
                    onValueChange={(val) => handleUpdatePreference('theme', val)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Artisan Light</SelectItem>
                      <SelectItem value="dark">Heritage Dark</SelectItem>
                      <SelectItem value="sepia">Vintage Sepia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Preferred Currency</Label>
                  <Select 
                    value={preferences?.currency || 'USD'} 
                    onValueChange={(val) => handleUpdatePreference('currency', val)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Control how we keep you updated about your treasures.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive order updates and artisan stories.</p>
                  </div>
                  <Switch 
                    checked={preferences?.emailNotifications ?? true} 
                    onCheckedChange={(val) => handleUpdatePreference('emailNotifications', val)} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get instant alerts for delivery status.</p>
                  </div>
                  <Switch 
                    checked={preferences?.smsNotifications ?? false} 
                    onCheckedChange={(val) => handleUpdatePreference('smsNotifications', val)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
