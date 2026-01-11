

import type { Job, Driver, SummaryData, ChartData, Vehicle, Incident, VehicleResult, Page, Activity, Booking, Break, VehicleBrowserEntry, VehicleModel, VehicleMake, DriverData } from './types';
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
  } from 'lucide-react';


export const summaryData: SummaryData = {
  totalVehicles: 500,
  unreadMessages: 12,
  activeTrips: 45,
  idleDrivers: 8,
  criticalAlerts: 2,
};

export const fleetCompositionData: ChartData = [
  { name: 'SUV', value: 120 },
  { name: 'SEDAN', value: 85 },
  { name: 'PREMIUM_SEDAN', value: 45 },
  { name: 'TRUCK_5T', value: 65 },
  { name: 'MINI_BUS', value: 35 },
  { name: 'TRUCK_10T', value: 40 },
  { name: 'LUXURY_CAR', value: 25 },
  { name: 'FORKLIFT', value: 15 },
  { name: 'LIGHT_BUS', value: 30 },
  { name: 'TRUCK_15T', value: 20 },
  { name: 'MPV', value: 18 },
  { name: 'HEAVY_BUS', value: 12 },
  { name: 'FLATBED', value: 10 },
];

export const driverFatigueData: ChartData = [
  { name: 'LOW', value: 53 },
  { name: 'MEDIUM', value: 20 },
  { name: 'HIGH', value: 20 },
  { name: 'CRITICAL', value: 7 },
];

export const awaitingJobsData: Job[] = [
  {
    id: 'JOB-001',
    title: 'Electronics Delivery',
    from: 'Warehouse A, NYC',
    to: 'Retail Store, NYC',
    pickupCoordinates: { lat: 40.7128, lng: -74.0060 },
    vehicleType: 'Van',
    status: 'Awaiting',
    requirements: {
      location: 'NYC',
      vehicleType: 'Van',
      licenseValidity: true,
      insuranceValidity: true,
    },
    createdBy: { uid: 'system', name: 'System' },
  },
  {
    id: 'JOB-002',
    title: 'Long-Haul Freight',
    from: 'Port of LA, CA',
    to: 'Distribution Center, AZ',
    pickupCoordinates: { lat: 33.7361, lng: -118.2626 },
    vehicleType: 'Truck',
    status: 'Awaiting',
    requirements: {
      location: 'CA',
      vehicleType: 'Truck',
      licenseValidity: true,
      insuranceValidity: true,
    },
    createdBy: { uid: 'system', name: 'System' },
  },
  {
    id: 'JOB-003',
    title: 'Local Courier',
    from: 'Downtown Chicago, IL',
    to: 'Suburbs, IL',
    pickupCoordinates: { lat: 41.8781, lng: -87.6298 },
    vehicleType: 'Car',
    status: 'Awaiting',
    requirements: {
      location: 'IL',
      vehicleType: 'Car',
      licenseValidity: true,
      insuranceValidity: true,
    },
    createdBy: { uid: 'system', name: 'System' },
  },
];

export const availableDriversData: Driver[] = [
    { driverId: 'DRV-101', name: 'Mohamed Hameed Buhari', phone: '+12125550101', location: 'NYC', vehicleType: 'Van', licenseValid: true, insuranceValid: true, status: 'Available', fatigueLevel: 'LOW', tripsCompleted: 2 },
    { driverId: 'DRV-102', name: 'Peter Jones', phone: '+12125550102', location: 'NYC', vehicleType: 'Car', licenseValid: true, insuranceValid: false, status: 'On Job', fatigueLevel: 'MEDIUM', tripsCompleted: 5 },
    { driverId: 'DRV-103', name: 'Mary Smith', phone: '+12125550103', location: 'NYC', vehicleType: 'Van', licenseValid: true, insuranceValid: true, status: 'Available', fatigueLevel: 'LOW', tripsCompleted: 1 },
    { driverId: 'DRV-201', name: 'Sue Green', phone: '+13105550111', location: 'CA', vehicleType: 'Truck', licenseValid: true, insuranceValid: true, status: 'Available', fatigueLevel: 'HIGH', tripsCompleted: 8 },
    { driverId: 'DRV-202', name: 'Mike Brown', phone: '+13105550112', location: 'CA', vehicleType: 'Truck', licenseValid: false, insuranceValid: true, status: 'Available', fatigueLevel: 'LOW', tripsCompleted: 4 },
    { driverId: 'DRV-301', name: 'Chris White', phone: '+13125550121', location: 'IL', vehicleType: 'Car', licenseValid: true, insuranceValid: true, status: 'Available', fatigueLevel: 'MEDIUM', tripsCompleted: 3 },
    { driverId: 'DRV-302', name: 'Pat Black', phone: '+13125550122', location: 'IL', vehicleType: 'Van', licenseValid: true, insuranceValid: true, status: 'On Job', fatigueLevel: 'LOW', tripsCompleted: 6 },
    { driverId: 'DRV-303', name: 'Alex Blue', phone: '+13125550123', location: 'IL', vehicleType: 'Car', licenseValid: true, insuranceValid: true, status: 'Available', fatigueLevel: 'CRITICAL', tripsCompleted: 9 },
];

export const vehiclesData: Vehicle[] = [
    {
      id: 'VEH-001',
      callsign: 'TRUCK-01',
      licensePlate: 'SA-12345',
      vehicleType: 'Heavy Truck',
      make: 'Volvo',
      model: 'FH16',
      capacity: '15T',
      status: 'On Duty',
      position: [24.7136, 46.6753], // Riyadh
      driver: { id: 'ARC', name: 'Ali Ahmed', phone: '+966 50 123 4567', earnings: 850.75 },
      job: { 
        id: '2448727', 
        status: 'Completed',
        service: 'Car',
        account: 'Registered Customer (Normal)',
        pickup: 'King Khalid Airport',
        pickupDate: '11/01/2026 08:25',
        flight: 'SV101',
        pax: '3 PAX',
        distance: 125, 
        dwellTime: '15m', 
        eta: '48 minutes', 
        plannedRoute: [[24.7136, 46.6753], [24.80, 46.73], [24.85, 46.76]],
        actualRoute: [[24.7136, 46.6753], [24.74, 46.69], [24.76, 46.71]],
        trip: {
            id: 2,
            status: 'Completed',
            jobs: ['961722', '961723'],
        },
      },
      telemetry: { fuel: 78, battery: 95 },
    },
    {
      id: 'VEH-002',
      callsign: 'SEDAN-05',
      licensePlate: 'SA-67890',
      vehicleType: 'Saloon',
      make: 'Toyota',
      model: 'Camry',
      capacity: '5 Seats',
      status: 'Idle',
      position: [21.3891, 39.8579], // Jeddah
      driver: { id: 'DRV-02', name: 'Fatima Khan', phone: '+966 55 987 6543', earnings: 320.00 },
      job: { id: null, status: 'Empty', distance: 0, dwellTime: '3h 45m', eta: null, plannedRoute: null, actualRoute: null, service: null, account: null, pickup: null, pickupDate: null, flight: null, pax: null },
      telemetry: { fuel: 92, battery: 100 },
    },
    {
        id: 'VEH-003',
        callsign: 'VAN-02',
        licensePlate: 'SA-24680',
        vehicleType: 'Van',
        make: 'Ford',
        model: 'Transit',
        capacity: '7 Seats',
        status: 'On Break',
        position: [26.4207, 50.0888], // Dammam
        driver: { id: 'DRV-03', name: 'Hassan Ibrahim', phone: '+966 53 210 9876', earnings: 610.50 },
        job: { 
            id: 'JOB-124', 
            status: 'At Drop-off Location', 
            distance: 340, 
            dwellTime: '5m', 
            eta: 'Now', 
            plannedRoute: [[26.3, 50.0], [26.35, 50.05], [26.4207, 50.0888]],
            actualRoute: [[26.3, 50.0], [26.35, 50.05], [26.4207, 50.0888]],
            service: 'Delivery',
            account: 'Corporate Cargo',
            pickup: 'Dammam Port',
            pickupDate: '11/01/2026 14:00',
            flight: null,
            pax: null
        },
        telemetry: { fuel: 45, battery: 88 },
        breakInfo: {
            startTime: "17:33",
            endTime: "18:00"
        }
    },
    {
        id: 'VEH-004',
        callsign: 'SUV-03',
        licensePlate: 'SA-13579',
        vehicleType: 'SUV',
        make: 'Chevrolet',
        model: 'Tahoe',
        capacity: '8 Seats',
        status: 'Offline',
        position: [24.774265, 46.738586], // Riyadh
        driver: { id: 'DRV-04', name: 'Nour Abdullah', phone: '+966 54 876 5432', earnings: 0 },
        job: { id: null, status: 'Received', distance: 210, dwellTime: 'N/A', eta: null, plannedRoute: null, actualRoute: null, service: null, account: null, pickup: null, pickupDate: null, flight: null, pax: null },
        telemetry: { fuel: 60, battery: 98 },
    },
    {
        id: 'VEH-005',
        callsign: 'TRUCK-08',
        licensePlate: 'SA-97531',
        vehicleType: 'Coach',
        make: 'Mercedes-Benz',
        model: 'Actros',
        capacity: '50 Seats',
        status: 'Maintenance',
        position: [21.4958, 39.2925], // Jeddah
        driver: { id: 'DRV-05', name: 'Khalid Omar', phone: '+966 56 111 2222', earnings: 125.00 },
        job: { id: null, status: 'Accepted', distance: 0, dwellTime: '2d 5h', eta: null, plannedRoute: null, actualRoute: null, service: null, account: null, pickup: null, pickupDate: null, flight: null, pax: null },
        telemetry: { fuel: 30, battery: 75 },
    },
     {
      id: 'VEH-006',
      callsign: 'KING-1',
      licensePlate: 'KSA-0001',
      vehicleType: 'Executive',
      make: 'Rolls Royce',
      model: 'Phantom',
      capacity: '4 Seats',
      status: 'On Duty',
      position: [24.8, 46.7], // Riyadh
      driver: { id: 'DRV-06', name: 'Yusuf Al-Malik', phone: '+966 59 999 9999', earnings: 2500.00 },
      job: { 
        id: 'VIP-001', 
        status: 'Arrived', 
        service: 'VVIP',
        account: 'Royal Court',
        pickup: 'King Khalid Airport',
        pickupDate: '11/01/2026 10:00',
        flight: 'SV101',
        pax: '1PAX',
        distance: 50, 
        dwellTime: '2m', 
        eta: '15 minutes', 
        plannedRoute: [[24.957, 46.699], [24.8, 46.7]],
        actualRoute: [[24.957, 46.699], [24.88, 46.7]]
      },
      telemetry: { fuel: 85, battery: 99 },
    },
];

export const incidentData: Incident[] = [
    { id: 'INC-001', type: 'Accident', position: [24.73, 46.69], description: 'Minor collision reported.'},
    { id: 'INC-002', type: 'Road Closure', position: [21.49, 39.25], description: 'Street closed for construction.'}
];

export const allPages: Page[] = [
    // Core Operations
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/fleet-tracking', label: 'Fleet Tracking', icon: Map },
    { href: '/dashboard/tracking', label: 'Tracking', icon: Tractor },
    { href: '/dashboard/awaiting-allocation', label: 'Awaiting Allocation', icon: Route },
    { href: '/dashboard/manual-dispatch', label: 'Manual Dispatch', icon: Send },
    { href: '/dashboard/location-picker', label: 'Location Picker', icon: MapPin, adminOnly: true },
    { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },

    // Data Management
    { href: '/dashboard/fleet', label: 'Fleet', icon: Truck },
    { href: '/dashboard/drivers', label: 'Drivers', icon: Users },
    { href: '/dashboard/data', label: 'Data', icon: Database },

    // Financial & Reporting
    { href: '/dashboard/reports', label: 'Reports', icon: FileText },
    { href: '/dashboard/invoice', label: 'Invoice', icon: FileDigit, adminOnly: true },
    { href: '/dashboard/pricing', label: 'Pricing', icon: DollarSign, adminOnly: true },
    
    // Safety & Communication
    { href: '/dashboard/incident-report', label: 'Incident Report', icon: AlertTriangle },
    { href: '/dashboard/sms', label: 'SMS', icon: MessageSquare },
    { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },

    // System
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

export const vehicleResultsData: VehicleResult[] = [
    { 
        id: '1',
        callsign: '174',
        status: 'Empty for',
        statusDuration: '54 min',
        vehicleType: 'ESTATE',
        shiftEnd: '16:00',
        shiftDuration: '6h 17m',
        isShiftEndingSoon: false,
        earnings: '£247.50',
        speed: '0 MPH',
        isOverSpeeding: false,
        gpsStatus: 'ok',
        batteryLevel: 90,
        fuelLevel: 70,
        isSuspended: false,
        driverName: 'Mohamed Hameed Buhari',
        driverPhone: '+44 7123 456789',
        description: 'White Toyota Corolla',
        address: '3 School Lane, Norwich, NR9 3',
        licensePlate: 'MJ73 XMF',
        extras: ['WiFi', 'Child Seat']
    },
    { 
        id: '2',
        callsign: '256',
        status: 'On Job',
        statusDuration: '1h 12m',
        vehicleType: 'MERCEDES E200-ESTATE',
        shiftEnd: '18:00',
        shiftDuration: '8h 0m',
        isShiftEndingSoon: true,
        earnings: '£312.80',
        speed: '55 MPH',
        isOverSpeeding: true,
        gpsStatus: 'ok',
        batteryLevel: 75,
        fuelLevel: 85,
        isSuspended: false,
        driverName: 'Peter Jones',
        driverPhone: '+44 7987 654321',
        description: 'Black Mercedes E200',
        address: '123 Main Street, London, SW1A 0AA',
        licensePlate: 'AB12 CDE',
        extras: []
    },
    { 
        id: '3',
        callsign: '311',
        status: 'On Break',
        statusDuration: '15 min',
        vehicleType: 'SALOON',
        shiftEnd: '20:00',
        shiftDuration: '9h 30m',
        isShiftEndingSoon: false,
        earnings: '£180.20',
        speed: '0 MPH',
        isOverSpeeding: false,
        gpsStatus: 'unavailable',
        gpsUnavailableTime: '3 min',
        batteryLevel: 82,
        fuelLevel: 25,
        isSuspended: true,
        suspensionTime: '25 minutes',
        driverName: 'Mary Smith',
        driverPhone: '+44 7555 123456',
        description: 'Silver Ford Mondeo',
        address: 'Garage 5, Industrial Estate, Manchester',
        licensePlate: 'XY78 ZAB',
        extras: ['Water Bottles']
    },
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

export const vehicleBrowserData: VehicleBrowserEntry[] = [
    { regNumber: '569', depot: 'Magenta [MT]', driverCallsign: '', make: 'BMW', model: '5 Series', type: 'Executive', status: 'Current', description: '', imei: '' },
    { regNumber: '787', depot: 'Magenta [MT]', driverCallsign: '', make: 'Mercedes', model: 'C-Class', type: 'Saloon', status: 'Current', description: '', imei: '' },
    { regNumber: '987', depot: 'Magenta [MT]', driverCallsign: '', make: 'Skoda', model: 'Octavia', type: 'Saloon', status: 'Current', description: 'Magenta Test', imei: '' },
    { regNumber: 'AK12 KUB', depot: 'Magenta [MT]', driverCallsign: '', make: 'Toyota', model: 'Prius', type: 'Saloon', status: 'Current', description: 'Black', imei: 'F781A55E' },
    { regNumber: 'TEST 001', depot: 'Magenta [MT]', driverCallsign: '', make: 'Toyota', model: 'Prius', type: 'Saloon', status: 'Current', description: '', imei: '' },
    { regNumber: 'TEST 06', depot: 'Magenta [MT]', driverCallsign: '', make: 'Ford', model: 'Mondeo', type: 'Saloon', status: 'Current', description: 'Test eve', imei: '' },
];

export const vehicleModelsData: VehicleModel[] = [
    { make: 'Ambulance', modelName: 'Ambulance', status: 'Current', type: 'Estate Ambulance', serviceInterval: '', seats: 1, fuelType: 'Hybrid' },
    { make: 'Volkswagen', modelName: 'Caddy', status: 'Current', type: 'WAV', serviceInterval: '11500', seats: 5, fuelType: 'Diesel' },
    { make: 'Toyota', modelName: 'Corolla Icon', status: 'Current', type: 'Green Car', serviceInterval: '', seats: 5, fuelType: 'Hybrid' },
    { make: 'Taxis', modelName: 'Excel', status: 'Current', type: 'Saloon', serviceInterval: '', seats: 1, fuelType: 'Hybrid' },
    { make: 'Taxis', modelName: 'FLEET CARS', status: 'Current', type: 'Saloon', serviceInterval: '', seats: 1, fuelType: 'Hybrid' },
    { make: 'Renault', modelName: 'Master', status: 'Current', type: 'Ambulance', serviceInterval: '11500', seats: 5, fuelType: 'Diesel' },
    { make: 'Training', modelName: 'Training', status: 'Current', type: 'Wheelchair', serviceInterval: '', seats: 5, fuelType: 'Hybrid' },
];

export const vehicleMakesData: VehicleMake[] = [
    { name: 'BMW', status: 'Current' },
    { name: 'Ford', status: 'Current' },
    { name: 'Mercedes-Benz', status: 'Current' },
    { name: 'Skoda', status: 'Deleted' },
    { name: 'Toyota', status: 'Current' },
    { name: 'Volkswagen', status: 'On hold' },
];

export const driverGridData: DriverData[] = [
    {
        name: 'Ali Ahmed',
        contactNumber: '+966 50 123 4567',
        dlNo: 'D12345678',
        dlExpiry: '2025-12-31',
        allowedVehicles: 'Truck, Van',
        vehicleRegNum: 'SA-12345',
        vehicleType: 'Heavy Truck',
        make: 'Volvo',
        model: 'FH16',
        capacity: '15T',
        insuranceExpiry: '2025-11-30',
        lastFC: '2024-06-01',
        fcExpiry: '2025-06-01',
        permit: 'National',
        puccExpiry: '2024-12-01',
    },
    {
        name: 'Fatima Khan',
        contactNumber: '+966 55 987 6543',
        dlNo: 'D87654321',
        dlExpiry: '2026-05-20',
        allowedVehicles: 'Saloon',
        vehicleRegNum: 'SA-67890',
        vehicleType: 'Saloon',
        make: 'Toyota',
        model: 'Camry',
        capacity: '5 Seats',
        insuranceExpiry: '2025-04-15',
        lastFC: '2024-03-10',
        fcExpiry: '2025-03-10',
        permit: 'City',
        puccExpiry: '2024-09-10',
    },
    {
        name: 'Hassan Ibrahim',
        contactNumber: '+966 53 210 9876',
        dlNo: 'D24681357',
        dlExpiry: '2024-10-10',
        allowedVehicles: 'Van, Estate',
        vehicleRegNum: 'SA-24680',
        vehicleType: 'Van',
        make: 'Ford',
        model: 'Transit',
        capacity: '7 Seats',
        insuranceExpiry: '2025-09-01',
        lastFC: '2024-08-15',
        fcExpiry: '2025-08-15',
        permit: 'Regional',
        puccExpiry: '2025-02-15',
    },
    {
        name: 'David Chen',
        contactNumber: '+966 51 555 1234',
        dlNo: 'D98765432',
        dlExpiry: '2027-01-15',
        allowedVehicles: 'Truck',
        vehicleRegNum: 'SA-54321',
        vehicleType: 'Heavy Truck',
        make: 'Mercedes-Benz',
        model: 'Actros',
        capacity: 'Trailer',
        insuranceExpiry: '2026-01-01',
        lastFC: '2024-07-01',
        fcExpiry: '2025-07-01',
        permit: 'National',
        puccExpiry: '2025-01-01',
    },
    {
        name: 'Aisha Lima',
        contactNumber: '+966 52 444 5678',
        dlNo: 'D11223344',
        dlExpiry: '2025-08-30',
        allowedVehicles: 'SUV, Saloon',
        vehicleRegNum: 'SA-11223',
        vehicleType: 'SUV',
        make: 'Chevrolet',
        model: 'Tahoe',
        capacity: '8 Seats',
        insuranceExpiry: '2025-08-01',
        lastFC: '2024-02-01',
        fcExpiry: '2025-02-01',
        permit: 'City',
        puccExpiry: '2024-08-01',
    },
    {
        name: 'Mohammed Singh',
        contactNumber: '+966 59 888 7777',
        dlNo: 'D55667788',
        dlExpiry: '2028-04-22',
        allowedVehicles: 'Truck',
        vehicleRegNum: 'SA-55667',
        vehicleType: 'Heavy Truck',
        make: 'Scania',
        model: 'R-series',
        capacity: 'Flat bed',
        insuranceExpiry: '2026-03-15',
        lastFC: '2024-09-20',
        fcExpiry: '2025-09-20',
        permit: 'GCC',
        puccExpiry: '2025-03-20',
    },
];

    

