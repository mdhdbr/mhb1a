

import type { Page, Activity, Booking, Break, Incident } from '@/lib/types';
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
export const allPages: Page[] = [
    // Core Operations
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/fleet-tracking', label: 'Fleet Tracking', icon: Map },
    { href: '/dashboard/tracking', label: 'Tracking', icon: Tractor },
    { href: '/dashboard/awaiting-allocation', label: 'Awaiting Allocation', icon: Route },
    { href: '/dashboard/manual-dispatch', label: 'Manual Dispatch', icon: Send },
    { href: '/dashboard/continuous-scheduler', label: 'Continuous Scheduler', icon: Clock },
    { href: '/dashboard/inprogress', label: 'In-progress', icon: Briefcase },

    // Data Management
    { href: '/dashboard/fleet', label: 'Fleet', icon: Truck },
    { href: '/dashboard/pilots', label: 'Pilots', icon: Users },
    { href: '/dashboard/drivers', label: 'Drivers', icon: Users },
    { href: '/dashboard/data', label: 'Data', icon: Database },
    { href: '/dashboard/customer-data', label: 'Customer Data', icon: Building },

    // Financial & Reporting
    { href: '/dashboard/invoice', label: 'Invoice', icon: FileDigit, adminOnly: true },
    { href: '/dashboard/pricing', label: 'Pricing', icon: DollarSign, adminOnly: true },
    
    // Safety & Communication
    { href: '/dashboard/sms', label: 'Communications', icon: MessageSquare },
    { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },

    // System
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];
    
// The following mock data is kept for components that are not yet connected to live data sources.
// It will be progressively phased out.

export const incidentData: Incident[] = [
    { id: 'INC-001', type: 'Accident', position: [24.73, 46.69], description: 'Minor collision reported.'},
    { id: 'INC-002', type: 'Road Closure', position: [21.49, 39.25], description: 'Street closed for construction.'}
];

export const activityReportData: Activity[] = [
    { id: '1', startTime: '12:00', endTime: '13:00', duration: '1h 0m', status: 'Online' },
    { id: '2', startTime: '13:00', endTime: '14:00', duration: '1h 0m', status: 'Online' },
    { id: '3', startTime: '15:00', endTime: '15:12', duration: '12m', status: 'Online' },
    { id: '4', startTime: '15:13', endTime: '16:00', duration: '47m', status: 'Online' },
    { id: '5', startTime: '16:00', endTime: '17:00', duration: '1h 0m', status: 'On Trip' },
    { id: '6', startTime: '17:00', endTime: '18:00', duration: '1h 0m', status: 'Offline' },
];

export const bookingExample: Booking = {
    startTime: '15:12',
    endTime: '15:13',
    bookingNumber: '120392',
    client: 'Carrot Cars',
    pickupLocation: 'Blake House Admirals Way, London, E14 9UJ',
    dropoffLocation: '40 Schooner Close, London, E14 3GG'
};

export const breakExample: Break = {
    startTime: '14:00',
    endTime: '14:30',
    duration: '30 min',
    driverCallsign: 'DRV-03'
};

