
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
  ArrowRight, PhoneIncoming
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
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
    setShowOtpInput(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVerifying(true);
    if (otp === '123456') {
      updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true, failedAttempts: 0, resendAttempts: 0 });
      toast({ title: "Identity Certified", description: "Welcome to full marketplace access." });
      setShowOtpInput(false);
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
    <div className="container mx-auto px-4 py-32 max-w-5xl">
      <div className="flex justify-between items-end mb-12">
        <div>
          <Badge className="bg-primary/10 text-primary mb-2 font-bold px-4">Heritage Member</Badge>
          <h1 className="text-4xl font-headline font-bold text-secondary">My Account</h1>
        </div>
        <Button variant="outline" onClick={() => signOut(auth)} className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-bold"><LogOut className="mr-2 h-4 w-4" /> Secure Sign Out</Button>
      </div>

      {!customer?.isVerified && (
        <Alert className={cn("mb-8 rounded-[2rem] border-2 shadow-sm p-8", timeLeft ? "border-destructive bg-destructive/5" : "border-primary/20 bg-primary/5")}>
          {timeLeft ? <Clock className="h-8 w-8 text-destructive" /> : <ShieldAlert className="h-8 w-8 text-primary" />}
          <div className="ml-6 flex-1">
            <AlertTitle className="text-2xl font-headline font-bold text-secondary mb-2">{timeLeft ? "Verification Restricted" : "Identity Certification Required"}</AlertTitle>
            <AlertDescription className="text-muted-foreground text-lg leading-relaxed">
              {timeLeft 
                ? `You have reached the maximum number of attempts. Security lockout active for another ${timeLeft}.` 
                : "To complete acquisitions and unlock premium features, please certify your heritage identity."}
            </AlertDescription>
            {!timeLeft && (
              <div className="mt-6">
                {showOtpInput ? (
                  <form onSubmit={handleVerify} className="flex gap-4">
                    <Input 
                      className="max-w-[200px] h-12 rounded-xl text-center text-2xl font-black tracking-widest border-primary/40" 
                      placeholder="123456" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                    />
                    <Button className="h-12 rounded-xl bg-primary text-white px-8 font-bold" disabled={verifying}>
                      {verifying ? <Loader2 className="animate-spin" /> : "Confirm Code"}
                    </Button>
                    <Button type="button" variant="ghost" className="h-12 rounded-xl" onClick={() => setShowOtpInput(false)}>Cancel</Button>
                  </form>
                ) : (
                  <Button onClick={handleResend} className="bg-primary text-white h-12 rounded-xl px-10 font-bold shadow-lg gap-2">
                    <PhoneIncoming className="h-4 w-4" />
                    Send Verification Code
                  </Button>
                )}
              </div>
            )}
          </div>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/50 border rounded-full p-1.5 mb-10 h-16 w-full shadow-sm">
          <TabsTrigger value="overview" className="flex-1 rounded-full text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 rounded-full text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Order History</TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 rounded-full text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Identity Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="rounded-[2.5rem] shadow-xl border-none artisan-pattern p-10 relative overflow-hidden">
            <div className="flex items-center gap-8 mb-10 relative z-10">
              <Avatar className="h-28 w-24 rounded-3xl border-4 border-white shadow-2xl">
                <AvatarFallback className="text-4xl font-bold bg-primary text-white">{(user.displayName || 'A')[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-4xl font-headline font-bold text-secondary leading-none">{user.displayName || 'Artisan Collector'}</h2>
                <p className="text-muted-foreground flex items-center gap-2"><AtSign className="h-4 w-4 text-primary" /> {user.email}</p>
                {customer?.isVerified && <Badge className="bg-green-100 text-green-700 mt-2 border-none">Certified Identity</Badge>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Member Since</p>
                <p className="text-xl font-bold text-secondary">May 2024</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Total Acquisitions</p>
                <p className="text-xl font-bold text-secondary">{orders?.length || 0} items</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Platform Role</p>
                <p className="text-xl font-bold text-secondary capitalize">{customer?.role || 'User'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="rounded-[2.5rem] shadow-xl border-none overflow-hidden bg-white/60 backdrop-blur-xl">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="px-10 py-6 font-bold text-secondary">Acquisition ID</TableHead>
                  <TableHead className="font-bold text-secondary">Date</TableHead>
                  <TableHead className="font-bold text-secondary">Investment</TableHead>
                  <TableHead className="font-bold text-secondary">Status</TableHead>
                  <TableHead className="text-right px-10 font-bold text-secondary">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map(o => (
                  <TableRow key={o.id} className="hover:bg-primary/5 transition-colors border-b last:border-0">
                    <TableCell className="px-10 py-8 font-black text-primary font-code text-sm">{o.id}</TableCell>
                    <TableCell className="text-muted-foreground font-medium">{new Date(o.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-black text-secondary">${o.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                        o.status === 'Delivered' ? "bg-green-100 text-green-700" : 
                        o.status === 'Cancelled' ? "bg-destructive/10 text-destructive" : "bg-blue-100 text-blue-700"
                      )}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold hover:bg-primary hover:text-white">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!orders || orders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-xl font-headline font-bold text-muted-foreground">Your collection is empty.</p>
                      <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">Explore the Marketplace</Link>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="rounded-[2.5rem] shadow-xl border-none p-10 bg-white/60 backdrop-blur-xl">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <Textarea value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="min-h-[120px] rounded-[1.5rem]" placeholder="Full shipping coordinates..." />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Identity Bio</Label>
                  <Textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="min-h-[100px] rounded-[1.5rem]" placeholder="Tell us about your love for handcrafted treasures..." />
                </div>
              </div>
              <Button type="submit" className="w-full bg-secondary text-white h-14 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.01] transition-all" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Save Heritage Identity</>}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
