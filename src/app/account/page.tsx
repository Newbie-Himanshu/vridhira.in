'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Customer, Order } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LogOut, Package, Clock, ShieldAlert, CheckCircle2, 
  User as UserIcon, MapPin, AtSign, Loader2, Save, ShoppingBag, 
  ArrowRight, PhoneIncoming, CreditCard, LayoutDashboard,
  X
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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

  const [activeTab, setActiveTab] = useState('overview');
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    address: '',
    phoneNumber: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const ordersQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('date', 'desc')) : null,
    [db, user]
  );

  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);
  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);

  // Auto-close FAB on scroll or tap outside
  useEffect(() => {
    if (!isNavExpanded) return;

    const handleScroll = () => setIsNavExpanded(false);
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsNavExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNavExpanded]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/login?returnTo=/account`);
    }
    if (user && customer) {
      setProfileData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        username: customer.username || '',
        bio: customer.bio || '',
        address: customer.address || '',
        phoneNumber: customer.phoneNumber || ''
      });
    }
  }, [user, customer, isUserLoading, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!customer?.banUntil) return;
    const interval = setInterval(() => {
      const until = new Date(customer.banUntil!).getTime();
      const now = Date.now();
      const diff = until - now;
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [customer?.banUntil]);

  const handleResend = () => {
    if (!user || !customer) return;
    const currentResends = customer.resendAttempts || 0;
    
    if (currentResends >= 3) {
      const ban = new Date();
      ban.setHours(ban.getHours() + 24);
      updateDocumentNonBlocking(doc(db, 'customers', user.uid), { banUntil: ban.toISOString() });
      toast({ variant: "destructive", title: "Verification Lockout", description: "Too many attempts. Account locked for 24h for security." });
      return;
    }

    updateDocumentNonBlocking(doc(db, 'customers', user.uid), { resendAttempts: currentResends + 1 });
    toast({ title: "OTP Resent", description: `Verification code sent. Attempt ${currentResends + 1} of 3. (Hint: 123456)` });
    setShowOtpStep(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVerifying(true);
    if (otp === '123456') {
      updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true, failedAttempts: 0, resendAttempts: 0 });
      toast({ title: "Identity Certified", description: "Welcome to full marketplace access." });
      setShowOtpStep(false);
    } else {
      toast({ variant: "destructive", title: "Invalid Code", description: "The entered code does not match our records." });
    }
    setVerifying(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    updateDocumentNonBlocking(doc(db, 'customers', user.uid), profileData);
    toast({ title: "Profile Updated", description: "Your heritage identity has been saved." });
    setSavingProfile(false);
  };

  if (isUserLoading || isCustomerLoading) return <div className="flex justify-center p-32"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32 pt-24 md:pt-32">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <Badge className="bg-primary/10 text-primary mb-2 font-bold px-4 rounded-full">Heritage Member</Badge>
            <h1 className="text-3xl md:text-5xl font-headline font-bold text-secondary">My Account</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => signOut(auth)} 
            className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-bold animate-in fade-in slide-in-from-right-4 duration-500 hidden md:flex"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Verification Alert */}
        {!customer?.isVerified && (
          <Alert className={cn("mb-8 rounded-[1.5rem] md:rounded-[2rem] border-2 shadow-sm p-6 md:p-8 animate-in zoom-in-95 duration-500", timeLeft ? "border-destructive bg-destructive/5" : "border-primary/20 bg-primary/5")}>
            {timeLeft ? <Clock className="h-6 w-6 md:h-8 md:w-8 text-destructive shrink-0" /> : <ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />}
            <div className="ml-4 md:ml-6 flex-1">
              <AlertTitle className="text-xl md:text-2xl font-headline font-bold text-secondary mb-1">
                {timeLeft ? "Verification Restricted" : "Identity Certification Required"}
              </AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm md:text-lg leading-relaxed">
                {timeLeft 
                  ? `Security lockout active for another ${timeLeft}.` 
                  : "Certify your identity to complete acquisitions and unlock premium features."}
              </AlertDescription>
              {!timeLeft && (
                <div className="mt-4 md:mt-6">
                  {showOtpStep ? (
                    <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
                      <Input 
                        className="max-w-full sm:max-w-[200px] h-12 rounded-xl text-center text-2xl font-black tracking-widest border-primary/40" 
                        placeholder="123456" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                      />
                      <div className="flex gap-2">
                        <Button className="flex-1 h-12 rounded-xl bg-primary text-white px-6 font-bold" disabled={verifying}>
                          {verifying ? <Loader2 className="animate-spin" /> : "Confirm"}
                        </Button>
                        <Button type="button" variant="ghost" className="h-12 rounded-xl" onClick={() => setShowOtpStep(false)}>Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <Button onClick={handleResend} className="bg-primary text-white h-12 rounded-xl px-8 font-bold shadow-lg gap-2 w-full sm:w-auto">
                      <PhoneIncoming className="h-4 w-4" />
                      Verify Now
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Alert>
        )}

        {/* Dynamic Desktop Tabs List - Enhanced Liquid Glass Layout */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/40 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] p-2 mb-12 h-20 w-full shadow-[0_20px_80px_rgba(0,0,0,0.06)] relative overflow-hidden group">
              {/* Subtle background flow effect for the container */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              
              {/* Shimmering highlight line */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
              
              <TabsTrigger 
                value="overview" 
                className="flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_15px_30px_rgba(224,124,84,0.3)] data-[state=active]:scale-[1.02] hover:bg-white/20 active:scale-95 z-10 flex items-center justify-center gap-3 px-6 group/tab"
              >
                <LayoutDashboard className="h-4 w-4 transition-transform duration-500 group-hover/tab:scale-110" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_15px_30px_rgba(224,124,84,0.3)] data-[state=active]:scale-[1.02] hover:bg-white/20 active:scale-95 z-10 flex items-center justify-center gap-3 px-6 group/tab"
              >
                <Package className="h-4 w-4 transition-transform duration-500 group-hover/tab:scale-110" />
                Acquisitions
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-700 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_15px_30px_rgba(224,124,84,0.3)] data-[state=active]:scale-[1.02] hover:bg-white/20 active:scale-95 z-10 flex items-center justify-center gap-3 px-6 group/tab"
              >
                <UserIcon className="h-4 w-4 transition-transform duration-500 group-hover/tab:scale-110" />
                Identity Details
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'overview' && (
            <Card className="rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-none artisan-pattern p-6 md:p-10 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-8 mb-8 md:mb-10 relative z-10">
                <Avatar className="h-24 w-20 md:h-28 md:w-24 rounded-2xl md:rounded-3xl border-4 border-white shadow-2xl">
                  <AvatarFallback className="text-3xl md:text-4xl font-bold bg-primary text-white">{(user.displayName || 'A')[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-4xl font-headline font-bold text-secondary leading-tight">{user.displayName || 'Artisan Collector'}</h2>
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 text-sm md:text-base">
                    <AtSign className="h-4 w-4 text-primary" /> {user.email}
                  </p>
                  {customer?.isVerified && (
                    <Badge className="bg-green-100 text-green-700 mt-2 border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Certified Identity
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 relative z-10">
                {[
                  { label: 'Member Since', value: 'May 2024' },
                  { label: 'Total Acquisitions', value: `${orders?.length || 0} items` },
                  { label: 'Platform Role', value: customer?.role || 'User', capitalize: true }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl md:rounded-3xl border shadow-sm flex flex-col items-center sm:items-start">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 md:mb-2">{stat.label}</p>
                    <p className={cn("text-lg md:text-xl font-bold text-secondary", stat.capitalize && "capitalize")}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card className="rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-none overflow-hidden bg-white/60 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="px-6 md:px-10 py-6 font-bold text-secondary">Acquisition ID</TableHead>
                      <TableHead className="font-bold text-secondary">Investment</TableHead>
                      <TableHead className="font-bold text-secondary">Status</TableHead>
                      <TableHead className="text-right px-6 md:px-10 font-bold text-secondary">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map(o => (
                      <TableRow key={o.id} className="hover:bg-primary/5 transition-colors border-b last:border-0">
                        <TableCell className="px-6 md:px-10 py-6 md:py-8">
                          <div className="flex flex-col">
                            <span className="font-black text-primary font-code text-xs md:text-sm">{o.id}</span>
                            <span className="text-[10px] text-muted-foreground mt-1">{new Date(o.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-secondary text-sm md:text-base">${o.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "rounded-full px-3 py-0.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none",
                            o.status === 'Delivered' ? "bg-green-100 text-green-700" : 
                            o.status === 'Cancelled' ? "bg-destructive/10 text-destructive" : "bg-blue-100 text-blue-700"
                          )}>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 md:px-10">
                          <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-primary hover:text-white">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!orders || orders.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-24">
                          <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/20 mx-auto mb-4" />
                          <p className="text-lg md:text-xl font-headline font-bold text-muted-foreground">Your collection is empty.</p>
                          <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">Explore the Marketplace</Link>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-none p-6 md:p-10 bg-white/60 backdrop-blur-xl">
              <form onSubmit={handleSaveProfile} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">First Name</Label>
                    <Input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Last Name</Label>
                    <Input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><AtSign className="h-3 w-3" /> Unique @Username</Label>
                    <Input value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} className="h-12 rounded-xl" placeholder="artisan_collector" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><UserIcon className="h-3 w-3" /> Contact Phone</Label>
                    <Input value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><MapPin className="h-3 w-3" /> Primary Delivery Address</Label>
                    <Textarea value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="min-h-[100px] rounded-[1.2rem] md:rounded-[1.5rem]" placeholder="Full shipping coordinates..." />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Identity Bio</Label>
                    <Textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="min-h-[100px] rounded-[1.2rem] md:rounded-[1.5rem]" placeholder="Tell us about your love for handcrafted treasures..." />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary text-white h-14 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.01] transition-all" disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Save Heritage Identity</>}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>

      {/* Liquid Glass Mobile Floating Navigation - Refined Minimalist Aesthetic */}
      <div 
        ref={fabRef}
        className={cn(
          "fixed bottom-6 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden",
          isNavExpanded 
            ? "left-1/2 -translate-x-1/2 w-[280px]" 
            : "left-[calc(100%-70px)] w-14"
        )}
      >
        <div 
          className={cn(
            "bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full h-14 shadow-lg flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden",
            isNavExpanded ? "w-full" : "w-14"
          )}
        >
          {/* Expandable Nav Content */}
          <div className={cn(
            "flex items-center justify-around w-full h-full px-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isNavExpanded ? "opacity-100 scale-100 translate-y-0 delay-150" : "opacity-0 scale-90 translate-y-2 pointer-events-none"
          )}>
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Stats' },
              { id: 'orders', icon: Package, label: 'Orders' },
              { id: 'profile', icon: UserIcon, label: 'Identity' },
              { id: 'signout', icon: LogOut, label: 'Sign Out', action: () => signOut(auth) }
            ].map((nav) => {
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => {
                    if (nav.action) {
                      nav.action();
                    } else {
                      setActiveTab(nav.id);
                    }
                    setIsNavExpanded(false);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 transition-all duration-300 px-2",
                    isActive ? "text-primary scale-105" : "text-secondary/60 hover:text-secondary",
                    nav.id === 'signout' && "text-destructive/70 hover:text-destructive"
                  )}
                >
                  <nav.icon className="h-4 w-4" />
                  <span className="text-[6px] font-black uppercase tracking-widest">{nav.label}</span>
                </button>
              );
            })}
          </div>

          {/* Trigger Button */}
          <button 
            onClick={() => setIsNavExpanded(true)}
            className={cn(
              "absolute inset-0 w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-xl text-secondary transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isNavExpanded ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            {activeTab === 'overview' && <LayoutDashboard className="h-5 w-5" />}
            {activeTab === 'orders' && <Package className="h-5 w-5" />}
            {activeTab === 'profile' && <UserIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
