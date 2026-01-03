
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
                    icon: 'warning',
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
                    hint: 'The text of the hint is defined by the Planning Screen Administration settings.'
                });
            }
        }

        // Job Changes Alert
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
                        icon: 'pickup',
                        hint: 'The text of the hint is defined by the Planning Screen Administration settings.'
                    });
                }
            } catch(e) {
                console.error("Could not parse pickupDate for late pickup alert:", job.pickupDate);
            }
        }

        // Late to Drop Off Alert
        const lateToDropOffStatuses = ['ON ROUTE TO PU', 'En Route to Dropoff', 'POB-ON ROUTE'];
        if (job.eta && lateToDropOffStatuses.includes(job.status)) {
            // This is a simulation. A real implementation would parse eta and compare to now.
            // For demo, let's trigger it for a specific job.
            if (job.id === 'JOB-004') {
                newAlerts.push({
                    id: `late-dropoff-${job.id}`,
                    type: 'Late to Drop Off',
                    description: `Driver ${driver.name} is expected to be late for drop-off for job #${job.id}.`,
                    priority: 'High',
                    icon: 'dropoff',
                    hint: 'The text of the hint is defined by the Planning Screen Administration settings.'
                });
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
                       icon: 'waiting',
                       hint: 'The text of the hint is defined by the Planning Screen Administration settings.'
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
        
        // Flight Number Alert
        if (job.flight) {
             newAlerts.push({
                id: `flight-${job.id}`,
                type: 'Flight Number',
                description: `Job #${job.id} has a flight number (${job.flight}). Check flight status.`,
                priority: 'Medium',
                icon: 'flight',
                hint: 'Flight number has been provided for this job'
            });
        }

        // Callout Alert (simulated)
        if (vehicle.callsign === 'KING-1') {
            newAlerts.push({
                id: `callout-${job.id}`,
                type: 'Callout',
                description: `Job #${job.id}: Driver should callout at pickup location`,
                priority: 'Medium',
                icon: 'callout',
                hint: 'Driver must perform a callout at the specified location.'
            });
        }
        
        // Landline Alert (simulated)
        if (job.account === 'Riyadh Foods Co.') { // This client has a landline number
             newAlerts.push({
                id: `landline-${job.id}`,
                type: 'Landline',
                description: `Passenger number for Job #${job.id} is a landline.`,
                priority: 'Low',
                icon: 'landline',
                hint: 'SMS cannot be sent to a landline number'
            });
        }
        
        // Integration Alert (simulated)
        if (job.account === 'Global Petro Services') { // This client uses an integration
             newAlerts.push({
                id: `integration-${job.id}`,
                type: 'Integration',
                description: `Job #${job.id} was received via a booking integration.`,
                priority: 'Low',
                icon: 'integration',
                hint: 'This job originated from an external partner system.'
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
