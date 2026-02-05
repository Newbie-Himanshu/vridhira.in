"use client"

import React from 'react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function FeeOptimizationPage() {
  const { user, userRole, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="p-4">Loading user permissions...</div>;
  }

  const isOwner = userRole === 'owner' || user?.email === 'hk8913114@gmail.com';

  if (!user || !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have sufficient permissions to view the Fee Optimization settings.
            Only users with the 'owner' role can access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Fee Optimization</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Manage your platform&apos;s fee strategy
          </h3>
          <p className="text-sm text-muted-foreground">
            Adjust commission rates, analyze impact, and optimize revenue.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            AI-driven data will load here for the owner.
          </p>
        </div>
      </div>
    </div>
  );
}
