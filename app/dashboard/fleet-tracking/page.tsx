
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Vehicle } from '@/lib/types';
import { useVehicleJobStore } from '@/stores/job-store';
import { useMapStore } from '@/stores/map-store';
import { useManualDispatchStore } from '@/stores/manual-dispatch-store';
import { type LatLng } from 'leaflet';
import { Loader2 } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

function FleetTrackingPageComponent() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { vehicles } = useVehicleJobStore();
  const { showRoutes, showIncidents } = useMapStore();
  const { pendingJob } = useManualDispatchStore();
  const searchParams = useSearchParams();

  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');
  const fromDispatch = searchParams.get('from');
  const vehicleIdFromUrl = searchParams.get('vehicleId');
  
  const initialCoords = initialLat && initialLng ? [parseFloat(initialLat), parseFloat(initialLng)] : undefined;

  useEffect(() => {
    // This effect handles auto-selecting a vehicle when its ID is passed in the URL.
    if (vehicleIdFromUrl && vehicles.length > 0) {
        const vehicleToSelect = vehicles.find(v => v.id === vehicleIdFromUrl);
        if (vehicleToSelect) {
            setSelectedVehicle(vehicleToSelect);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleIdFromUrl, vehicles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // This handles general linking to a location.
    if (initialCoords && vehicles.length > 0 && !vehicleIdFromUrl) {
      import('leaflet').then(L => {
        const targetLatLng = L.latLng(initialCoords[0], initialCoords[1]);
        let vehicleAtLocation: Vehicle | null = null;
        let minDistance = Infinity;
        vehicles.forEach(vehicle => {
            if (!vehicle.position) return;
            const vehicleLatLng = L.latLng(vehicle.position as [number, number]);
            const distance = targetLatLng.distanceTo(vehicleLatLng);
            if (distance < minDistance) {
                minDistance = distance;
                vehicleAtLocation = vehicle;
            }
        });
        if (vehicleAtLocation && minDistance < 50) { // Wider radius for general locate
            setSelectedVehicle(vehicleAtLocation);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLat, initialLng, vehicles, fromDispatch, vehicleIdFromUrl]);


  const handleVehicleSelect = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  };


  return (
    <div className="h-full w-full flex items-start justify-center -m-4 lg:-m-6">
        <div className="w-full h-full relative overflow-hidden">
            <MapWithNoSSR
            vehicles={vehicles}
            onVehicleSelect={handleVehicleSelect}
            selectedVehicle={selectedVehicle}
            showRoutes={showRoutes}
            showIncidents={showIncidents}
            initialCoords={initialCoords}
            />
        </div>
    </div>
  );
}

export default function FleetTrackingPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full bg-muted flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading Fleet Tracker...</p>
        </div>
      </div>
    }>
      <FleetTrackingPageComponent />
    </Suspense>
  )
}
