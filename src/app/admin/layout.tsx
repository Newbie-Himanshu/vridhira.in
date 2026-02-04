
'use client';

import { AdminSidebar } from '@/components/AdminSidebar';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const customerRef = useMemoFirebase(() => 
    user ? doc(db, 'customers', user.uid) : null, 
    [db, user]
  );
  
  const { data: customer, isLoading: isRoleLoading } = useDoc<Customer>(customerRef);

  if (isUserLoading || isRoleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthorized = customer?.role === 'owner' || customer?.role === 'store admin';

  if (!user || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-6">
        <div className="bg-destructive/10 p-4 rounded-full">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-secondary">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          This area is reserved for Vridhira Marketplace administrators. 
          If you believe this is an error, please contact the platform owner.
        </p>
        <Link href="/">
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
