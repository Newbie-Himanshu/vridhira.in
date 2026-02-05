
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
  Sparkles, MapPin, Phone, AtSign, Fingerprint, ShoppingBag, CreditCard, AlertTriangle
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
      router.push(`/login?returnTo=/account`);
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
      toast({ variant: "destructive", title: "Security Lockout", description: "Too many resend attempts. Locked for 24h." });
      return;
    }

    updateDocumentNonBlocking(doc(db, 'customers', user.uid), { resendAttempts: currentResends + 1 });
    toast({ title: "OTP Resent", description: `Attempt ${currentResends + 1} of 3. Hint: 123456` });
    setShowOtpInput(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setVerifying(true);
    if (otp === '123456') {
      updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true, failedAttempts: 0, resendAttempts: 0 });
      toast({ title: "Verified", description: "Identity confirmed." });
      setShowOtpInput(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: "Invalid code." });
    }
    setVerifying(false);
  };

  if (isUserLoading || isCustomerLoading) return <div className="flex justify-center p-32"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-32 max-w-5xl">
      <div className="flex justify-between items-end mb-12">
        <div>
          <Badge className="bg-primary/10 text-primary mb-2">Heritage Member</Badge>
          <h1 className="text-4xl font-headline font-bold text-secondary">Your Profile</h1>
        </div>
        <Button variant="outline" onClick={() => signOut(auth)} className="rounded-full"><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
      </div>

      {!customer?.isVerified && (
        <Alert className={cn("mb-8 rounded-3xl border-2", timeLeft ? "border-destructive bg-destructive/5" : "border-primary/20 bg-primary/5")}>
          {timeLeft ? <Clock className="h-6 w-6 text-destructive" /> : <AlertTriangle className="h-6 w-6 text-primary" />}
          <div className="ml-4 flex-1">
            <AlertTitle className="text-xl font-bold">{timeLeft ? "Verification Locked" : "Identify Required"}</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {timeLeft ? `Brute force prevention active. Try again in ${timeLeft}.` : "You must verify your identity to complete acquisitions."}
            </AlertDescription>
            {!timeLeft && (
              <div className="mt-4 space-y-4">
                {showOtpInput ? (
                  <form onSubmit={handleVerify} className="flex gap-4">
                    <Input className="max-w-[200px]" placeholder="Enter 123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <Button disabled={verifying}>{verifying ? <Loader2 className="animate-spin" /> : "Confirm"}</Button>
                  </form>
                ) : (
                  <Button onClick={handleResend} className="bg-primary text-white">Send Verification Code</Button>
                )}
              </div>
            )}
          </div>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/50 border rounded-full p-1 mb-8 h-14 w-full">
          <TabsTrigger value="overview" className="flex-1 rounded-full">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 rounded-full">Orders</TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 rounded-full">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="rounded-[2.5rem] shadow-xl border-none artisan-pattern p-8">
            <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarFallback className="text-3xl font-bold bg-primary text-white">{(user.displayName || 'A')[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold text-secondary">{user.displayName || 'Artisan Enthusiast'}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 p-6 rounded-2xl border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {customer?.isVerified ? <Badge className="bg-green-100 text-green-700">Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
                </div>
              </div>
              <div className="bg-white/80 p-6 rounded-2xl border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Role</p>
                <p className="font-bold capitalize">{customer?.role || 'User'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="rounded-[2.5rem] shadow-xl border-none overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="px-8 py-4">Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="px-8 py-6 font-bold text-primary">{o.id}</TableCell>
                    <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">${o.totalAmount.toFixed(2)}</TableCell>
                    <TableCell><Badge className="rounded-full">{o.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {(!orders || orders.length === 0) && (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No orders yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="rounded-[2.5rem] shadow-xl border-none p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Display Name</Label><Input value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} /></div>
                <div className="space-y-2"><Label>Username</Label><Input value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} /></div>
                <div className="md:col-span-2 space-y-2"><Label>Address</Label><Textarea value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} /></div>
              </div>
              <Button className="w-full bg-secondary text-white h-12 rounded-xl">Save Changes</Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
