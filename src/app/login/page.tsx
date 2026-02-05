
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Loader2, PhoneIncoming, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { syncLocalCartToCloud } from '@/lib/cart-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Customer } from '@/lib/mock-data';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const returnTo = searchParams.get('returnTo') || '/';

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<{ message: string; hint: string } | null>(null);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [failedOtpCount, setFailedOtpCount] = useState(0);

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null,
    [db, user]
  );
  
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);

  useEffect(() => {
    if (user && customer && !loading) {
      const isSpecial = user.email === 'hk8913114@gmail.com';
      if (customer.isVerified || isSpecial) {
        if (isSpecial && !customer.isVerified) {
          updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true });
        }
        syncLocalCartToCloud(db, user.uid).then(() => {
          router.push(returnTo);
        });
      } else if (!showOtpStep) {
        setShowOtpStep(true);
      }
    }
  }, [user, customer, loading, router, db, returnTo, showOtpStep]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    initiateEmailSignIn(auth, email, password)
      .then(() => setLoading(false))
      .catch((err: any) => {
        setError({ message: 'Authentication Error', hint: err.message });
        setLoading(false);
      });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    initiateEmailSignUp(auth, email, password)
      .then((cred) => {
        const u = cred.user;
        const isSpecial = u.email === 'hk8913114@gmail.com';
        
        setDocumentNonBlocking(doc(db, 'users', u.uid), {
          id: u.uid,
          email: u.email,
          displayName: displayName || 'Artisan Enthusiast',
          creationTime: serverTimestamp(),
        });

        setDocumentNonBlocking(doc(db, 'customers', u.uid), {
          id: u.uid,
          email: u.email,
          firstName: displayName.split(' ')[0] || 'Artisan',
          lastName: displayName.split(' ')[1] || 'Enthusiast',
          role: isSpecial ? 'owner' : 'user',
          isVerified: isSpecial,
          failedAttempts: 0,
          resendAttempts: 0
        });
        
        setLoading(false);
        if (!isSpecial) setShowOtpStep(true);
      })
      .catch((err: any) => {
        setError({ message: 'Registration Failed', hint: err.message });
        setLoading(false);
      });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    if (otp === '123456') {
      updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true, failedAttempts: 0 });
      // Verification triggers the useEffect above to handle redirection
    } else {
      const newCount = failedOtpCount + 1;
      setFailedOtpCount(newCount);
      setError({ message: 'Invalid Verification Code', hint: `Attempt ${newCount}. Correct code is 123456 for this prototype.` });
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  if (isUserLoading || (user && isCustomerLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (showOtpStep) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary/10 text-center py-10">
            <PhoneIncoming className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-headline font-bold">Identity Certification</CardTitle>
            <CardDescription>We've sent a 6-digit code to your heritage mailbox.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-center">
            {error && <Alert variant="destructive" className="rounded-2xl"><AlertCircle className="h-4 w-4" /><AlertTitle>{error.message}</AlertTitle><AlertDescription className="text-xs">{error.hint}</AlertDescription></Alert>}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-bold opacity-60">Authentication Code</Label>
                <Input 
                  maxLength={6} 
                  className="h-20 text-center text-4xl font-black tracking-[0.5em] rounded-2xl border-2 focus:border-primary" 
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
              </div>
              <Button className="w-full h-14 rounded-2xl bg-secondary text-white font-bold text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Verify & Unlock Marketplace"}
              </Button>
            </form>
            
            {failedOtpCount >= 2 && (
              <div className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-sm text-muted-foreground mb-4 italic">Having trouble? You can skip this for now, but checkout will be restricted.</p>
                <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/20 text-primary font-bold gap-2" onClick={handleSkip}>
                  Continue as Guest <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 flex justify-center">
            <p className="text-[10px] uppercase font-bold tracking-tighter opacity-40">Secure Identity Layer v2.0</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-secondary">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your handcrafted collection.</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-2xl h-14">
            <TabsTrigger value="login" className="rounded-xl font-bold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl font-bold">Join Heritage</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="rounded-[2rem] shadow-2xl border-none p-2">
              <CardContent className="pt-8 space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" className="pl-10 h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" className="pl-10 h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="rounded-[2rem] shadow-2xl border-none p-2">
              <CardContent className="pt-8 space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Aarav Sharma" className="pl-10 h-12 rounded-xl" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" className="h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Secure Password</Label>
                    <Input type="password" className="h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button className="w-full h-14 bg-secondary text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Start Heritage Journey"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
