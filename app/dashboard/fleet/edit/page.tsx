import type { Activity, Booking, Break, Incident, Job, Driver, SummaryData, ChartData, Vehicle, VehicleResult, VehicleBrowserEntry, VehicleModel, VehicleMake, DriverData } from './types';
import {
    LayoutDashboard,
    Tractor,
    Users,
    Database,
    Bell,
    Send,
    Briefcase,
    FileText,
    AlertTriangle,
    FileDigit,
    DollarSign,
    LifeBuoy,
    Settings,
    Route,
    MessageSquare,
    Truck,
    Car,
    Building,
    Map,
    MapPin,
    Wrench,
    Clock,
    Plane,
  } from 'lucide-react';


// This navigation array is the single source of truth for the sidebar.
// Moved to src/lib/data.ts

// The following mock data is kept for components that are not yet connected to live data sources.
// It will be progressively phased out.

const incidentData: Incident[] = [
    { id: 'INC-001', type: 'Accident', position: [24.73, 46.69], description: 'Minor collision reported.'},
    { id: 'INC-002', type: 'Road Closure', position: [21.49, 39.25], description: 'Street closed for construction.'}
];

const activityReportData: Activity[] = [
    { id: '1', startTime: '12:00', endTime: '13:00', duration: '1h 0m', status: 'Online' },
    { id: '2', startTime: '13:00', endTime: '14:00', duration: '1h 0m', status: 'Online' },
    { id: '3', startTime: '15:00', endTime: '15:12', duration: '12m', status: 'Online' },
    { id: '4', startTime: '15:13', endTime: '16:00', duration: '47m', status: 'Online' },
    { id: '5', startTime: '16:00', endTime: '17:00', duration: '1h 0m', status: 'On Trip' },
    { id: '6', startTime: '17:00', endTime: '18:00', duration: '1h 0m', status: 'Offline' },
];

const bookingExample: Booking = {
    startTime: '15:12',
    endTime: '15:13',
    bookingNumber: '120392',
    client: 'Carrot Cars',
    pickupLocation: 'Blake House Admirals Way, London, E14 9UJ',
    dropoffLocation: '40 Schooner Close, London, E14 3GG'
};

const breakExample: Break = {
    startTime: '14:00',
    endTime: '14:30',
    duration: '30 min',
    driverCallsign: 'DRV-03'
};

export default function FleetEditPage() {
  return <div>Fleet Edit Page - Coming Soon</div>;
}