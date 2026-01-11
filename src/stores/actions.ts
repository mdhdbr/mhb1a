
'use client';

import { useEffect } from 'react';
import { useAlertStore, type Alert } from './alert-store';
import { useVehicleJobStore } from './job-store';
import { useAwaitingJobsStore } from './awaiting-jobs-store';
import { differenceInMinutes } from 'date-fns';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit, type Timestamp, doc, getDoc } from 'firebase/firestore';
import { useUserStore } from './user-store';
import type { UserProfile, FatigueEvent } from '@/lib/types';
import { useAlertSettingsStore } from './alert-settings-store';


// This function will eventually be deprecated in favor of a real backend.
// For now, it mocks the creation of alerts based on client-side state.
const generateMockAlerts = (): Omit<Alert, 'alertId' | 'triggeredAt'>[] => {
    const awaitingJobs = useAwaitingJobsStore.getState().awaitingJobs;
    const vehicles = useVehicleJobStore.getState().vehicles;
    const alertRules = useAlertSettingsStore.getState().rules;
    const now = new Date();
    const newAlerts: Omit<Alert, 'alertId' | 'triggeredAt'>[] = [];

    // Late Accept
    const lateAcceptJob = vehicles.find(v => v.job.id === 'JOB-002');
    if (alertRules.late_accept.enabled && lateAcceptJob && lateAcceptJob.job.status === 'Received' && lateAcceptJob.job.bookingTime) {
        const minutesSinceReceived = differenceInMinutes(now, new Date(lateAcceptJob.job.bookingTime));
        if (minutesSinceReceived > (alertRules.late_accept.threshold || 2)) {
            newAlerts.push({
                type: 'acceptance', // FIX: Changed from 'late_accept'
                severity: 'warning',
                jobId: 'JOB-002',
                driverId: lateAcceptJob.driver.id,
                vehicleId: lateAcceptJob.id,
                status: 'active',
                message: `Driver has not accepted job within ${alertRules.late_accept.threshold} min.`,
                hint: 'Configured via Planning Screen settings',
                source: 'system',
            });
        }
    }

    // Job Changes (This is more of a notification, but we can model it as an info alert)
    const changedJob = vehicles.find(v => v.job.id === 'JOB-003' && v.job.status === 'Received');
    if (changedJob) {
         newAlerts.push({
            type: 'info', // FIX: Changed from 'job_changes' to a generic info type
            severity: 'info',
            jobId: 'JOB-003',
            driverId: changedJob.driver.id,
            vehicleId: changedJob.id,
            status: 'active',
            message: 'Job was updated. Awaiting driver confirmation.',
            hint: 'Driver should accept Job changes',
            source: 'system',
        });
    }

    // Soft Allocated
    const softAllocatedJob = vehicles.find(v => v.job.id === 'JOB-SOFT');
    if (alertRules.soft_allocated.enabled && softAllocatedJob && softAllocatedJob.job.status === 'Soft Allocated') {
        newAlerts.push({
            type: 'warning', // FIX: Changed from 'soft_allocated'
            severity: 'warning',
            jobId: 'JOB-SOFT',
            driverId: softAllocatedJob.driver.id,
            vehicleId: softAllocatedJob.id,
            status: 'active',
            message: 'Job not confirmed before pickup time.',
            hint: 'Confirm soft-allocated job with driver or client.',
            source: 'system',
        });
    }

    // Driver Offline
     const offlineJob = vehicles.find(v => v.status === 'Offline' && v.job.id && !['Completed', 'Idle', 'Empty'].includes(v.job.status));
     if(alertRules.driver_offline.enabled && offlineJob && offlineJob.job.id) {
         newAlerts.push({
            type: 'sos', // FIX: Changed from 'driver_offline'
            severity: 'critical',
            jobId: offlineJob.job.id,
            driverId: offlineJob.driver.id,
            vehicleId: offlineJob.id,
            status: 'active',
            message: `Driver ${offlineJob.driver.name} is offline but has an uncompleted job.`,
            hint: 'Driver is offline with an active job.',
            source: 'system',
        });
     }

    // Late to Pickup
    const latePickupJob = vehicles.find(v => v.job.id === 'JOB-004'); // Simulate with a specific job
    if (alertRules.late_pickup.enabled && latePickupJob) {
        newAlerts.push({
            type: 'pickup', // FIX: Changed from 'late_pickup'
            severity: 'warning',
            jobId: 'JOB-004',
            driverId: latePickupJob.driver.id,
            vehicleId: latePickupJob.id,
            status: 'active',
            message: `Driver ${latePickupJob.driver.name} is >${alertRules.late_pickup.threshold}m late for pickup.`,
            hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
            source: 'system',
        });
    }
    
    // Late to Dropoff
    const lateDropoffJob = vehicles.find(v => v.job.id === 'JOB-302'); // Simulate
    if (alertRules.late_dropoff.enabled && lateDropoffJob) {
        newAlerts.push({
            type: 'dropoff', // FIX: Changed from 'late_dropoff'
            severity: 'warning',
            jobId: 'JOB-302',
            driverId: lateDropoffJob.driver.id,
            vehicleId: lateDropoffJob.id,
            status: 'active',
            message: `Driver ${lateDropoffJob.driver.name} is expected to be late for drop-off.`,
            hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
            source: 'system',
        });
    }

    // Waiting Time
    const waitingJob = vehicles.find(v => v.job.id === 'JOB-004' && v.job.status === 'Arrived');
    if (alertRules.waiting_time.enabled && waitingJob) {
         newAlerts.push({
            type: 'waiting', // FIX: Changed from 'waiting_time'
            severity: 'warning',
            jobId: 'JOB-004',
            driverId: waitingJob.driver.id,
            vehicleId: waitingJob.id,
            status: 'active',
            message: `Driver has been waiting at pickup >${alertRules.waiting_time.threshold} min.`,
            hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
            source: 'system',
        });
    }


    return newAlerts;
};


function useMockAlertsInitializer() {
    const { setAlerts } = useAlertStore();

    useEffect(() => {
        const updateAlerts = () => {
            const rawAlerts = generateMockAlerts();
            const finalAlerts = rawAlerts.map((a, i) => ({
                ...a,
                alertId: a.jobId ? `${a.type}-${a.jobId}` : `${a.type}-${i}`,
                triggeredAt: { seconds: Math.floor(Date.now() / 1000) - (i * 60), nanoseconds: 0 } as Timestamp
            }));
            setAlerts(finalAlerts);
        };
        
        updateAlerts(); // Initial generation
        
        const unsubSettings = useAlertSettingsStore.subscribe(updateAlerts);
        const unsubVehicles = useVehicleJobStore.subscribe(updateAlerts);
        
        const intervalId = setInterval(updateAlerts, 30000); // Regenerate every 30 seconds for demo

        return () => {
            clearInterval(intervalId);
            unsubSettings();
            unsubVehicles();
        };

    }, [setAlerts]);
}


function useUsersInitializer() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { setUsers, setLoading, setError } = useUserStore();

  useEffect(() => {
    if (!firestore || isUserLoading) {
      setLoading(true);
      return;
    }

    const usersRef = collection(firestore, 'users');
    const unsubscribe = onSnapshot(usersRef,
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(usersData);
      },
      async (error) => {
        console.error("Error fetching users:", error);

        const message = typeof (error as any)?.message === 'string' ? (error as any).message : '';
        const code = typeof (error as any)?.code === 'string' ? (error as any).code : '';
        const isPermissionDenied =
          code.includes('permission-denied') ||
          message.includes('permission-denied') ||
          message.includes('Missing or insufficient permissions');

        if (isPermissionDenied) {
          try {
            if (!user) {
              setUsers([]);
              return;
            }

            try {
              const token = await user.getIdToken();
              const res = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                  authorization: `Bearer ${token}`,
                },
              });

              if (res.ok) {
                const body = await res.json();
                if (Array.isArray(body?.users)) {
                  setUsers(body.users as UserProfile[]);
                  return;
                }
              }
            } catch (apiError) {
              console.error('Admin users API fallback failed:', apiError);
            }

            const selfRef = doc(firestore, 'users', user.uid);
            const selfSnap = await getDoc(selfRef);

            if (selfSnap.exists()) {
              setUsers([{ id: selfSnap.id, ...(selfSnap.data() as Omit<UserProfile, 'id'>) }]);
            } else {
              setUsers([
                {
                  id: user.uid,
                  email: user.email ?? undefined,
                  role: 'admin',
                  status: 'online',
                },
              ]);
            }
          } catch (fallbackError) {
            console.error('Fallback user profile fetch failed:', fallbackError);
            setUsers([]);
          }
          return;
        }

        setError(error as Error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, isUserLoading, setUsers, setLoading, setError, user]);
}

export function StoreInitializer() {
    useMockAlertsInitializer();
    useUsersInitializer();
    return null;
}
