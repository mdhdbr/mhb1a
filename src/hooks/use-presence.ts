
'use client';
import { useEffect } from 'react';
import { doc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

export function usePresence() {
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    // FIX: Wait for both user and firestore to be available before proceeding.
    if (!user || !firestore) return;

    const userStatusRef = doc(firestore, `users/${user.uid}`);

    const updateStatus = async (status: 'online' | 'offline') => {
      try {
        // No need to check for doc existence if rules are set correctly,
        // but it's good practice for resilience.
        const docSnap = await getDoc(userStatusRef);
        if (docSnap.exists()) {
            await updateDoc(userStatusRef, {
              status: status,
              lastSeen: serverTimestamp(),
            });
        }
      } catch (error) {
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('No document to update'))) {
          // Ignore permission errors (e.g., on logout) or cases where the doc doesn't exist yet
        } else {
          console.error('Failed to update presence:', error);
        }
      }
    };

    updateStatus('online');

    const handleBeforeUnload = () => {
        // This is a best-effort attempt and may not run reliably.
        updateStatus('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateStatus('online');
      } else {
        updateStatus('offline');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // **THE FIX**: Only update status if the user object still exists during cleanup.
      if (user) {
        updateStatus('offline');
      }
    };
  }, [user, firestore]);
}
