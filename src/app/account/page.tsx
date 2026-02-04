
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar, Loader2, LogOut, Package, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const { data: customer, isLoading: isCustomerLoading } = useDoc<Customer>(customerRef);

  if (isUserLoading || isCustomerLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest px-4 py-1">Member Profile</Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-secondary">Your Account</h1>
          <p className="text-muted-foreground italic">Manage your heritage collection and profile details.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="rounded-full px-6 border-destructive/20 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-xl bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden artisan-pattern">
          <CardHeader className="bg-secondary text-secondary-foreground p-8 pb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-3xl font-bold shadow-2xl animate-subtle-float">
                {user.displayName?.[0] || 'A'}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-headline">{user.displayName || 'Artisan Enthusiast'}</CardTitle>
                <CardDescription className="text-secondary-foreground/70 flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {user.email || 'Verified User'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 -mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter text-xs">
                    <Shield className="h-4 w-4" />
                    Access Level
                  </div>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary capitalize font-bold">{customer?.role || 'user'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Identity Status</span>
                  {customer?.isVerified ? (
                    <Badge className="bg-green-100 text-green-700 border-none gap-1 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive border-destructive/20 gap-1 font-bold">
                      <AlertTriangle className="h-3 w-3" /> Unverified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter text-xs">
                  <Calendar className="h-4 w-4" />
                  Membership
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Joined</span>
                  <span className="font-bold">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Account Type</span>
                  <span className="font-bold">{user.providerData[0]?.providerId === 'google.com' ? 'Google linked' : 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border/30">
              <h3 className="font-headline text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Quick Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 rounded-2xl justify-start px-6 gap-4 group hover:border-primary transition-all" asChild>
                  <a href="/cart">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Package className="h-4 w-4" />
                    </span>
                    View My Cart
                  </a>
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl justify-start px-6 gap-4 group hover:border-primary transition-all" asChild>
                  <a href="/shop">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <User className="h-4 w-4" />
                    </span>
                    Explore Marketplace
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
