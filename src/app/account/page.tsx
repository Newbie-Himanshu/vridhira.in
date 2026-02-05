
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking, setDocumentNonBlocking, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Customer, Order } from '@/lib/mock-data';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, Mail, Shield, Loader2, LogOut, Package, 
  CheckCircle2, PhoneIncoming, Clock, 
  LayoutDashboard, Settings, Palette, Bell, Save,
  Sparkles, MapPin, Phone, AtSign, Fingerprint, ShoppingBag, CreditCard
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
  
  const [profileData, setProfileData] = useState({
    displayName: '',
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
  
  const prefRef = useMemoFirebase(() => 
    user ? doc(db, 'user_preferences', user.uid) : null,
    [db, user]
  );

  const ordersQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('date', 'desc')) : null,
    [db, user]
  );

  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);
  const { data: preferences } = useDoc<any>(prefRef);
  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);

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

  const handleUpdatePreference = (key: string, value: any) => {
    if (!user || !prefRef) return;
    setDocumentNonBlocking(prefRef, { [key]: value }, { merge: true });
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
          <p className="text-muted-foreground italic">Manage your identity and track your acquisitions.</p>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/50 backdrop-blur border rounded-full p-1 mb-8 h-14 w-full flex overflow-x-auto">
          <TabsTrigger value="overview" className="flex-1 rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">My Orders</TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1 rounded-full px-8 h-full font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Preferences</TabsTrigger>
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
                    <span className="text-[10px] font-bold uppercase text-primary">Shipping Address</span>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm italic">{profileData.address || 'No address set in profile'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-white rounded-3xl p-6">
                <h3 className="font-headline font-bold text-xl mb-4 text-secondary flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    Heritage ID
                </h3>
                <div className="bg-muted p-4 rounded-xl flex items-center justify-between group">
                    <code className="text-xs font-code truncate max-w-[150px]">{user.uid}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                        navigator.clipboard.writeText(user.uid);
                        toast({ title: "ID Copied", description: "Your UID has been copied to clipboard." });
                    }}>
                        <Package className="h-4 w-4" />
                    </Button>
                </div>
              </Card>
              <Card className="border-none shadow-lg bg-secondary text-white rounded-3xl p-6">
                <h3 className="font-headline font-bold text-xl mb-2">Heritage Rewards</h3>
                <p className="text-xs opacity-80">Track your contribution to artisanal preservation.</p>
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-primary" />
                </div>
                <p className="text-[10px] mt-2 opacity-60">Tier: Bronze preservationist</p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-headline font-bold text-secondary">Acquisition History</CardTitle>
                  <CardDescription>Review your collection of handcrafted treasures.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isOrdersLoading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
              ) : orders && orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="px-8 font-bold text-secondary">Order ID</TableHead>
                      <TableHead className="font-bold text-secondary">Date</TableHead>
                      <TableHead className="font-bold text-secondary">Total</TableHead>
                      <TableHead className="font-bold text-secondary">Status</TableHead>
                      <TableHead className="text-right px-8 font-bold text-secondary">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/5 transition-colors border-b last:border-0">
                        <TableCell className="px-8 py-6 font-black text-primary">{order.id}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(order.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold text-secondary">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                            order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button variant="ghost" size="sm" className="rounded-full h-8 px-4 text-primary font-bold">
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-20 text-center space-y-4">
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Package className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-xl font-headline font-bold text-muted-foreground">Your collection is just beginning.</p>
                  <Link href="/shop">
                    <Button className="bg-primary text-white rounded-full">Explore the Marketplace</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8 max-w-4xl mx-auto">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 rounded-full border-4 border-muted shadow-xl">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="text-4xl bg-primary text-white font-headline font-bold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full shadow-lg h-10 w-10 bg-white hover:bg-primary hover:text-white">
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-headline font-bold text-secondary">Preservation Profile</h3>
                  <p className="text-sm text-muted-foreground">Update your identity on the Vridhira network.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest">Full Name</Label>
                  <Input 
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest">Unique @username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="h-12 rounded-xl pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest">Artisan Bio</Label>
                  <Textarea 
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="rounded-xl min-h-[100px]"
                    placeholder="Tell us about your love for heritage crafts..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">Shipping Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="rounded-xl min-h-[80px] pl-10 pt-2.5"
                      placeholder="Street, City, ZIP Code"
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl bg-secondary text-white font-bold shadow-xl" 
                disabled={savingProfile}
              >
                {savingProfile ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Save Preservation Profile
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Visual Style
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="space-y-3">
                  <Label>Marketplace Theme</Label>
                  <Select 
                    value={preferences?.theme || 'light'} 
                    onValueChange={(val) => handleUpdatePreference('theme', val)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Artisan Light</SelectItem>
                      <SelectItem value="dark">Heritage Dark</SelectItem>
                      <SelectItem value="sepia">Vintage Sepia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Local Currency</Label>
                  <Select 
                    value={preferences?.currency || 'USD'} 
                    onValueChange={(val) => handleUpdatePreference('currency', val)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-8 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Heritage Stories</Label>
                    <p className="text-[10px] text-muted-foreground italic">Email updates on artisan legacies.</p>
                  </div>
                  <Switch 
                    checked={preferences?.emailNotifications ?? true} 
                    onCheckedChange={(val) => handleUpdatePreference('emailNotifications', val)} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Acquisition Alerts</Label>
                    <p className="text-[10px] text-muted-foreground italic">Instant SMS for delivery status.</p>
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
