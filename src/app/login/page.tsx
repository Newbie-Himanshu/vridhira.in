
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Loader2, ShieldCheck, AlertCircle, PhoneIncoming, CheckCircle2 } from 'lucide-react';
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

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<{ message: string; hint: string } | null>(null);
  const [showOtpStep, setShowOtpStep] = useState(false);

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null,
    [db, user]
  );
  
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);

  useEffect(() => {
    if (user && customer && !loading) {
      if (customer.isVerified) {
        syncLocalCartToCloud(db, user.uid);
        router.push('/');
      } else {
        setShowOtpStep(true);
      }
    }
  }, [user, customer, loading, router, db]);

  const getAuthErrorDetails = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return { message: 'Invalid Email', hint: 'Please check your email format (e.g., name@example.com).' };
      case 'auth/user-disabled':
        return { message: 'Account Disabled', hint: 'This account has been suspended. Please contact heritage support.' };
      case 'auth/user-not-found':
        return { message: 'User Not Found', hint: 'We couldn\'t find an account with this email. Did you mean to Sign Up?' };
      case 'auth/wrong-password':
        return { message: 'Incorrect Password', hint: 'The password you entered is incorrect. Double-check your spelling or reset it.' };
      case 'auth/email-already-in-use':
        return { message: 'Email Taken', hint: 'This email is already registered. Try Logging In instead.' };
      case 'auth/weak-password':
        return { message: 'Weak Password', hint: 'Your password is too simple. Try using at least 6 characters.' };
      case 'auth/popup-closed-by-user':
        return { message: 'Sign-in Cancelled', hint: 'The Google popup was closed before completion. Please try again.' };
      default:
        return { message: 'Authentication Error', hint: 'Something went wrong. Please check your connection and try again.' };
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    initiateEmailSignIn(auth, email, password)
      .catch((err: any) => {
        setError(getAuthErrorDetails(err.code));
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
        const userRef = doc(db, 'users', u.uid);
        const customerRef = doc(db, 'customers', u.uid);
        
        setDocumentNonBlocking(userRef, {
          id: u.uid,
          email: u.email,
          displayName: displayName || 'Artisan Enthusiast',
          photoURL: u.photoURL || '',
          creationTime: serverTimestamp(),
        }, { merge: true });

        setDocumentNonBlocking(customerRef, {
          id: u.uid,
          email: u.email,
          firstName: displayName.split(' ')[0] || 'Artisan',
          lastName: displayName.split(' ')[1] || 'Enthusiast',
          role: 'user',
          isVerified: false
        }, { merge: true });
        
        setShowOtpStep(true);
      })
      .catch((err: any) => {
        setError(getAuthErrorDetails(err.code));
        setLoading(false);
      });
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    initiateGoogleSignIn(auth)
      .then((cred) => {
        const u = cred.user;
        const userRef = doc(db, 'users', u.uid);
        const customerRef = doc(db, 'customers', u.uid);
        
        setDocumentNonBlocking(userRef, {
          id: u.uid,
          email: u.email,
          displayName: u.displayName || 'Artisan Enthusiast',
          photoURL: u.photoURL || '',
          creationTime: serverTimestamp(),
        }, { merge: true });

        setDocumentNonBlocking(customerRef, {
          id: u.uid,
          email: u.email,
          firstName: u.displayName?.split(' ')[0] || 'Artisan',
          lastName: u.displayName?.split(' ')[1] || 'Enthusiast',
          role: 'user'
          // Note: isVerified is purposely omitted here to trigger OTP for all registrations
        }, { merge: true });
      })
      .catch((err: any) => {
        setError(getAuthErrorDetails(err.code));
        setLoading(false);
      });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    // Simulate OTP verification logic
    if (otp === '123456') {
      const customerRef = doc(db, 'customers', user.uid);
      updateDocumentNonBlocking(customerRef, { isVerified: true });
      setTimeout(() => {
        router.push('/');
      }, 500);
    } else {
      setError({ message: 'Invalid OTP', hint: 'Please use the test code: 123456' });
      setLoading(false);
    }
  };

  if (isUserLoading || (user && isCustomerLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const GoogleIcon = () => (
    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  if (showOtpStep) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-md rounded-3xl artisan-pattern overflow-hidden">
            <CardHeader className="bg-primary/10 text-center py-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <PhoneIncoming className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline font-bold text-secondary">Verify Identity</CardTitle>
              <CardDescription>A 6-digit verification code was sent to your email.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-2xl border-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{error.message}</AlertTitle>
                  <AlertDescription>{error.hint}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-3">
                  <Label className="uppercase tracking-[0.2em] text-[10px] font-bold text-muted-foreground">One-Time Password</Label>
                  <Input 
                    type="text" 
                    maxLength={6} 
                    className="h-16 text-center text-3xl font-black tracking-[0.5em] rounded-2xl border-2 focus:ring-primary focus:border-primary" 
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold text-lg shadow-xl" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 justify-center">
              <p className="text-xs text-muted-foreground">Didn't receive the code? <button className="text-primary font-bold hover:underline" onClick={() => setError({ message: "Resent", hint: "Check your spam folder just in case." })}>Resend Code</button></p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-artisanal-rotation" />
            <span className="relative font-headline font-bold text-4xl text-primary">V</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-secondary">Join the Heritage</h1>
            <p className="text-muted-foreground text-sm">Direct access to the heart of Indian craftsmanship.</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-2xl border-2 bg-destructive/5 animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">{error.message}</AlertTitle>
            <AlertDescription className="text-xs italic opacity-90">
              Hint: {error.hint}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-2 font-bold bg-white shadow-lg animate-pulse-glow shine-effect" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon /> Continue with Google
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-background px-4 text-muted-foreground">Or use email</span></div>
          </div>

          <Tabs defaultValue="login" className="w-full" onValueChange={() => setError(null)}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-full h-12">
              <TabsTrigger value="login" className="rounded-full">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-md rounded-3xl">
                <CardHeader><CardTitle className="font-headline">Welcome Back</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => { setEmail(e.target.value); setError(null); }} 
                        required 
                        placeholder="artisan@vridhira.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => { setPassword(e.target.value); setError(null); }} 
                        required 
                      />
                    </div>
                    <Button className="w-full h-12 rounded-2xl bg-primary text-white font-bold animate-pulse-glow" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-md rounded-3xl">
                <CardHeader><CardTitle className="font-headline">Create Account</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input 
                        value={displayName} 
                        onChange={(e) => { setDisplayName(e.target.value); setError(null); }} 
                        required 
                        placeholder="Heritage Lover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => { setEmail(e.target.value); setError(null); }} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => { setPassword(e.target.value); setError(null); }} 
                        required 
                      />
                    </div>
                    <Button className="w-full h-12 rounded-2xl bg-secondary text-white font-bold" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Journey"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="text-[10px] text-muted-foreground px-8 text-center"><ShieldCheck className="h-4 w-4 inline mr-2" />Secure Heritage Access</div>
      </div>
    </div>
  );
}
