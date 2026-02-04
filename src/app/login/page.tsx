
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    initiateEmailSignIn(auth, email, password);
    // The loading state is managed optimistically; auth state change will trigger redirect
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    initiateEmailSignUp(auth, email, password);
    // User profile creation is handled by the auth state change effect below
  };

  const handleGuestLogin = () => {
    setLoading(true);
    initiateAnonymousSignIn(auth);
  };

  // Sync user profile to Firestore on first signup
  useEffect(() => {
    if (user && !user.isAnonymous) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        id: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || 'Artisan Enthusiast',
        photoURL: user.photoURL || '',
        creationTime: serverTimestamp(),
      }, { merge: true });
    }
  }, [user, db, displayName]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rotate-45 rounded-2xl animate-[spin_15s_linear_infinite]" />
            <span className="relative font-headline font-bold text-4xl text-primary">V</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-secondary">Join the Heritage</h1>
          <p className="text-muted-foreground">Direct access to the heart of Indian craftsmanship.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-full h-12">
            <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your collection.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="weaver@heritage.com" 
                        className="pl-10 h-12 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" size="sm" className="px-0 text-primary h-auto">Forgot password?</Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        className="pl-10 h-12 rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                  </Button>
                  <Button variant="ghost" type="button" className="w-full text-muted-foreground hover:text-primary" onClick={handleGuestLogin} disabled={loading}>
                    Continue as Guest
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl">Create Account</CardTitle>
                <CardDescription>Join our community of artisanal enthusiasts.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Aarav Sharma" 
                        className="pl-10 h-12 rounded-xl"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email-signup" 
                        type="email" 
                        placeholder="weaver@heritage.com" 
                        className="pl-10 h-12 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password-signup" 
                        type="password" 
                        className="pl-10 h-12 rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full h-12 rounded-2xl bg-secondary text-white font-bold text-lg shadow-lg transition-all active:scale-95" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start Journey"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground px-8 text-center leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          By continuing, you agree to our terms of heritage preservation and artisan support.
        </div>
      </div>
    </div>
  );
}
