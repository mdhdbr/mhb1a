
'use client';

import { useEffect } from 'react';
import { useAlertStore, type Alert } from './alert-store';
import { useVehicleJobStore } from './job-store';
import { useAwaitingJobsStore } from './awaiting-jobs-store';
import { differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit, type Timestamp } from 'firebase/firestore';
import { useUserStore } from './user-store';
import type { UserProfile, FatigueEvent } from '@/lib/types';


// Define what a fatigue event from Firestore looks like
type FatigueEventFromFirestore = Omit<FatigueEvent, 'createdAt'> & {
  id: string;
  createdAt: Timestamp;
};

// Map the Firestore event to a UI Alert
const mapFatigueEventToAlert = (event: FatigueEventFromFirestore): Alert => {
    const priority = event.fatigueLevel.charAt(0).toUpperCase() + event.fatigueLevel.slice(1) as Alert['priority'];
    
    return {
        id: event.id, // Use Firestore document ID as the unique alert ID
        type: `Fatigue Alert: ${priority}`,
        description: `Driver ${event.driverName} has reported fatigue. Score: ${event.score}`,
        time: event.createdAt ? formatDistanceToNow(event.createdAt.toDate(), { addSuffix: true }) : 'Just now',
        priority: priority,
        icon: 'sos',
    };
};


const generateAlerts = (): Omit<Alert, 'id' | 'time'>[] => {
    const awaitingJobs = useAwaitingJobsStore.getState().awaitingJobs;
    const vehicles = useVehicleJobStore.getState().vehicles;
    const now = new Date();
    const newAlerts: Omit<Alert, 'id' | 'time'>[] = [];

    // 1. Awaiting Allocation Alert
    awaitingJobs.forEach(job => {
        if (job.createdAt) {
            const minutesPending = differenceInMinutes(now, new Date(job.createdAt));
            if (minutesPending > 5) {
                newAlerts.push({
                    id: `pending-${job.id}`,
                    type: 'Job Pending Allocation',
                    description: `Job #${job.id} awaiting allocation for ${minutesPending} min.`,
                    priority: 'High',
                    icon: 'hourglass',
                });
            }
        }
    });

    // 2. Alerts based on vehicle jobs
    vehicles.forEach(vehicle => {
        const { job, driver, status } = vehicle;
        if (!job || !job.id) return;

        // Late Accept Alert
        if (job.status === 'Received' && job.bookingTime) {
            const minutesSinceReceived = differenceInMinutes(now, new Date(job.bookingTime));
            if (minutesSinceReceived > 2) {
                newAlerts.push({
                    id: `late-accept-${job.id}`,
                    type: 'Late Accept',
                    description: `Job #${job.id} was not accepted by driver.`,
                    priority: 'High',
                    icon: 'acceptance',
                    hint: 'The driver has not accepted the job within the specified time interval.'
                });
            }
        }

        // Job Changes Alert - Simulated for a specific job for demonstration
        if (job.id === 'JOB-003' && job.status === 'Received') {
             newAlerts.push({
                id: `job-changes-${job.id}`,
                type: 'Job Changes',
                description: `Job #${job.id} was updated. Awaiting driver confirmation.`,
                priority: 'Medium',
                icon: 'acceptance',
                hint: 'Driver should accept Job changes'
            });
        }
        
        // Late to Pickup Alert
        if ((job.status === 'Accepted' || job.status === 'ON ROUTE TO PU') && job.pickupDate) {
            try {
                const [datePart, timePart] = job.pickupDate.split(' ');
                const [day, month, year] = datePart.split('/');
                const pickupTime = new Date(`${year}-${month}-${day}T${timePart}`);
                
                if (now > pickupTime && differenceInMinutes(now, pickupTime) > 15) {
                     newAlerts.push({
                        id: `late-pickup-${job.id}`,
                        type: 'Late to Pickup',
                        description: `Driver ${driver.name} is >15m late for pickup for job #${job.id}.`,
                        priority: 'High',
                        icon: 'warning',
                        hint: 'Driver is expected to be late to the first pickup.'
                    });
                }
            } catch(e) {
                console.error("Could not parse pickupDate for late pickup alert:", job.pickupDate);
            }
        }

        // Waiting Time Alert
        if (job.status === 'Arrived' && job.pickupDate) {
            try {
                const [datePart, timePart] = job.pickupDate.split(' ');
                const [day, month, year] = datePart.split('/');
                const arrivedTime = new Date(`${year}-${month}-${day}T${timePart}`);
                const waitingMinutes = differenceInMinutes(now, arrivedTime);
                if (waitingMinutes > 10) {
                    newAlerts.push({
                       id: `waiting-time-${job.id}`,
                       type: 'Waiting Time',
                       description: `Driver for job #${job.id} has been waiting at pickup >10 min.`,
                       priority: 'Medium',
                       icon: 'info',
                       hint: 'Driver is waiting longer than the specified time.'
                    });
                }
            } catch(e) {
                 console.error("Could not parse pickupDate for waiting time alert:", job.pickupDate);
            }
        }
        
        // Driver is Offline Alert
        if (status === 'Offline' && job.id && !['Completed', 'Idle', 'Empty'].includes(job.status)) {
             newAlerts.push({
                id: `offline-${job.id}`,
                type: 'Driver is Offline',
                description: `Driver ${driver.name} is offline but has an uncompleted job (#${job.id}).`,
                priority: 'Critical',
                icon: 'sos',
                hint: 'Driver is offline'
            });
        }
    });

    return newAlerts;
};


function useSystemAlertsInitializer() {
    const { _setSystemAlerts } = useAlertStore();

    useEffect(() => {
        const updateAlerts = () => {
            const rawAlerts = generateAlerts();
            const finalAlerts = rawAlerts.map(a => ({
                ...a,
                id: a.id || `${a.type}-${a.description}`.replace(/\s+/g, '-').toLowerCase(),
                time: 'Just now'
            }));
            _setSystemAlerts(finalAlerts);
        };
        
        // Initial generation
        updateAlerts();

        // Subscribe to changes in other stores
        const unsubVehicleJobs = useVehicleJobStore.subscribe(updateAlerts);
        const unsubAwaitingJobs = useAwaitingJobsStore.subscribe(updateAlerts);
        
        // Set up a timer for periodic regeneration
        const intervalId = setInterval(updateAlerts, 15000); // Regenerate every 15 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(intervalId);
            unsubVehicleJobs();
            unsubAwaitingJobs();
        };

    }, [_setSystemAlerts]);
}

function useFatigueAlertsInitializer() {
    const firestore = useFirestore();
    const { _setFatigueAlerts } = useAlertStore();

    useEffect(() => {
        if (!firestore) return;

        const q = query(
            collection(firestore, "fatigueEvents"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<FatigueEvent, 'createdAt'>),
                createdAt: d.data().createdAt as Timestamp,
            }));
            const mappedAlerts = data.map(mapFatigueEventToAlert);
            _setFatigueAlerts(mappedAlerts);
        }, (error) => {
            console.error("Error fetching fatigueEvents:", error);
            _setFatigueAlerts([]); // Clear fatigue alerts on error
        });

        return () => unsubscribe();
    }, [firestore, _setFatigueAlerts]);
}


function useUsersInitializer() {
  const { isUserLoading } = useUser();
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
      (error) => {
        console.error("Error fetching users:", error);
        setError(error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, isUserLoading, setUsers, setLoading, setError]);
}

export function StoreInitializer() {
    useSystemAlertsInitializer();
    useFatigueAlertsInitializer();
    useUsersInitializer();
    return null;
}
