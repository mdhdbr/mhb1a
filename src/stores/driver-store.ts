
import { create } from 'zustand';
import type { DriverData, FatigueEvent } from '@/lib/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export type StoredDriverData = DriverData & {
    dutyStartTime?: number | null;
    status: 'On Duty' | 'Offline';
};

type FatigueSummary = {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
};

type FatigueState = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;

type DriverState = {
  driverGridData: StoredDriverData[];
  fatigueSummary: FatigueSummary;
  isLoading: boolean;
  getFatigueLevel: (dutyStartTime: number | null | undefined) => FatigueState;
};

type DriverActions = {
  addDriver: (driver: DriverData) => void;
  removeDrivers: (dlNos: string[]) => void;
  setDutyStartTime: (dlNo: string, time: number | null) => void;
  _updateFatigueData: () => void;
};

// This is the single, canonical function for determining fatigue level.
const getFatigueLevel = (dutyStartTime: number | null | undefined): FatigueState => {
    if (!dutyStartTime) return null;
    const dutyHours = (Date.now() - dutyStartTime) / (1000 * 60 * 60);

    if (dutyHours > 12) return 'CRITICAL';
    if (dutyHours > 8) return 'HIGH';
    if (dutyHours > 6) return 'MEDIUM';
    return 'LOW';
};

// This is the single, canonical function for calculating the summary.
const calculateFatigueSummary = (drivers: StoredDriverData[]): FatigueSummary => {
    const summary: FatigueSummary = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    drivers.forEach(driver => {
        const level = getFatigueLevel(driver.dutyStartTime);
        if (level) {
            summary[level]++;
        }
    });
    return summary;
};

const driverBaseData: DriverData[] = [
    { name: 'Ali Ahmed', contactNumber: '+966 50 123 4567', dlNo: 'D12345678', dlExpiry: '2025-12-31', allowedVehicles: 'Truck, Van', vehicleRegNum: 'SA-12345', vehicleType: 'TRUCK 15T', make: 'Volvo', model: 'FH16', capacity: '15T', insuranceExpiry: '2025-11-30', lastFC: '2024-06-01', fcExpiry: '2025-06-01', permit: 'National', puccExpiry: '2024-12-01' },
    { name: 'Fatima Khan', contactNumber: '+966 55 987 6543', dlNo: 'D87654321', dlExpiry: '2026-05-20', allowedVehicles: 'Saloon', vehicleRegNum: 'SA-67890', vehicleType: 'SEDAN', make: 'Toyota', model: 'Camry', capacity: '5 Seats', insuranceExpiry: '2025-04-15', lastFC: '2024-03-10', fcExpiry: '2025-03-10', permit: 'City', puccExpiry: '2024-09-10' },
    { name: 'Hassan Ibrahim', contactNumber: '+966 53 210 9876', dlNo: 'D24681357', dlExpiry: '2024-10-10', allowedVehicles: 'Van, Estate', vehicleRegNum: 'SA-24680', vehicleType: 'MPV', make: 'Ford', model: 'Transit', capacity: '7 Seats', insuranceExpiry: '2025-09-01', lastFC: '2024-08-15', fcExpiry: '2025-08-15', permit: 'Regional', puccExpiry: '2025-02-15' },
    { name: 'David Chen', contactNumber: '+966 51 555 1234', dlNo: 'D98765432', dlExpiry: '2027-01-15', allowedVehicles: 'Truck', vehicleRegNum: 'SA-54321', vehicleType: 'TRAILER', make: 'Mercedes-Benz', model: 'Actros', capacity: 'Trailer', insuranceExpiry: '2026-01-01', lastFC: '2024-07-01', fcExpiry: '2025-07-01', permit: 'National', puccExpiry: '2025-01-01' },
    { name: 'Aisha Lima', contactNumber: '+966 52 444 5678', dlNo: 'D11223344', dlExpiry: '2025-08-30', allowedVehicles: 'SUV, Saloon', vehicleRegNum: 'SA-11223', vehicleType: 'SUV', make: 'Chevrolet', model: 'Tahoe', capacity: '8 Seats', insuranceExpiry: '2025-08-01', lastFC: '2024-02-01', fcExpiry: '2025-02-01', permit: 'City', puccExpiry: '2024-08-01' },
    { name: 'Mohammed Singh', contactNumber: '+966 59 888 7777', dlNo: 'D55667788', dlExpiry: '2028-04-22', allowedVehicles: 'Truck', vehicleRegNum: 'SA-55667', vehicleType: 'FLATBED', make: 'Scania', model: 'R-series', capacity: 'Flat bed', insuranceExpiry: '2026-03-15', lastFC: '2024-09-20', fcExpiry: '2025-09-20', permit: 'GCC', puccExpiry: '2025-03-20' },
];

const generateInitialData = (): StoredDriverData[] => {
    return driverBaseData.map((driver, index) => {
        let dutyStartTime: number | null = null;
        // Assign duty start times to most drivers, but leave some offline.
        if (Math.random() > 0.2) { 
            // Generate a random number of hours ago between 1 and 14.
            const hoursAgo = Math.random() * 13 + 1;
            dutyStartTime = Date.now() - hoursAgo * 60 * 60 * 1000;
        }
        return {
            ...driver,
            dutyStartTime,
            status: dutyStartTime ? 'On Duty' : 'Offline',
        };
    });
};

const initialData = generateInitialData();


export const useDriverStore = create<DriverState & DriverActions>((set, get) => {
    const store = {
        driverGridData: initialData,
        fatigueSummary: calculateFatigueSummary(initialData),
        isLoading: false,
        getFatigueLevel: getFatigueLevel,
        addDriver: (driver: DriverData) => {
            const newDriverGridData = [{ ...driver, dutyStartTime: null, status: 'Offline' as const }, ...get().driverGridData];
            set({
                driverGridData: newDriverGridData,
                fatigueSummary: calculateFatigueSummary(newDriverGridData),
            });
        },
        removeDrivers: (dlNos: string[]) => {
            const newDriverGridData = get().driverGridData.filter(
                (driver) => !dlNos.includes(driver.dlNo)
            );
            set({
                driverGridData: newDriverGridData,
                fatigueSummary: calculateFatigueSummary(newDriverGridData),
            });
        },
        setDutyStartTime: (dlNo: string, time: number | null) => {
            const newDriverGridData = get().driverGridData.map(driver =>
                driver.dlNo === dlNo ? { ...driver, dutyStartTime: time, status: time ? 'On Duty' : 'Offline' } : driver
            );
            set({
                driverGridData: newDriverGridData,
                fatigueSummary: calculateFatigueSummary(newDriverGridData),
            });
        },
        _updateFatigueData: () => {
            const drivers = get().driverGridData;
            set({
                fatigueSummary: calculateFatigueSummary(drivers),
            });
        }
    };

    // Set up a timer to periodically update fatigue data to simulate live changes
    setInterval(() => {
        store._updateFatigueData();
    }, 60000); // Update every minute

    return store;
});
