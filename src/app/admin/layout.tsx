'use client';

import { AdminSidebar } from '@/components/AdminSidebar';
import { useUser } from '@/firebase';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading, userRole } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthorized = userRole === 'owner' || userRole === 'store admin' || user?.email === 'hk8913114@gmail.com';

  if (!user || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-6 pt-24">
        <div className="bg-destructive/10 p-4 rounded-full">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-secondary">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          This area is reserved for Vridhira Marketplace administrators. 
          If you believe this is an error, please contact the platform owner.
        </p>
        <Link href="/">
          <Button variant="default" className="bg-primary hover:bg-primary/90 rounded-full px-8">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background pt-20 overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 min-w-0 bg-background/40 backdrop-blur-sm p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
