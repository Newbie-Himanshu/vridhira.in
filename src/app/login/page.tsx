'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Loader2, PhoneIncoming, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { syncLocalCartToCloud } from '@/lib/cart-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Customer } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

export default function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = use(props.searchParams);
  const { user, isLoading: isUserLoading } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const returnTo = (searchParams.returnTo as string) || '/';

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<{ message: string; hint: string } | null>(null);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [failedOtpCount, setFailedOtpCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCustomer(null);
      setIsCustomerLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      setIsCustomerLoading(true);
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setCustomer(data as Customer);
      setIsCustomerLoading(false);
    };

    fetchCustomer();
  }, [user, supabase]);

  useEffect(() => {
    if (user && customer && !loading) {
      const isSpecial = user.email === 'hk8913114@gmail.com';
      // Check is_verified (snake_case from DB)
      const isVerified = (customer as any).is_verified || (customer as any).isVerified;
      if (isVerified || isSpecial) {
        if (isSpecial && !isVerified) {
          supabase.from('customers').update({ is_verified: true }).eq('id', user.id);
        }
        syncLocalCartToCloud(supabase, user.id).then(() => {
          router.push(returnTo);
        });
      } else if (!showOtpStep) {
        setShowOtpStep(true);
      }
    }
  }, [user, customer, loading, router, supabase, returnTo, showOtpStep]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setError({ message: 'Authentication Error', hint: error.message });
      setLoading(false);
    } else {
      // Auth state change will trigger useEffect
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setError({ message: 'Google Sign In Failed', hint: error.message });
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName }
      }
    });

    if (error) {
      setError({ message: 'Registration Failed', hint: error.message });
      setLoading(false);
      return;
    }

    if (data.user) {
      const u = data.user;
      const isSpecial = u.email === 'hk8913114@gmail.com';

      // Create customer profile (no separate users table needed)
      const { error: profileError } = await supabase.from('customers').insert({
        id: u.id,
        email: u.email,
        first_name: displayName.split(' ')[0] || 'Artisan',
        last_name: displayName.split(' ')[1] || 'Enthusiast',
        role: isSpecial ? 'owner' : 'user',
        is_verified: isSpecial
      });

      setLoading(false);
      if (!isSpecial) setShowOtpStep(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    if (otp === '123456') {
      await supabase.from('customers').update({ is_verified: true }).eq('id', user.id);
    } else {
      const newCount = failedOtpCount + 1;
      setFailedOtpCount(newCount);
      setError({ message: 'Invalid Access Key', hint: `Correct key is 123456 for this prototype.` });
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  if (isUserLoading || (user && isCustomerLoading) || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary h-12 w-12" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 animate-pulse">Syncing Heritage Records</p>
        </div>
      </div>
    );
  }

  if (showOtpStep) {
    return (
      <div className="container mx-auto px-4 py-32 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-700">
          <CardHeader className="bg-primary/5 text-center py-12">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-subtle-float">
              <PhoneIncoming className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-secondary tracking-tight">Certification</CardTitle>
            <CardDescription className="text-sm italic">Verification code sent to your heritage mailbox.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8 text-center">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/10 text-destructive animate-in slide-in-from-top-2 duration-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">{error.message}</AlertTitle>
                <AlertDescription className="text-[10px] uppercase tracking-wider">{error.hint}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="space-y-3">
                <Label className="uppercase tracking-[0.2em] text-[10px] font-black opacity-40">6-Digit Access Key</Label>
                <Input
                  maxLength={6}
                  className="h-24 text-center text-5xl font-black tracking-[0.4em] rounded-[2rem] border-none bg-muted/30 focus:ring-2 focus:ring-primary shadow-inner"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
              </div>
              <Button className="w-full h-16 rounded-[2rem] bg-secondary text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all " disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Verify & Enter Marketplace"}
              </Button>
            </form>

            {failedOtpCount >= 2 && (
              <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <p className="text-xs text-muted-foreground mb-4 italic font-light">Trouble accessing? Skip for a limited guest preview.</p>
                <Button variant="ghost" className="w-full h-12  rounded-xl text-primary font-bold text-xs uppercase tracking-widest gap-2 hover:bg-primary/5" onClick={handleSkip}>
                  Continue as Guest <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/20 py-6 flex justify-center border-t border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-primary opacity-40" />
              <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30 italic">Secure Identity Layer 2.0</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative w-16 h-16 mx-auto mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-artisanal-rotation" />
            <div className="relative h-full w-full flex items-center justify-center text-primary font-headline font-bold text-3xl">V</div>
          </div>
          <h1 className="text-5xl font-headline font-bold text-secondary tracking-tighter">Welcome Back</h1>
          <p className="text-muted-foreground text-lg font-light italic leading-relaxed">
            Access the heritage registry to manage your handcrafted collection.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <TabsList className="grid w-full grid-cols-2 mb-10 bg-muted/30 p-1.5 rounded-[2rem] h-16 shadow-inner">
            <TabsTrigger value="login" className="rounded-[1.5rem] font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-[1.5rem] font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">Join Registry</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] shadow-2xl border-none p-4 bg-white/60 backdrop-blur-xl">
              <CardContent className="pt-10 space-y-6">
                {error && (
                  <Alert variant="destructive" className="rounded-2xl border-none bg-destructive/5 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold text-sm">Access Restricted</AlertTitle>
                    <AlertDescription className="text-[10px] font-medium uppercase">{error.hint}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="collector@heritage.com"
                        className="h-14 pl-12 rounded-2xl bg-white/50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Secret Key</Label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-14 pl-12 rounded-2xl bg-white/50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button className="w-full h-16 bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all shine-effect overflow-hidden" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Sign In"}
                  </Button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><Separator className="w-full bg-black/5" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground"><span className="bg-white/60 px-4 backdrop-blur-sm">Alternative Access</span></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-black/5 bg-white hover:bg-black/5 font-bold text-xs uppercase tracking-widest gap-3 shadow-md transition-all active:scale-95"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.77h2.64c1.54-1.42 2.43-3.5 2.43-5.2z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.27c-.73.49-1.66.78-2.64.78-2.03 0-3.75-1.37-4.36-3.22H4.11v2.32C5.92 21.01 8.76 23 12 23z" fill="#34A853" />
                        <path d="M7.64 15.63c-.16-.49-.25-1.01-.25-1.55s.09-1.06.25-1.55V10.2H4.11c-.54 1.1-.86 2.33-.86 3.65s.32 2.55.86 3.65l3.53-2.87z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.76 1 5.92 2.99 4.11 5.68l3.53 2.32c.61-1.85 2.33-3.22 4.36-3.22z" fill="#EA4335" />
                      </svg>
                      Sign In with Google
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-[3rem] shadow-2xl border-none p-4 bg-white/60 backdrop-blur-xl">
              <CardContent className="pt-10 space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Full Identity</Label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Arjun Verma"
                        className="h-14 pl-12 rounded-2xl bg-white/50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="arjun@heritage.com"
                      className="h-14 px-6 rounded-2xl bg-white/50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">Registry Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-14 px-6 rounded-2xl bg-white/50 border-none shadow-inner focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button className="w-full h-16 bg-secondary text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all shine-effect overflow-hidden" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Initiate Journey"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-[10px] uppercase font-black tracking-[0.3em] opacity-20 animate-pulse">
          Crafted with intent • Vridhira Marketplace
        </p>
      </div>
    </div>
  );
}
