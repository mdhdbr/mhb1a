

'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Car, Truck, Navigation, Route, FileText, CreditCard, User, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVehicleJobStore } from '@/stores/job-store';
import { useManualDispatchStore } from '@/stores/manual-dispatch-store';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle, Job, Rate } from '@/lib/types';
import { CreditCardForm } from '@/components/credit-card-form';
import { useAwaitingJobsStore } from '@/stores/awaiting-jobs-store';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';


type LocationState = { address: string; lat: number; lng: number };
type UserProfile = {
  firstName?: string;
  lastName?: string;
  employeeId?: string;
};

function ManualDispatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { addAwaitingJob } = useAwaitingJobsStore();

  const [bookingType, setBookingType] = useState<'passenger' | 'shipper'>('passenger');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [fare, setFare] = useState('');
  const [notes, setNotes] = useState('');
  const { vehicles } = useVehicleJobStore();
  
  const [pickup, setPickup] = useState<LocationState>({ address: '', lat: 0, lng: 0 });
  const [dropoff, setDropoff] = useState<LocationState>({ address: '', lat: 0, lng: 0 });
  const [distance, setDistance] = useState<string | null>(null);

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isCardPaid, setIsCardPaid] = useState(false);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');

  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const pricingCollectionQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'pricing') : null),
    [firestore]
  );
  const { data: pricingRates } = useCollection<Rate>(pricingCollectionQuery);

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    import('leaflet').then(leaflet => {
      setL(leaflet);
    });
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationState> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        return { lat, lng, address };
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        toast({
            variant: "destructive",
            title: "Geocoding Error",
            description: "Could not fetch address for the provided coordinates.",
        });
        return { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
    }
  }, [toast]);

  const handleCoordinatePaste = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'dropoff') => {
      const pastedText = e.target.value;
      const setter = type === 'pickup' ? setPickup : setDropoff;
      
      setter(prev => ({...prev, address: pastedText, lat: 0, lng: 0}));

      const coordRegex = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;
      const match = pastedText.match(coordRegex);

      if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
              const location = await reverseGeocode(lat, lng);
              setter(location);
          }
      }
  }, [reverseGeocode]);

  useEffect(() => {
    const pickupAddress = searchParams.get('pickupAddress');
    const pickupLat = searchParams.get('pickupLat');
    const pickupLng = searchParams.get('pickupLng');
    if (pickupAddress && pickupLat && pickupLng) {
      setPickup({ address: pickupAddress, lat: parseFloat(pickupLat), lng: parseFloat(pickupLng) });
    }

    const dropoffAddress = searchParams.get('dropoffAddress');
    const dropoffLat = searchParams.get('dropoffLat');
    const dropoffLng = searchParams.get('dropoffLng');
    if (dropoffAddress && dropoffLat && dropoffLng) {
      setDropoff({ address: dropoffAddress, lat: parseFloat(dropoffLat), lng: parseFloat(dropoffLng) });
    }
  }, [searchParams]);

  useEffect(() => {
    if (L && pickup.lat && pickup.lng && dropoff.lat && dropoff.lng) {
      const p1 = L.latLng(pickup.lat, pickup.lng);
      const p2 = L.latLng(dropoff.lat, dropoff.lng);
      const dist = p1.distanceTo(p2);
      const distInKm = (dist / 1000).toFixed(2);
      setDistance(`${distInKm} km`);
    } else {
      setDistance(null);
    }
  }, [pickup, dropoff, L]);

  useEffect(() => {
    if (distance && vehicleType && pricingRates) {
        const selectedRate = pricingRates.find(r => r.vehicleType.toLowerCase() === vehicleType.toLowerCase());

        if (selectedRate) {
            const distanceInKm = parseFloat(distance.split(' ')[0]);
            
            const perVal = selectedRate.rate * (selectedRate.percentPer / 100);
            const totalRatePerKm = selectedRate.rate 
                                 + perVal
                                 + selectedRate.vatAmount 
                                 + selectedRate.damages 
                                 + selectedRate.handling 
                                 + selectedRate.waiting 
                                 + selectedRate.halting;
            
            const calculatedFare = distanceInKm * totalRatePerKm;
            setFare(calculatedFare.toFixed(2));
        } else {
            setFare(''); // Reset fare if no rate is found
        }
    }
  }, [distance, vehicleType, pricingRates]);

  const availableVehicleTypes = useMemo(() => {
    if (!pricingRates) return [];
    if (bookingType === 'passenger') {
        return pricingRates.filter(r => r.category === 'passenger').map(r => r.vehicleType);
    } else { // shipper
        return pricingRates.filter(r => r.category === 'shipper' || r.category === 'equipment').map(r => r.vehicleType);
    }
  }, [pricingRates, bookingType]);


  useEffect(() => {
    // Reset payment and scheduling state when booking type changes
    setPaymentMethod('');
    setShowPaymentOptions(false);
    setIsCardPaid(false);
    setVehicleType(''); 
    setScheduleType('now');
  }, [bookingType]);

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

    router.push(`/dashboard/location-picker?${params.toString()}`);
  };
  
  const createJob = useCallback(() => {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not identify job creator.' });
        return;
    }
      
    const newJob: Job = {
        id: `JOB-${Date.now().toString().slice(-6)}`,
        title: `Manual Dispatch: ${vehicleType}`,
        from: pickup.address,
        to: dropoff.address,
        pickupCoordinates: { lat: pickup.lat, lng: pickup.lng },
        vehicleType: bookingType === 'passenger' ? 'Car' : 'Truck',
        status: 'Awaiting',
        createdAt: new Date().toISOString(),
        createdBy: {
            uid: user.uid,
            name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || user.email || 'Admin',
            employeeId: userProfile.employeeId
        },
        requirements: {
            location: 'Riyadh', // Or derive from pickup
            vehicleType: vehicleType,
            licenseValidity: true,
            insuranceValidity: true,
        },
        clientName: 'Innovate LLC', // Placeholder
        paymentMethod: paymentMethod === 'card' ? 'Card' : (paymentMethod === 'invoice' ? 'Invoice' : 'Cash'),
        paymentStatus: isCardPaid ? 'Paid' : 'Unpaid'
    };
    addAwaitingJob(newJob);
    toast({ title: 'Job Dispatched!', description: `${newJob.id} is now awaiting allocation.` });
    
    // Reset the form
    setShowPaymentOptions(false);
    setPaymentMethod('');
    setIsCardPaid(false);
    setVehicleType('');
    setFare('');
    setNotes('');
    setPickup({ address: '', lat: 0, lng: 0 });
    setDropoff({ address: '', lat: 0, lng: 0 });
    setScheduleType('now');
  }, [addAwaitingJob, bookingType, dropoff, isCardPaid, paymentMethod, pickup, toast, vehicleType, userProfile, user]);


  const handleConfirmJob = () => {
    if (!vehicleType || !pickup.address || !dropoff.address || !fare) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill all required fields before proceeding.' });
        return;
    }
    setShowPaymentOptions(true);
  };
  
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    if(method !== 'card') {
      setIsCardPaid(true); // Auto-confirm for non-card payments
    } else {
      setIsCardPaid(false); // Reset card paid status
    }
  };

  const showScheduling = paymentMethod && (paymentMethod !== 'card' || isCardPaid);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manual Dispatch</h1>
        <p className="text-muted-foreground mt-1">
          Create and assign a new job using the interactive map and driver list.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Job Creation</CardTitle>
          <CardDescription>Fill in the details to create and assign a new job.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Booking Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={bookingType === 'passenger' ? 'default' : 'outline'}
                onClick={() => setBookingType('passenger')}
                className={cn("h-12 text-base", bookingType === 'passenger' && "bg-primary text-primary-foreground")}
              >
                <Car className="mr-2 h-5 w-5" />
                Passenger
              </Button>
              <Button
                variant={bookingType === 'shipper' ? 'default' : 'outline'}
                onClick={() => setBookingType('shipper')}
                className={cn("h-12 text-base", bookingType === 'shipper' && "bg-primary text-primary-foreground")}
              >
                <Truck className="mr-2 h-5 w-5" />
                Shipper
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle-type">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger id="vehicle-type" className="h-11">
                <SelectValue placeholder="Select a vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicleTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
                 {availableVehicleTypes.length === 0 && (
                    <SelectItem value="none" disabled>No vehicle types for this category</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-location">Pickup Location</Label>
              <div className="relative">
                <Input 
                    id="pickup-location" 
                    value={pickup.address} 
                    onChange={(e) => handleCoordinatePaste(e, 'pickup')}
                    placeholder="Click icon or paste coordinates" 
                    className="h-11"
                />
                <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-9 w-9" onClick={handleLocationSelect}>
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff-location">Dropoff Location</Label>
               <div className="relative">
                <Input 
                    id="dropoff-location" 
                    value={dropoff.address} 
                    onChange={(e) => handleCoordinatePaste(e, 'dropoff')}
                    placeholder="Click icon or paste coordinates" 
                    className="h-11"
                />
                <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-9 w-9" onClick={handleLocationSelect}>
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-distance">Estimated Distance</Label>
              <div className="relative">
                <Input id="estimated-distance" value={distance || 'Calculating...'} disabled className="pl-8 h-11" />
                 <Route className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fare-amount">Fare Amount (SAR)</Label>
              <Input id="fare-amount" placeholder="Fare amount" value={fare} onChange={(e) => setFare(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Driver</Label>
            <Textarea id="notes" placeholder="Add special instructions, contact numbers, etc." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {!showPaymentOptions && (
            <Button size="lg" className="w-full text-lg h-12" onClick={handleConfirmJob}>
                Confirm Job & Proceed to Payment
            </Button>
          )}
        
          {showPaymentOptions && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label>Payment Method</Label>
                {bookingType === 'shipper' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <Button variant={paymentMethod === 'invoice' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('invoice')} className="h-12"><FileText className="mr-2 h-4 w-4"/> Invoice</Button>
                      <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('card')} className="h-12"><CreditCard className="mr-2 h-4 w-4"/> Credit Card</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('card')} className="h-12"><CreditCard className="mr-2 h-4 w-4"/> Card</Button>
                      <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => handlePaymentMethodSelect('cash')} className="h-12"><User className="mr-2 h-4 w-4"/> Cash</Button>
                  </div>
                )}
                
                {paymentMethod === 'card' && (
                    <div className="pt-4">
                        <CreditCardForm onPaymentSuccess={() => { setIsCardPaid(true); }} />
                    </div>
                )}
              </div>

               {showScheduling && (
                  <div className="space-y-4 pt-4 border-t">
                      <Label>Schedule Job</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Button 
                            className="h-12" 
                            onClick={() => { setScheduleType('now'); createJob(); }}
                            >
                              Assign Now
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-12" 
                            onClick={() => setScheduleType('later')}
                            >
                              Schedule for Later
                          </Button>
                      </div>
                      {scheduleType === 'later' && (
                          <div className="flex gap-4 pt-2">
                              <Input type="date" className="h-11"/>
                              <div className="relative w-full">
                                <Input type="time" className="pr-8 h-11"/>
                                <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                          </div>
                      )}
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManualDispatchPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2 text-muted-foreground">Loading Dispatch...</p>
        </div>}>
            <ManualDispatchContent />
        </Suspense>
    )
}
