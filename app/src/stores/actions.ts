
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAlertStore, type Alert } from '@/stores/alert-store';
import { useVehicleJobStore } from '@/stores/job-store';
import { useAwaitingJobsStore } from '@/stores/awaiting-jobs-store';
import { differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useUserStore } from '@/stores/user-store';
import type { UserProfile, FatigueEvent } from '@/lib/types';


// Define what a fatigue event from Firestore looks like
type FatigueEventFromFirestore = Omit<FatigueEvent, 'createdAt'> & {
  id: string;
  createdAt: Timestamp;
};

// Map the Firestore event to a UI Alert
const mapFatigueEventToAlert = (event: FatigueEventFromFirestore): Alert => {
    const severity: Alert['severity'] = event.fatigueLevel === 'critical'
        ? 'critical'
        : event.fatigueLevel === 'high'
            ? 'warning'
            : 'info';

    return {
        alertId: event.id,
        type: `Fatigue Alert: ${event.fatigueLevel}`,
        severity,
        status: 'active',
        message: `Driver ${event.driverName} has reported fatigue. Score: ${event.score}. ${event.createdAt ? formatDistanceToNow(event.createdAt.toDate(), { addSuffix: true }) : 'Just now'}`,
        icon: 'sos',
        triggeredAt: event.createdAt,
        source: 'driver',
        metadata: {
            driverName: event.driverName,
            fatigueLevel: event.fatigueLevel,
            score: event.score,
        },
    };
};


const mapPriorityToSeverity = (priority: 'Low' | 'Medium' | 'High' | 'Critical'): Alert['severity'] => {
    if (priority === 'Critical') return 'critical';
    if (priority === 'High') return 'warning';
    return 'info';
};

const generateAlerts = (): Alert[] => {
    const awaitingJobs = useAwaitingJobsStore.getState().awaitingJobs;
    const vehicles = useVehicleJobStore.getState().vehicles;
    const now = new Date();
    const newAlerts: Alert[] = [];

    // 1. Awaiting Allocation Alert
    awaitingJobs.forEach(job => {
        if (job.createdAt) {
            const minutesPending = differenceInMinutes(now, new Date(job.createdAt));
            if (minutesPending > 5) {
                const priority: 'High' = 'High';
                newAlerts.push({
                    alertId: `pending-${job.id}`,
                    type: 'Job Pending Allocation',
                    severity: mapPriorityToSeverity(priority),
                    jobId: job.id,
                    status: 'active',
                    message: `Job #${job.id} awaiting allocation for ${minutesPending} min.`,
                    icon: 'warning',
                    triggeredAt: Timestamp.now(),
                    source: 'system',
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
                const priority: 'High' = 'High';
                newAlerts.push({
                    alertId: `late-accept-${job.id}`,
                    type: 'Late Accept',
                    severity: mapPriorityToSeverity(priority),
                    jobId: job.id,
                    status: 'active',
                    message: `Job #${job.id} was not accepted by driver.`,
                    hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
                    icon: 'acceptance',
                    triggeredAt: Timestamp.now(),
                    source: 'system',
                });
            }
        }

        // Job Changes Alert
        if (job.id === 'JOB-003' && job.status === 'Received') {
             const priority: 'Medium' = 'Medium';
             newAlerts.push({
                alertId: `job-changes-${job.id}`,
                type: 'Job Changes',
                severity: mapPriorityToSeverity(priority),
                jobId: job.id,
                status: 'active',
                message: `Job #${job.id} was updated. Awaiting driver confirmation.`,
                icon: 'acceptance',
                hint: 'Driver should accept Job changes',
                triggeredAt: Timestamp.now(),
                source: 'system',
            });
        }
        
        // Late to Pickup Alert
        if ((job.status === 'Accepted' || job.status === 'ON ROUTE TO PU') && job.pickupDate) {
            try {
                const [datePart, timePart] = job.pickupDate.split(' ');
                const [day, month, year] = datePart.split('/');
                const pickupTime = new Date(`${year}-${month}-${day}T${timePart}`);
                
                if (now > pickupTime && differenceInMinutes(now, pickupTime) > 15) {
                     const priority: 'High' = 'High';
                     newAlerts.push({
                        alertId: `late-pickup-${job.id}`,
                        type: 'Late to Pickup',
                        severity: mapPriorityToSeverity(priority),
                        jobId: job.id,
                        status: 'active',
                        message: `Driver ${driver.name} is >15m late for pickup for job #${job.id}.`,
                        icon: 'pickup',
                        hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
                        triggeredAt: Timestamp.now(),
                        source: 'system',
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
                const priority: 'High' = 'High';
                newAlerts.push({
                    alertId: `late-dropoff-${job.id}`,
                    type: 'Late to Drop Off',
                    severity: mapPriorityToSeverity(priority),
                    jobId: job.id,
                    status: 'active',
                    message: `Driver ${driver.name} is expected to be late for drop-off for job #${job.id}.`,
                    icon: 'dropoff',
                    hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
                    triggeredAt: Timestamp.now(),
                    source: 'system',
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
                    const priority: 'Medium' = 'Medium';
                    newAlerts.push({
                       alertId: `waiting-time-${job.id}`,
                       type: 'Waiting Time',
                       severity: mapPriorityToSeverity(priority),
                       jobId: job.id,
                       status: 'active',
                       message: `Driver for job #${job.id} has been waiting at pickup >10 min.`,
                       icon: 'waiting',
                       hint: 'The text of the hint is defined by the Planning Screen Administration settings.',
                       triggeredAt: Timestamp.now(),
                       source: 'system',
                    });
                }
            } catch(e) {
                 console.error("Could not parse pickupDate for waiting time alert:", job.pickupDate);
            }
        }
        
        // Driver is Offline Alert
        if (status === 'Offline' && job.id && !['Completed', 'Idle', 'Empty'].includes(job.status)) {
             const priority: 'Critical' = 'Critical';
             newAlerts.push({
                alertId: `offline-${job.id}`,
                type: 'Driver is Offline',
                severity: mapPriorityToSeverity(priority),
                jobId: job.id,
                status: 'active',
                message: `Driver ${driver.name} is offline but has an uncompleted job (#${job.id}).`,
                icon: 'sos',
                hint: 'Driver is offline',
                triggeredAt: Timestamp.now(),
                source: 'system',
            });
        }
        
        // Flight Number Alert
        if (job.flight) {
             const priority: 'Medium' = 'Medium';
             newAlerts.push({
                alertId: `flight-${job.id}`,
                type: 'Flight Number',
                severity: mapPriorityToSeverity(priority),
                jobId: job.id,
                status: 'active',
                message: `Job #${job.id} has a flight number (${job.flight}). Check flight status.`,
                icon: 'flight',
                hint: 'Flight number has been provided for this job',
                triggeredAt: Timestamp.now(),
                source: 'system',
            });
        }

        // Callout Alert (simulated)
        if (vehicle.callsign === 'KING-1') {
            const priority: 'Medium' = 'Medium';
            newAlerts.push({
                alertId: `callout-${job.id}`,
                type: 'Callout',
                severity: mapPriorityToSeverity(priority),
                jobId: job.id,
                status: 'active',
                message: `Job #${job.id}: Driver should callout at pickup location`,
                icon: 'callout',
                hint: 'Driver must perform a callout at the specified location.',
                triggeredAt: Timestamp.now(),
                source: 'system',
            });
        }
        
        // Landline Alert (simulated)
        if (job.account === 'Riyadh Foods Co.') { // This client has a landline number
             const priority: 'Low' = 'Low';
             newAlerts.push({
                alertId: `landline-${job.id}`,
                type: 'Landline',
                severity: mapPriorityToSeverity(priority),
                jobId: job.id,
                status: 'active',
                message: `Passenger number for Job #${job.id} is a landline.`,
                icon: 'landline',
                hint: 'SMS cannot be sent to a landline number',
                triggeredAt: Timestamp.now(),
                source: 'system',
            });
        }
        
        // Integration Alert (simulated)
        if (job.account === 'Global Petro Services') { // This client uses an integration
             const priority: 'Low' = 'Low';
             newAlerts.push({
                alertId: `integration-${job.id}`,
                type: 'Integration',
                severity: mapPriorityToSeverity(priority),
                jobId: job.id,
                status: 'active',
                message: `Job #${job.id} was received via a booking integration.`,
                icon: 'integration',
                hint: 'This job originated from an external partner system.',
                triggeredAt: Timestamp.now(),
                source: 'integration',
            });
        }

    });

    return newAlerts;
};

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
    const firestore = useFirestore();
    const { setAlerts } = useAlertStore();
    const [systemAlerts, setSystemAlerts] = useState<Alert[]>([]);
    const [fatigueAlerts, setFatigueAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const updateAlerts = () => {
            setSystemAlerts(generateAlerts());
        };

        updateAlerts();
        const unsubVehicleJobs = useVehicleJobStore.subscribe(updateAlerts);
        const unsubAwaitingJobs = useAwaitingJobsStore.subscribe(updateAlerts);
        const intervalId = setInterval(updateAlerts, 15000);

        return () => {
            clearInterval(intervalId);
            unsubVehicleJobs();
            unsubAwaitingJobs();
        };
    }, []);

    useEffect(() => {
        if (!firestore) return;

        const q = query(
            collection(firestore, "fatigueEvents"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({
                ...(d.data() as Omit<FatigueEvent, 'createdAt'>),
                id: d.id,
                createdAt: d.data().createdAt as Timestamp,
            }));
            const mappedAlerts = data.map(mapFatigueEventToAlert);
            setFatigueAlerts(mappedAlerts);
        }, (error) => {
            console.error("Error fetching fatigueEvents:", error);
            setFatigueAlerts([]);
        });

        return () => unsubscribe();
    }, [firestore]);

    const combinedAlerts = useMemo(() => [...fatigueAlerts, ...systemAlerts], [fatigueAlerts, systemAlerts]);

    useEffect(() => {
        setAlerts(combinedAlerts);
    }, [combinedAlerts, setAlerts]);

    useUsersInitializer();
    return null;
}
