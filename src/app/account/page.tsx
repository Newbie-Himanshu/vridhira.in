'use client';

import { useUser } from '@/hooks/use-user';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import OverviewTab from '@/components/account/OverviewTab';
import AddressTab from '@/components/account/AddressTab';
import MyOrdersTab from '@/components/account/MyOrdersTab';
import NotificationsTab from '@/components/account/NotificationsTab';
import { Loader2 } from 'lucide-react';

export default function AccountPage() {
  const { user, loading: isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/login?returnTo=/account`);
    }
  }, [user, isUserLoading, router]);

  const activeTab = searchParams.get('tab') || 'overview';

  if (isUserLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AccountLayout>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'orders' && <MyOrdersTab />}
      {activeTab === 'addresses' && <AddressTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {/* Fallback for unused tabs in prototype */}
      {!['overview', 'orders', 'addresses', 'notifications'].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
          <Loader2 className="h-12 w-12 animate-pulse mb-4" />
          <h2 className="text-2xl font-headline font-bold">Registry Protocol Pending</h2>
          <p className="text-sm">This section of the heritage registry is currently being calibrated.</p>
        </div>
      )}
    </AccountLayout>
  );
}
