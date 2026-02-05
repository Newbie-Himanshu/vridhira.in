
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Loader2, ShieldCheck, AlertCircle, PhoneIncoming, CheckCircle2, Info, Clock, ArrowRight } from 'lucide-react';
import { doc, serverTimestamp } from 'firebase/firestore';
import { syncLocalCartToCloud } from '@/lib/cart-actions';
import { Separator } from '@/components/ui/separator';
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
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null,
    [db, user]
  );
  
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);

  useEffect(() => {
    if (user && customer && !loading) {
      if (customer.isVerified || user.email === 'hk8913114@gmail.com') {
        if (user.email === 'hk8913114@gmail.com' && !customer.isVerified) {
          updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true });
        }
        syncLocalCartToCloud(db, user.uid).then(() => {
          router.push(returnTo);
        });
      } else {
        setShowOtpStep(true);
      }
    }
  }, [user, customer, loading, router, db, returnTo]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    initiateEmailSignIn(auth, email, password)
      .then(() => setLoading(false))
      .catch((err: any) => {
        setError({ message: 'Auth Error', hint: err.message });
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
        setError({ message: 'Signup Failed', hint: err.message });
        setLoading(false);
      });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    if (otp === '123456') {
      updateDocumentNonBlocking(doc(db, 'customers', user.uid), { isVerified: true, failedAttempts: 0 });
    } else {
      const newCount = failedOtpCount + 1;
      setFailedOtpCount(newCount);
      setError({ message: 'Invalid Code', hint: `Attempt ${newCount} of 2 before skip becomes available.` });
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  if (isUserLoading || (user && isCustomerLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (showOtpStep) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/10 text-center py-8">
            <PhoneIncoming className="h-8 w-8 text-primary mx-auto mb-4" />
            <CardTitle>Verify Identity</CardTitle>
            <CardDescription>Enter the 6-digit code (Hint: 123456)</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>{error.message}</AlertTitle></Alert>}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <Input 
                maxLength={6} 
                className="h-16 text-center text-3xl font-black tracking-widest" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button className="w-full h-14 rounded-2xl bg-secondary text-white" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Verify Heritage ID"}
              </Button>
            </form>
            {failedOtpCount >= 2 && (
              <Button variant="ghost" className="w-full text-primary font-bold" onClick={handleSkip}>
                Skip for now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="rounded-3xl shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button className="w-full h-12 bg-primary text-white" disabled={loading}>Sign In</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="rounded-3xl shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button className="w-full h-12 bg-secondary text-white" disabled={loading}>Start Journey</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
