

import type { LatLngExpression } from 'leaflet';
import { type LucideIcon } from 'lucide-react';

export interface Page {
    href?: string;
    label: string;
    icon: LucideIcon;
    adminOnly?: boolean;
    children?: Page[];
}

export type JobCreator = {
  uid: string;
  name: string;
  employeeId?: string;
};

export type Job = {
  id: string;
  title: string;
  from: string;
  to:string;
  pickupCoordinates: { lat: number; lng: number };
  vehicleType: 'Truck' | 'Van' | 'Car';
  status: 'Awaiting' | 'In Progress' | 'Completed';
  requirements: {
    location: string;
    vehicleType: string;
    licenseValidity: boolean;
    insuranceValidity: boolean;
  };
  createdBy: JobCreator;
  createdAt?: string; // ISO 8601 string format
  bookingTime?: string; // ISO 8601 string for scheduled time
  customerName?: string;
  paymentMethod?: 'Invoice' | 'Card' | 'Cash';
  paymentStatus?: 'Paid' | 'Unpaid';
};

export type Driver = {
  driverId: string;
  name: string;
  phone?: string;
  location: string;
  vehicleType: string;
  licenseValid: boolean;
  insuranceValid: boolean;
  status: 'Available' | 'On Job' | 'Offline';
  fatigueLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tripsCompleted: number;
};

export type SummaryData = {
  totalVehicles: number;
  unreadMessages: number;
  activeTrips: number;
  idleDrivers: number;
  criticalAlerts: number;
};

export type ChartData = {
  name: string;
  value: number;
}[];

export type VehicleJob = {
    id: string | null;
    status: string;
    service: string | null;
    account: string | null;
    pickup: string | null;
    pickupDate: string | null;
    bookingTime?: string; // ISO 8601 string for scheduled time
    flight: string | null;
    pax: string | null;
    distance: number;
    dwellTime: string;
    eta: string | null;
    plannedRoute: LatLngExpression[] | null;
    actualRoute: LatLngExpression[] | null;
    trip?: {
        id: number;
        status: string;
        jobs: string[];
    }
};

export type Vehicle = {
  id: string;
  callsign: string;
  licensePlate: string;
  vehicleType: string;
  make: string;
  model: string;
  capacity: string;
  status: 'On Duty' | 'Idle' | 'Maintenance' | 'Offline' | 'On Break';
  position: LatLngExpression;
  driver: {
    id: string;
    name: string;
    phone: string;
    earnings: number;
  };
  job: VehicleJob;
  telemetry: {
    fuel: number; // percentage
    battery: number; // percentage
  };
  breakInfo?: {
    startTime: string;
    endTime: string;
  };
};

export type VehicleResult = {
    id: string;
    callsign: string;
    status: 'Empty for' | 'On Job' | 'On Break' | 'Offline' | string;
    statusDuration: string;
    vehicleType: string;
    shiftEnd: string;
    shiftDuration: string;
    isShiftEndingSoon: boolean;
    earnings: string;
    speed: string;
    isOverSpeeding: boolean;
    gpsStatus: 'ok' | 'unavailable';
    gpsUnavailableTime?: string;
    batteryLevel: number;
    fuelLevel: number;
    isSuspended: boolean;
    suspensionTime?: string;
    driverName: string;
    driverPhone?: string;
    description: string;
    address: string;
    licensePlate: string;
    extras: string[];
};

export type Incident = {
    id: string;
    type: 'Accident' | 'Road Closure' | 'Police Activity';
    position: LatLngExpression;
    description: string;
};

export type Activity = {
    id: string;
    startTime: string;
    endTime: string;
    duration: string;
    status: 'Online' | 'On Trip' | 'Offline';
};

export type Booking = {
    startTime: string;
    endTime: string;
    bookingNumber: string;
    client: string;
    pickupLocation: string;
    dropoffLocation: string;
};

export type Break = {
    startTime: string;
    endTime: string;
    duration: string;
    driverCallsign: string;
};

export type VehicleBrowserEntry = {
    regNumber: string;
    depot: string;
    driverCallsign: string;
    make: string;
    model: string;
    type: 'Executive' | 'Saloon';
    status: 'Current';
    description: string;
    imei: string;
};

export type VehicleModel = {
    make: string;
    modelName: string;
    status: 'Current' | 'On hold' | 'Deleted';
    type: string;
    serviceInterval: string;
    seats: number;
    fuelType: 'Hybrid' | 'Diesel' | 'Petrol' | 'Electric';
};

export type VehicleMake = {
    name: string;
    status: 'Current' | 'On hold' | 'Deleted';
};

export type DriverData = {
    name: string;
    contactNumber: string;
    dlNo: string;
    dlExpiry: string;
    allowedVehicles: string;
    vehicleRegNum: string;
    vehicleType: string;
    make: string;
    model: string;
    capacity: string;
    insuranceExpiry: string;
    lastFC: string;
    fcExpiry: string;
    permit: string;
    puccExpiry: string;
};

export type IncidentReportData = {
    id: string;
    incidentDate: string;
    incidentTime: string;
    location: string;
    vehicleInvolved: string;
    driverInvolved: string;
    incidentType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    photos: File[];
};

export type Rate = {
    id: string;
    vehicleType: string;
    category: 'passenger' | 'shipper' | 'equipment';
    percentPer: number;
    rate: number;
    vatPercent: number;
    vatAmount: number;
    damages: number;
    handling: number;
    waiting: number;
    halting: number;
};

export type UserProfile = {
  id: string;
  name?: string; // Add name for getInitials compatibility
  role?: 'admin' | 'agent' | 'driver' | 'user';
  firstName?: string;
  lastName?: string;
  email?: string;
  twoFactorSecret?: string; // Encrypted secret
  twoFactorEnabled?: boolean;
  avatar?: string;
  status?: 'online' | 'offline';
  lastSeen?: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  allowedPages?: string[];
};

export type ChatContact = {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline';
    lastMessage: string;
    lastMessageTime: string;
    type?: 'Admin' | 'Agent' | 'Driver' | 'Customer' | 'User';
    unreadCount?: number;
};

export type ChatMessage = {
    id: string;
    text: string;
    timestamp: string;
    sender: 'currentUser' | 'otherUser' | 'otherAgent';
    initials: string;
};

export type FatigueEvent = {
  id: string;
  driverId: string;
  driverName: string;
  fatigueLevel: "low" | "medium" | "high" | "critical";
  score: number;
  source: "driver_app" | "control_panel";
  createdAt: any; // Firestore Timestamp
};
