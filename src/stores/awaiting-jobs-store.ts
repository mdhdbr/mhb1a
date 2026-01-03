
import { create } from 'zustand';
import type { Job } from '@/lib/types';

const initialAwaitingJobs: Job[] = [
    {
    id: 'JOB-MANUAL-1',
    title: 'Manual Dispatch - Executive',
    from: 'Ritz-Carlton, Riyadh',
    to: 'King Salman Park',
    pickupCoordinates: { lat: 24.685, lng: 46.696 },
    vehicleType: 'Car',
    status: 'Awaiting',
    createdBy: { uid: 'fHHF0vDosiMaC5ZcMLi6oDgroFR2', name: 'Admin User' },
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    customerName: 'Innovate LLC',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Riyadh',
      vehicleType: 'PREMIUM SEDAN',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
  {
    id: 'JOB-CUST-PAX-1',
    title: 'Passenger Ride: SUV',
    from: 'Kingdom Centre',
    to: 'King Khalid International Airport',
    pickupCoordinates: { lat: 24.711, lng: 46.674 },
    vehicleType: 'Car',
    status: 'Awaiting',
    createdBy: { uid: 'cust-pax-123', name: 'Pax (501234568)' },
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    customerName: 'Future Ventures',
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    requirements: {
      location: 'Riyadh',
      vehicleType: 'SUV',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
   {
    id: 'JOB-204',
    title: 'Staff Shuttle Service',
    from: 'Olaya Towers',
    to: 'Community Compound',
    pickupCoordinates: { lat: 24.708, lng: 46.683 },
    vehicleType: 'Van',
    status: 'Awaiting',
    createdBy: { uid: 'system-auto', name: 'System' },
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    customerName: 'Tech Solutions Inc.',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Riyadh',
      vehicleType: 'MINI BUS',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
  {
    id: 'JOB-201',
    title: 'Urgent Document Courier',
    from: 'Riyadh Financial District',
    to: 'Dammam Industrial City',
    pickupCoordinates: { lat: 24.774, lng: 46.628 },
    vehicleType: 'Car',
    status: 'Awaiting',
    createdBy: { uid: 'system-auto', name: 'System' },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    customerName: 'Global Petro Services',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Riyadh',
      vehicleType: 'SEDAN',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
    {
    id: 'JOB-205',
    title: 'Oversized Cargo Transport',
    from: 'Jubail Industrial City',
    to: 'Riyadh Logistics Hub',
    pickupCoordinates: { lat: 27.086, lng: 49.563 },
    vehicleType: 'Truck',
    status: 'Awaiting',
    createdBy: { uid: 'system-auto', name: 'System' },
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    customerName: 'Saudi Logistics',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Jubail',
      vehicleType: 'FLATBED',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
  {
    id: 'JOB-202',
    title: 'Heavy Machinery Transport',
    from: 'Jubail Port',
    to: 'NEOM Project Site',
    pickupCoordinates: { lat: 27.017, lng: 49.667 },
    vehicleType: 'Truck',
    status: 'Awaiting',
    createdBy: { uid: 'system-auto', name: 'System' },
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    customerName: 'Modern Industries',
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    requirements: {
      location: 'Jubail',
      vehicleType: 'TRUCK 15T',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
  {
    id: 'JOB-CUST-SHIP-1',
    title: 'Construction Materials',
    from: 'Dammam Industrial City',
    to: 'Riyadh Site Office',
    pickupCoordinates: { lat: 26.301, lng: 49.972 },
    vehicleType: 'Truck',
    status: 'Awaiting',
    createdBy: { uid: 'cust-ship-456', name: 'Shipper (558765432)' },
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    customerName: 'Saudi Logistics',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Dammam',
      vehicleType: 'TRUCK 10T',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
   {
    id: 'JOB-206',
    title: 'Warehouse Material Handling',
    from: 'Logistics Village, Shed 4',
    to: 'Logistics Village, Shed 9',
    pickupCoordinates: { lat: 24.873, lng: 46.829 },
    vehicleType: 'Van', // Forklift is more of equipment, but fits Van category
    status: 'Awaiting',
    createdBy: { uid: 'system-auto', name: 'System' },
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    customerName: 'Modern Industries',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Riyadh',
      vehicleType: 'FORKLIFT',
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
  {
    id: 'JOB-203',
    title: 'Perishable Goods Delivery',
    from: 'Al-Ahsa Farms',
    to: 'Jeddah Central Market',
    pickupCoordinates: { lat: 25.383, lng: 49.583 },
    vehicleType: 'Van',
    status: 'Awaiting',
    createdBy: { uid: 'system-auto', name: 'System' },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    customerName: 'Riyadh Foods Co.',
    paymentMethod: 'Invoice',
    paymentStatus: 'Unpaid',
    requirements: {
      location: 'Al-Ahsa',
      vehicleType: 'TRUCK 3T', // Assuming refrigerated truck
      licenseValidity: true,
      insuranceValidity: true,
    },
  },
];

type AwaitingJobsState = {
  awaitingJobs: Job[];
};

type AwaitingJobsActions = {
  assignJob: (jobId: string) => void;
  addAwaitingJob: (job: Job) => void;
};

export const useAwaitingJobsStore = create<AwaitingJobsState & AwaitingJobsActions>((set) => ({
  awaitingJobs: initialAwaitingJobs,
  assignJob: (jobId) =>
    set((state) => ({
      awaitingJobs: state.awaitingJobs.filter((job) => job.id !== jobId),
    })),
  addAwaitingJob: (job) =>
    set((state) => ({
        awaitingJobs: [job, ...state.awaitingJobs],
    })),
}));
