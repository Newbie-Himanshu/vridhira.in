'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

export interface UseUserResult {
  user: User | null;
  isUserLoading: boolean;
  userRole: string | null;
}

/**
 * Hook to manage Firebase User state and fetch their role from Firestore.
 */
export function useUser(): UseUserResult {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserRole(null);
        setIsUserLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!user) return;
    
    // We fetch from 'customers' as it contains the platform role
    const customerRef = doc(db, 'customers', user.uid);
    const unsubscribe = onSnapshot(customerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserRole(data.role || 'user');
      } else {
        setUserRole('user');
      }
      setIsUserLoading(false);
    }, (error) => {
      console.warn("Error fetching user role, defaulting to 'user':", error);
      setUserRole('user');
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  return { user, isUserLoading, userRole };
}
