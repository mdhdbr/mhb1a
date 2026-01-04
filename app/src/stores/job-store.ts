
'use client';

import { create } from 'zustand';
import type { Vehicle, VehicleJob, DriverData, Job } from '@/lib/types';
import { useDriverStore, StoredDriverData } from '@/stores/driver-store';
import { format, formatDistanceToNow, subMinutes } from 'date-fns';

const generateVehicles = (driverGridData: StoredDriverData[]): Vehicle[] => {
  return driverGridData.map((driver, index) => {
    const jobDetails: { [key: string]: VehicleJob } = {
      'SA-12345': { // Ali Ahmed - For Integration Alert
        id: 'JOB-301', 
        status: 'Completed',
        service: 'Freight',
        account: 'Global Petro Services',
        pickup: 'Riyadh Port',
        pickupDate: '2024-07-28 10:00',
        bookingTime: new Date('2024-07-28T10:00:00').toISOString(),
        flight: null,
        pax: null,
        distance: 150, 
        dwellTime: '25m', 
        eta: 'Completed',
        plannedRoute: [[24.7136, 46.6753], [24.80, 46.73]],
        actualRoute: [[24.7136, 46.6753], [24.78, 46.72]],
      },
      'SA-67890': { // Fatima Khan
        id: 'JOB-302',
        status: 'Completed',
        service: 'Passenger',
        account: 'Innovate LLC',
        pickup: 'Kingdom Centre',
        pickupDate: '2024-07-29 11:30',
        bookingTime: new Date('2024-07-29T11:30:00').toISOString(),
        flight: null,
        pax: '2 PAX',
        distance: 45,
        dwellTime: '8m',
        eta: 'Completed',
        plannedRoute: null,
        actualRoute: null,
      },
      'SA-24680': { // Hassan Ibrahim
        id: 'JOB-002', 
        status: 'Received', // **FIX**: Set to Received for Late Accept demo
        service: 'Passenger',
        account: 'VIP Transfer',
        pickup: 'King Khalid Airport',
        pickupDate: '2024-08-02 14:00',
        bookingTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // **FIX**: Set to 3 mins ago for Late Accept demo
        flight: 'SV123',
        pax: '2 PAX',
        distance: 75,
        dwellTime: '5m',
        eta: '22 minutes',
        plannedRoute: null,
        actualRoute: null,
      },
      'SA-11223': { // Aisha Lima
        id: 'JOB-003',
        status: 'Received', // **FIX**: Set to Received to simulate a job change
        service: 'Passenger',
        account: 'Innovate LLC',
        pickup: 'KAFD',
        pickupDate: format(subMinutes(new Date(), 20), 'dd/MM/yyyy HH:mm'),
        bookingTime: subMinutes(new Date(), 30).toISOString(),
        flight: null,
        pax: '1 PAX',
        distance: 25,
        dwellTime: '0m',
        eta: '10 minutes',
        plannedRoute: null,
        actualRoute: null,
      },
       'SA-55667': { // Mohammed Singh
        id: 'JOB-004',
        status: 'Arrived',
        service: 'Freight',
        account: 'Riyadh Foods Co.', // For Landline Alert
        pickup: 'Dammam Port',
        pickupDate: format(subMinutes(new Date(), 15), 'dd/MM/yyyy HH:mm'),
        bookingTime: subMinutes(new Date(), 60).toISOString(),
        flight: null,
        pax: '1 Container',
        distance: 450,
        dwellTime: '15m',
        eta: 'Now',
        plannedRoute: null,
        actualRoute: null,
      },
      // Yusuf Al-Malik's vehicle (VEH-006 in old data) - For Callout Alert
      'KSA-0001': {
        id: 'VIP-001', 
        status: 'Arrived', 
        service: 'VVIP',
        account: 'Royal Court',
        pickup: 'King Khalid Airport',
        pickupDate: format(subMinutes(new Date(), 2), 'dd/MM/yyyy HH:mm'),
        bookingTime: subMinutes(new Date(), 10).toISOString(),
        flight: 'SV101', // For Flight Alert
        pax: '1PAX',
        distance: 50, 
        dwellTime: '2m', 
        eta: '15 minutes', 
        plannedRoute: [[24.957, 46.699], [24.8, 46.7]],
        actualRoute: [[24.957, 46.699], [24.88, 46.7]]
      },
    };
    
    const job = jobDetails[driver.vehicleRegNum] || { 
        id: null, 
        status: 'Idle', 
        distance: 0, 
        dwellTime: driver.dutyStartTime ? formatDistanceToNow(new Date(driver.dutyStartTime), { addSuffix: false }) : 'N/A', 
        eta: null,
        plannedRoute: null,
        actualRoute: null,
        service: null,
        account: null,
        pickup: null,
        pickupDate: null,
        flight: null,
        pax: null
    };

    return {
      id: `VEH-${index + 1}`,
      callsign: `${driver.make.toUpperCase().substring(0,4)}-${String(index + 1).padStart(2, '0')}`,
      licensePlate: driver.vehicleRegNum,
      vehicleType: driver.vehicleType,
      make: driver.make,
      model: driver.model,
      capacity: driver.capacity,
      status: job.id && job.status !== 'Completed' ? 'On Duty' : (driver.dutyStartTime ? 'Idle' : 'Offline'), 
      position: [24.7136 + (Math.random() - 0.5) * 0.2, 46.6753 + (Math.random() - 0.5) * 0.2],
      driver: {
        id: `DRV-${index + 1}`,
        name: driver.name,
        phone: driver.contactNumber,
        earnings: Math.floor(Math.random() * 500)
      },
      job: job,
      telemetry: {
        fuel: Math.floor(Math.random() * 60) + 40,
        battery: Math.floor(Math.random() * 20) + 80,
      }
    };
  });
};


type VehicleJobState = {
  vehicles: Vehicle[];
  setVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  assignJobToVehicle: (vehicleId: string, jobToAssign?: Job | null) => string | null;
};


export const useVehicleJobStore = create<VehicleJobState>((set, get) => {
    
  const initialDrivers = useDriverStore.getState().driverGridData;
  const initialState = {
    vehicles: generateVehicles(initialDrivers),
  };

  // Subscribe to the driver store to update vehicles when driver data changes.
  // This ensures all components using useVehicleJobStore get updated data.
  useDriverStore.subscribe((state) => {
    set({ vehicles: generateVehicles(state.driverGridData) });
  });

  return {
    ...initialState,
    setVehicleStatus: (vehicleId, status) => {
        set((state) => ({
            vehicles: state.vehicles.map(v => 
                v.id === vehicleId ? { ...v, status } : v
            )
        }));
    },
    assignJobToVehicle: (vehicleId: string, jobToAssign) => {
        if (!jobToAssign) return null;

        const newJob: VehicleJob = {
            id: jobToAssign.id,
            status: "Received",
            service: jobToAssign.vehicleType,
            account: jobToAssign.customerName || "N/A",
            pickup: jobToAssign.from,
            pickupDate: format(new Date(), 'dd/MM/yyyy HH:mm'),
            bookingTime: new Date().toISOString(),
            flight: null,
            pax: jobToAssign.title,
            distance: 0,
            dwellTime: '0m',
            eta: '15 minutes',
            plannedRoute: [],
            actualRoute: [],
        };
        
        set((state) => ({
            vehicles: state.vehicles.map(v => {
                if (v.id === vehicleId) {
                    return { ...v, job: newJob, status: 'On Duty' };
                }
                return v;
            })
        }));
        
        return newJob.id;
    }
  };
});
