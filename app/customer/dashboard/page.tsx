
'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Truck, Clock, FileText, CreditCard, Pencil, Navigation, Loader2, LocateFixed, Route, Package, Star, User, Building, Landmark, Scale, DollarSign, BookUser, Car, Users, Bus, Accessibility, Baby, Newspaper } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreditCardForm from '@/components/credit-card-form';
import { useAwaitingJobsStore } from '@/stores/awaiting-jobs-store';
import type { Job, Rate } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


type LocationState = { address: string; lat: number | null; lng: number | null };

const ShipperForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { addAwaitingJob } = useAwaitingJobsStore();
    const firestore = useFirestore();

    const pricingCollectionQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, 'pricing') : null),
      [firestore]
    );
    const { data: pricingRates } = useCollection<Rate>(pricingCollectionQuery);

    const shipperVehicleTypes = useMemo(() => {
        if (!pricingRates) return [];
        return pricingRates.filter(r => r.category === 'shipper' || r.category === 'equipment');
    }, [pricingRates]);


    const [paymentMethod, setPaymentMethod] = useState('invoice');
    const [pickup, setPickup] = useState<LocationState>({ address: '', lat: null, lng: null });
    const [dropoff, setDropoff] = useState<LocationState>({ address: '', lat: null, lng: null });
    const [isLocating, setIsLocating] = useState<'pickup' | 'dropoff' | null>(null);
    const [distance, setDistance] = useState<string | null>(null);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [vehicleType, setVehicleType] = useState('');
    const [goodsDescription, setGoodsDescription] = useState('');

    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error('Failed to fetch address');
            const data = await response.json();
            return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            toast({
                variant: "destructive",
                title: "Geocoding Error",
                description: "Could not fetch address for the coordinates.",
            });
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, [toast]);
    
    const handleCoordinatePaste = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'dropoff') => {
      const pastedText = e.target.value;
      const setter = type === 'pickup' ? setPickup : setDropoff;
      
      setter(prev => ({...prev, address: pastedText, lat: null, lng: null}));

      const coordRegex = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;
      const match = pastedText.match(coordRegex);

      if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
              const address = await reverseGeocode(lat, lng);
              setter({ lat, lng, address });
          }
      }
    }, [reverseGeocode]);

    useEffect(() => {
        const pLat = searchParams.get('pickupLat');
        const pLng = searchParams.get('pickupLng');
        const pAddr = searchParams.get('pickupAddress');
        if(pLat && pLng && pAddr) {
            setPickup({ lat: parseFloat(pLat), lng: parseFloat(pLng), address: pAddr });
        }

        const dLat = searchParams.get('dropoffLat');
        const dLng = searchParams.get('dropoffLng');
        const dAddr = searchParams.get('dropoffAddress');
        if(dLat && dLng && dAddr) {
            setDropoff({ lat: parseFloat(dLat), lng: parseFloat(dLng), address: dAddr });
        }

    }, [searchParams]);
    
     useEffect(() => {
        if (pickup.lat && pickup.lng && dropoff.lat && dropoff.lng) {
        const p1 = L.latLng(pickup.lat, pickup.lng);
        const p2 = L.latLng(dropoff.lat, dropoff.lng);
        const dist = p1.distanceTo(p2); // distance in meters
        const distInKm = (dist / 1000).toFixed(2);
        setDistance(`${distInKm} km`);
        } else {
        setDistance(null);
        }
    }, [pickup, dropoff]);

    const handleLocationSelect = () => {
        const params = new URLSearchParams();
        if (pickup.address && pickup.lat && pickup.lng) {
            params.set('pickupAddress', pickup.address);
            params.set('pickupLat', pickup.lat.toString());
            params.set('pickupLng', pickup.lng.toString());
        }
        if (dropoff.address && dropoff.lat && dropoff.lng) {
            params.set('dropoffAddress', dropoff.address);
            params.set('dropoffLat', dropoff.lat.toString());
            params.set('dropoffLng', dropoff.lng.toString());
        }
        router.push(`/customer/location-picker?${params.toString()}`);
    }

    const handleGpsCapture = (type: 'pickup' | 'dropoff') => {
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
                description: "Your browser does not support location services.",
            });
            return;
        }

        setIsLocating(type);
        toast({ title: "Getting Current Location...", description: "Please allow location access." });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await reverseGeocode(latitude, longitude);
                
                if (type === 'pickup') {
                    setPickup({ address, lat: latitude, lng: longitude });
                } else {
                    setDropoff({ address, lat: latitude, lng: longitude });
                }
                setIsLocating(null);
                toast({ title: "Location Captured!", description: address });
            },
            (error) => {
                let description = "An unknown error occurred.";
                if (error.code === error.PERMISSION_DENIED) {
                    description = "You denied the request for Geolocation.";
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    description = "Location information is unavailable.";
                } else if (error.code === error.TIMEOUT) {
                    description = "The request to get user location timed out.";
                }
                toast({
                    variant: "destructive",
                    title: "Location Error",
                    description,
                });
                setIsLocating(null);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleConfirmShipment = () => {
        setShowPaymentOptions(true);
    };

    const handleFinalSubmission = () => {
        const customerPhone = sessionStorage.getItem('customerPhone');
        if (!pickup.address || !dropoff.address || !vehicleType || !pickup.lat || !pickup.lng) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out pickup, dropoff and vehicle type.' });
            return;
        }

        const newJob: Job = {
            id: `JOB-${Date.now().toString().slice(-6)}`,
            title: goodsDescription || 'New Shipment',
            from: pickup.address,
            to: dropoff.address,
            pickupCoordinates: { lat: pickup.lat, lng: pickup.lng },
            vehicleType: 'Truck', // Or determine from vehicleType
            status: 'Awaiting',
            createdAt: new Date().toISOString(),
            createdBy: {
                uid: customerPhone || 'customer-unknown',
                name: `Shipper (${customerPhone || 'Unknown'})`,
            },
            requirements: {
                location: 'Riyadh',
                vehicleType: vehicleType,
                licenseValidity: true,
                insuranceValidity: true,
            }
        };
        addAwaitingJob(newJob);
        toast({ title: 'Shipment Confirmed!', description: 'Your booking has been finalized and is awaiting allocation.' });
    };
    
    const handlePaymentMethodSelect = (method: string) => {
        setPaymentMethod(method);
        if (method === 'invoice') {
            handleFinalSubmission();
        }
    };


    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Shipper's Portal</CardTitle>
                <p className="text-muted-foreground">Enter shipment details to book a vehicle.</p>
            </CardHeader>
            <CardContent className="flex-1 space-y-8">
                <div className="space-y-6">
                    <div>
                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                            <Route className="h-4 w-4" />
                            Route Details
                        </Label>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="pickup">Pickup Location</Label>
                                    <div className="relative">
                                        <Input id="pickup" value={pickup.address} onChange={(e) => handleCoordinatePaste(e, 'pickup')} placeholder="Use GPS, map, or paste coords" className="pr-20 h-11" />
                                        <div className="absolute top-1/2 right-1 -translate-y-1/2 flex items-center">
                                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleGpsCapture('pickup')} disabled={!!isLocating}>
                                                {isLocating === 'pickup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 text-muted-foreground" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLocationSelect}>
                                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dropoff">Dropoff Location</Label>
                                    <div className="relative">
                                        <Input id="dropoff" value={dropoff.address} onChange={(e) => handleCoordinatePaste(e, 'dropoff')} placeholder="Use GPS, map, or paste coords" className="pr-20 h-11" />
                                        <div className="absolute top-1/2 right-1 -translate-y-1/2 flex items-center">
                                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleGpsCapture('dropoff')} disabled={!!isLocating}>
                                                {isLocating === 'dropoff' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 text-muted-foreground" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLocationSelect}>
                                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="eta">E.T.A (Scheduled)</Label>
                                    <div className="flex gap-2">
                                        <Input id="eta-date" type="date" className="w-full md:w-1/2 h-11" />
                                        <div className="relative w-full md:w-1/2">
                                            <Input id="eta-time" type="time" className="pr-8 h-11" />
                                            <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="ata">A.T.A (Actual)</Label>
                                    <div className="flex gap-2">
                                        <Input id="ata-date" type="date" className="w-full md:w-1/2 h-11" />
                                        <div className="relative w-full md:w-1/2">
                                            <Input id="ata-time" type="time" className="pr-8 h-11" />
                                            <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                            <Package className="h-4 w-4" />
                            Shipment & Service
                        </Label>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                                    <Select value={vehicleType} onValueChange={setVehicleType}>
                                        <SelectTrigger id="vehicle-type" className="h-11">
                                            <SelectValue placeholder="Select a vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shipperVehicleTypes.map(v => (
                                                <SelectItem key={v.id} value={v.vehicleType}>{v.vehicleType}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="total-kms">Total Kms</Label>
                                    <div className="relative">
                                        <Input id="total-kms" value={distance || '0 km'} disabled className="pr-8 h-11" />
                                        <Route className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="service-level">Service Level</Label>
                                    <Select defaultValue="standard"><SelectTrigger id="service-level" className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="express">Express</SelectItem><SelectItem value="same-day">Same-Day</SelectItem></SelectContent></Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="goods-description">Description of Goods</Label>
                                    <Input id="goods-description" placeholder="e.g., Electronics, Furniture" className="h-11" value={goodsDescription} onChange={(e) => setGoodsDescription(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <div className="relative"><Input id="weight" type="number" placeholder="0" className="pl-8 h-11" /><Scale className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="declared-value">Declared Value (SAR)</Label>
                                    <div className="relative"><Input id="declared-value" type="number" placeholder="0.00" className="pl-8 h-11" /><DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                            <BookUser className="h-4 w-4" />
                            Contact Information
                        </Label>
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="sender-name">Sender Name</Label>
                                    <Input id="sender-name" placeholder="Enter sender's name" className="h-11" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sender-phone">Sender Phone</Label>
                                    <Input id="sender-phone" type="tel" placeholder="Enter sender's phone number" className="h-11" />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="recipient-name">Recipient Name</Label>
                                    <Input id="recipient-name" placeholder="Enter recipient's name" className="h-11" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="recipient-phone">Recipient Phone</Label>
                                    <Input id="recipient-phone" type="tel" placeholder="Enter recipient's phone number" className="h-11" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <Label htmlFor="note">Note for the driver</Label>
                        <div className="relative"><Textarea id="note" placeholder="e.g., Specify loading instructions, contact person, etc." rows={3} /><Pencil className="absolute bottom-2 right-2 h-4 w-4 text-muted-foreground" /></div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="po-number">PO / Reference Number</Label>
                        <Input id="po-number" placeholder="Enter a reference number" className="h-11" />
                    </div>

                    <div className="p-4 bg-card border rounded-lg flex flex-col sm:flex-row justify-between items-center mt-auto gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-muted-foreground">Estimated Fare</p>
                            <p className="text-2xl font-bold font-headline text-primary">
                                000.00 SAR
                            </p>
                        </div>
                        {!showPaymentOptions && (
                            <Button size="lg" className="h-12 w-full sm:w-auto" onClick={handleConfirmShipment}>
                                Confirm Shipment
                            </Button>
                        )}
                    </div>

                    {showPaymentOptions && (
                        <div className="space-y-3 pt-4 border-t">
                            <Label>Payment Method</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button variant={paymentMethod === 'invoice' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('invoice')} className="h-12"><FileText className="mr-2 h-4 w-4"/> Invoice</Button>
                                <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('card')} className="h-12"><CreditCard className="mr-2 h-4 w-4"/> Credit Card</Button>
                            </div>
                            {paymentMethod === 'card' && (
                                <div className="pt-2">
                                    <CreditCardForm onPaymentSuccess={handleFinalSubmission} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-card border-t" />
        </Card>
    );
};

const PaxForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { addAwaitingJob } = useAwaitingJobsStore();
    const firestore = useFirestore();

    const pricingCollectionQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, 'pricing') : null),
      [firestore]
    );
    const { data: pricingRates } = useCollection<Rate>(pricingCollectionQuery);

    const passengerVehicleTypes = useMemo(() => {
        if (!pricingRates) return [];
        return pricingRates.filter(r => r.category === 'passenger');
    }, [pricingRates]);
    
    const extras = [
        { id: 'child-seat', label: 'Child Seat' },
        { id: 'wheelchair', label: 'Wheelchair Access' },
        { id: 'water', label: 'Water Bottle' },
        { id: 'newspaper', label: 'Newspaper' },
        { id: 'tissue', label: 'Tissue Box' },
    ];


    const [paymentMethod, setPaymentMethod] = useState('card');
    const [pickup, setPickup] = useState<LocationState>({ address: 'King Khalid International Airport', lat: 24.957, lng: 46.699 });
    const [dropoff, setDropoff] = useState<LocationState>({ address: 'Kingdom Centre', lat: 24.711, lng: 46.674 });
    const [isLocating, setIsLocating] = useState<'pickup' | 'dropoff' | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState('SEDAN');
    const [pickupTime, setPickupTime] = useState<'now' | 'later'>('now');
    const [distance, setDistance] = useState<string | null>(null);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);

    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error('Failed to fetch address');
            const data = await response.json();
            return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            toast({
                variant: "destructive",
                title: "Geocoding Error",
                description: "Could not fetch address for the coordinates.",
            });
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, [toast]);
    
    const handleCoordinatePaste = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'dropoff') => {
      const pastedText = e.target.value;
      const setter = type === 'pickup' ? setPickup : setDropoff;
      
      setter(prev => ({...prev, address: pastedText, lat: null, lng: null}));

      const coordRegex = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;
      const match = pastedText.match(coordRegex);

      if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
              const address = await reverseGeocode(lat, lng);
              setter({ lat, lng, address });
          }
      }
    }, [reverseGeocode]);

    useEffect(() => {
        const pLat = searchParams.get('pickupLat');
        const pLng = searchParams.get('pickupLng');
        const pAddr = searchParams.get('pickupAddress');
        if(pLat && pLng && pAddr) {
            setPickup({ lat: parseFloat(pLat), lng: parseFloat(pLng), address: pAddr });
        }

        const dLat = searchParams.get('dropoffLat');
        const dLng = searchParams.get('dropoffLng');
        const dAddr = searchParams.get('dropoffAddress');
        if(dLat && dLng && dAddr) {
            setDropoff({ lat: parseFloat(dLat), lng: parseFloat(dLng), address: dAddr });
        }

    }, [searchParams]);

     useEffect(() => {
        if (pickup.lat && pickup.lng && dropoff.lat && dropoff.lng) {
        const p1 = L.latLng(pickup.lat, pickup.lng);
        const p2 = L.latLng(dropoff.lat, dropoff.lng);
        const dist = p1.distanceTo(p2); // distance in meters
        const distInKm = (dist / 1000).toFixed(2);
        setDistance(`${distInKm} km`);
        } else {
        setDistance(null);
        }
    }, [pickup, dropoff]);

    const handleLocationSelect = () => {
        const params = new URLSearchParams();
        if (pickup.address && pickup.lat && pickup.lng) {
            params.set('pickupAddress', pickup.address);
            params.set('pickupLat', pickup.lat.toString());
            params.set('pickupLng', pickup.lng.toString());
        }
        if (dropoff.address && dropoff.lat && dropoff.lng) {
            params.set('dropoffAddress', dropoff.address);
            params.set('dropoffLat', dropoff.lat.toString());
            params.set('dropoffLng', dropoff.lng.toString());
        }
        router.push(`/customer/location-picker?${params.toString()}`);
    }
    
    const handleConfirmBooking = () => {
        setShowPaymentOptions(true);
    };

    const handleFinalBooking = () => {
        const customerPhone = sessionStorage.getItem('customerPhone');
        if (!pickup.address || !dropoff.address || !selectedVehicle || !pickup.lat || !pickup.lng) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out pickup, dropoff and vehicle type.' });
            return;
        }

        const newJob: Job = {
            id: `JOB-${Date.now().toString().slice(-6)}`,
            title: `Passenger Ride: ${selectedVehicle}`,
            from: pickup.address,
            to: dropoff.address,
            pickupCoordinates: { lat: pickup.lat, lng: pickup.lng },
            vehicleType: 'Car',
            status: 'Awaiting',
            createdAt: new Date().toISOString(),
            createdBy: {
                uid: customerPhone || 'customer-unknown',
                name: `Pax (${customerPhone || 'Unknown'})`,
            },
            requirements: {
                location: 'Riyadh',
                vehicleType: selectedVehicle,
                licenseValidity: true,
                insuranceValidity: true,
            }
        };
        addAwaitingJob(newJob);
        toast({ title: 'Booking Confirmed!', description: 'Your ride is on its way and is awaiting allocation.' });
    };

    const handlePaymentMethodSelect = (method: string) => {
        setPaymentMethod(method);
        if (method === 'cash') {
            handleFinalBooking();
        }
    };


    return (
         <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Book a Ride</CardTitle>
                <p className="text-muted-foreground">Enter your trip details to get a fare estimate.</p>
            </CardHeader>
            <CardContent className="flex-1 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pickup-pax">Pickup Location</Label>
                         <div className="relative">
                            <Input id="pickup-pax" value={pickup.address} onChange={(e) => handleCoordinatePaste(e, 'pickup')} placeholder="Enter pickup location" className="h-11"/>
                            <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-9 w-9" onClick={handleLocationSelect}>
                                <Navigation className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dropoff-pax">Dropoff Location</Label>
                         <div className="relative">
                            <Input id="dropoff-pax" value={dropoff.address} onChange={(e) => handleCoordinatePaste(e, 'dropoff')} placeholder="Enter dropoff location" className="h-11"/>
                            <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-9 w-9" onClick={handleLocationSelect}>
                                <Navigation className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Select a Vehicle</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                        {passengerVehicleTypes.map(vehicle => (
                            <Card 
                                key={vehicle.id} 
                                className={cn(
                                    "p-2 sm:p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all border-2",
                                    selectedVehicle === vehicle.vehicleType ? "border-primary bg-primary/10" : "hover:border-primary/50"
                                )}
                                onClick={() => setSelectedVehicle(vehicle.vehicleType)}
                            >
                                {vehicle.vehicleType.includes('BUS') ? <Bus className="h-6 w-6 sm:h-7 sm:w-7" /> : <Car className="h-6 w-6 sm:h-7 sm:w-7" />}
                                <p className="font-semibold text-center text-xs sm:text-sm">{vehicle.vehicleType}</p>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3 w-3"/>
                                    <span className="text-xs font-medium">4</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
                 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="pax-vehicle-type">Vehicle Type</Label>
                        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                            <SelectTrigger id="pax-vehicle-type" className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {passengerVehicleTypes.map(v => <SelectItem key={v.id} value={v.vehicleType}>{v.vehicleType}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="pax-total-kms">Total Kms</Label>
                        <div className="relative">
                            <Input id="pax-total-kms" value={distance || '0 km'} disabled className="pr-8 h-11" />
                            <Route className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Pickup Time</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant={pickupTime === 'now' ? 'default' : 'outline'}
                            onClick={() => setPickupTime('now')}
                            className="h-12"
                        >
                            Book Now
                        </Button>
                         <Button
                            variant={pickupTime === 'later' ? 'default' : 'outline'}
                            onClick={() => setPickupTime('later')}
                            className="h-12"
                        >
                            Schedule for Later
                        </Button>
                    </div>
                     {pickupTime === 'later' && (
                         <div className="grid grid-cols-2 gap-4 pt-2">
                            <Input type="date" className="h-11" />
                            <Input type="time" className="h-11" />
                        </div>
                    )}
                </div>
                
                <div className="space-y-3">
                    <Label>Extras & Add-ons</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                       {extras.map(extra => (
                         <div key={extra.id} className="flex items-center space-x-2">
                            <Checkbox id={extra.id} />
                            <label
                                htmlFor={extra.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {extra.label}
                            </label>
                        </div>
                       ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="note-pax">Note for the driver</Label>
                    <div className="relative">
                        <Textarea id="note-pax" placeholder="e.g., I have extra luggage." rows={3} />
                        <Pencil className="absolute bottom-2.5 right-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <div className="p-4 bg-card border rounded-lg flex flex-col sm:flex-row justify-between items-center mt-auto gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground">Estimated Fare</p>
                        <p className="text-2xl font-bold font-headline text-primary">
                            000.00 SAR
                        </p>
                    </div>
                    {!showPaymentOptions && (
                        <Button size="lg" className="h-12 w-full sm:w-auto" onClick={handleConfirmBooking}>
                            Confirm Booking
                        </Button>
                    )}
                </div>

                {showPaymentOptions && (
                    <div className="space-y-2 pt-4 border-t">
                        <Label>Payment Method</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('card')} className="h-12"><CreditCard className="mr-2 h-4 w-4"/> Card</Button>
                            <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('cash')} className="h-12"><User className="mr-2 h-4 w-4"/> Cash</Button>
                        </div>
                        {paymentMethod === 'card' && (
                            <div className="pt-2">
                                <CreditCardForm onPaymentSuccess={handleFinalBooking} />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 bg-card border-t" />
        </Card>
    );
};


function CustomerDashboardPageComponent() {
  const router = useRouter();
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem('customerVerified') === 'true';
    if (!verified) {
      router.replace('/login');
    } else {
      setIsCustomer(true);
    }
  }, [router]);

  if (!isCustomer) {
    return null;
  }
  
  return (
    <Tabs defaultValue="shipper" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="shipper" className="h-full text-base">
                <Truck className="mr-2 h-5 w-5" />
                Shipper
            </TabsTrigger>
            <TabsTrigger value="pax" className="h-full text-base">
                <User className="mr-2 h-5 w-5" />
                Pax
            </TabsTrigger>
        </TabsList>
        <TabsContent value="shipper" className="mt-6">
            <Suspense fallback={<div>Loading Shipper...</div>}>
                <ShipperForm />
            </Suspense>
        </TabsContent>
        <TabsContent value="pax" className="mt-6">
            <Suspense fallback={<div>Loading Pax...</div>}>
                <PaxForm />
            </Suspense>
        </TabsContent>
    </Tabs>
  );
}

export default function CustomerDashboardPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="flex items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Loading Customer Dashboard...</p>
            </div>
        </div>}>
            <CustomerDashboardPageComponent />
        </Suspense>
    )
}
