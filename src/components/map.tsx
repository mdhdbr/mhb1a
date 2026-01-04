

'use client';

import 'leaflet/dist/leaflet.css';
import L, { Map as LeafletMap, LayerGroup, LatLng } from 'leaflet';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useToast } from '@/hooks/use-toast';
import { useMapStore } from '@/stores/map-store';
import { useManualDispatchStore } from '@/stores/manual-dispatch-store';
import { useVehicleJobStore } from '@/stores/job-store';
import { useAwaitingJobsStore } from '@/stores/awaiting-jobs-store';
import type { Vehicle, Job } from '@/lib/types';
import { incidentData } from '@/lib/data';
import VehicleContextMenu from './vehicle-context-menu';
import JobInfoPopup from './job-info-popup';
import {
    plannedPickupIcon,
    plannedDropoffIcon,
} from '@/components/icons/map-icons';
import WhoWasHereDialog from './who-was-here-dialog';
import { useRouter } from 'next/navigation';


if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

const statusColorMapping: { [key: string]: string } = {
    // Job-related statuses
    'Completed': '#6b7280', // gray-500
    'Received': '#a855f7', // purple-500
    'Accepted': '#a855f7', // purple-500
    'ON ROUTE TO PU': '#f59e0b', // amber-500
    'En Route to Dropoff': '#f59e0b', // amber-500
    'POB-ON ROUTE': '#f59e0b', // amber-500
    'Arrived': '#ef4444', // red-500
    'At Drop-off Location': '#ef4444', // red-500
    // Vehicle-specific statuses
    'Idle': '#22c55e', // green-500
    'Empty': '#22c55e', // green-500
    'On Duty': '#10b981', // emerald-500
    'On Break': '#f97316', // orange-500
    'Maintenance': '#d97706', // amber-600
    'Offline': '#4b5563', // gray-600
};


const vehicleIconPaths: { [key: string]: string } = {
    'Van': '<path d="M18 10H14V15H18V10Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19 9H5V16H19V9ZM17 11V14H7V11H17Z" fill="white"/>',
    'Truck': '<path d="M4 16L8 5H16L20 16L18 18H6L4 16ZM9 7L12 14L15 7H9Z" fill="white" />',
    'Equipment': '<path d="M14.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0Z M9.7 11.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0Z M19.7 11.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0Z M9.7 16.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0Z" fill="white"/>',
    'Car': '<path d="M19 12H20V14H19V15H5V14H4V12H5V10C5 9.44772 5.44772 9 6 9H18C18.5523 9 19 9.44772 19 10V12Z" fill="white"/>',
    'Default': '<path d="M19 12H20V14H19V15H5V14H4V12H5V10C5 9.44772 5.44772 9 6 9H18C18.5523 9 19 9.44772 19 10V12Z" fill="white"/>'
};

const getVehicleCategory = (vehicleType: string): keyof typeof vehicleIconPaths => {
    const upperType = vehicleType.toUpperCase();
    if (upperType.includes('TRUCK') || upperType.includes('TRAILER') || upperType.includes('FLATBED')) return 'Truck';
    if (upperType.includes('VAN') || upperType.includes('MPV')) return 'Van';
    if (upperType.includes('BUS')) return 'Truck'; // Using Truck icon for buses for now
    if (upperType.includes('SEDAN') || upperType.includes('CAR') || upperType.includes('SUV')) return 'Car';
    if (['FORKLIFT', 'CRANE', 'LOADER', 'BOBCAT'].some(e => upperType.includes(e))) return 'Equipment';
    return 'Default';
}


const getIcon = (vehicle: Vehicle, isSelected: boolean) => {
    const category = getVehicleCategory(vehicle.vehicleType);
    const iconPath = vehicleIconPaths[category] || vehicleIconPaths['Default'];
    const status = vehicle.job.status || vehicle.status;
    const color = statusColorMapping[status] || '#6B7280'; // gray-500 fallback

    const selectionOutline = isSelected
        ? '<circle cx="12" cy="12" r="11.5" fill="none" stroke="#3B82F6" stroke-width="2"/>'
        : '';
    
    const iconSvg = `
        <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="1"/>
            ${iconPath}
            ${selectionOutline}
        </svg>`;

    return L.divIcon({
        html: iconSvg,
        className: 'bg-transparent border-0',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

const awaitingJobIcon = L.divIcon({
    html: `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#f97316" stroke="white" stroke-width="1.5"/>
            <path d="M12 6V12L16 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,
    className: 'bg-transparent border-0',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});


const incidentIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7595/7595306.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const createStopIcon = (stopNumber: number) => {
    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style="width: 25px; height: 41px;" />
                <span class="absolute text-white font-bold text-xs" style="top: 8px;">${stopNumber}</span>
            </div>
        `,
        className: 'bg-transparent border-0',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};


type MapProps = {
    vehicles: Vehicle[];
    onVehicleSelect: (vehicle: Vehicle | null) => void;
    selectedVehicle: Vehicle | null;
    showRoutes: boolean;
    showIncidents: boolean;
    initialCoords?: [number, number];
};


const Map = ({ vehicles, onVehicleSelect, selectedVehicle, showRoutes, showIncidents, initialCoords }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const vehicleMarkersRef = useRef<LayerGroup>(new L.LayerGroup());
  const awaitingJobMarkersRef = useRef<LayerGroup>(new L.LayerGroup());
  const incidentMarkersRef = useRef<LayerGroup>(new L.LayerGroup());
  const routeLayerRef = useRef<LayerGroup>(new L.LayerGroup());
  const popupRef = useRef<L.Popup | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const { 
    isAutoRefreshOn, 
    showCallsigns, 
    shouldFindNearest, 
    setShouldFindNearest,
    isTracking,
  } = useMapStore();

  const { pendingJob } = useManualDispatchStore();
  const { assignJobToVehicle } = useVehicleJobStore();
  const { awaitingJobs } = useAwaitingJobsStore();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; vehicle: Vehicle } | null>(null);
  const [mapContextMenu, setMapContextMenu] = useState<{ x: number; y: number; latlng: LatLng } | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
        const center: L.LatLngExpression = initialCoords || [24.7136, 46.6753];
        const zoom = initialCoords ? 13 : 6;

        mapInstance.current = L.map(mapRef.current, {
            center: center,
            zoom: zoom,
            minZoom: 3,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current);

        L.control.zoom({ position: 'topleft' }).addTo(mapInstance.current);
        
        vehicleMarkersRef.current.addTo(mapInstance.current);
        awaitingJobMarkersRef.current.addTo(mapInstance.current);
        incidentMarkersRef.current.addTo(mapInstance.current);
        routeLayerRef.current.addTo(mapInstance.current);

        mapInstance.current.on('click', () => {
          setContextMenu(null);
          setMapContextMenu(null);
          onVehicleSelect(null);
        });

        mapInstance.current.on('contextmenu', (e) => {
            const event = e.originalEvent;
            if ((event.target as HTMLElement).closest('.leaflet-marker-icon')) {
                return;
            }
            event.preventDefault();
            setMapContextMenu({ x: event.clientX, y: event.clientY, latlng: e.latlng });
            setContextMenu(null);
        });

        // Auto-zoom logic
        if (vehicles.length > 0 && !initialCoords) {
            const vehicleBounds = L.latLngBounds(vehicles.map(v => v.position));
            mapInstance.current.fitBounds(vehicleBounds, { padding: [50, 50] });
        }
    }
  }, [onVehicleSelect, initialCoords, vehicles]);


  const handleAssignJobSuccess = (vehicle: Vehicle) => {
    router.push('/dashboard/jobs');
  };

  const handleAssignJob = (vehicle: Vehicle) => {
    if (!pendingJob) return; // Guard clause

    const mappedVehicleType: Job['vehicleType'] = (() => {
      const upper = pendingJob.vehicleType.toUpperCase();
      if (upper.includes('VAN') || upper.includes('MPV')) return 'Van';
      if (upper.includes('TRUCK') || upper.includes('TRAILER')) return 'Truck';
      return pendingJob.bookingType === 'shipper' ? 'Truck' : 'Car';
    })();

    const jobToAssign: Job = {
      id: `JOB-${Date.now().toString().slice(-6)}`,
      title: `Manual Dispatch: ${pendingJob.vehicleType}`,
      from: pendingJob.pickup.address,
      to: pendingJob.dropoff.address,
      pickupCoordinates: { lat: pendingJob.pickup.lat, lng: pendingJob.pickup.lng },
      vehicleType: mappedVehicleType,
      status: 'Awaiting',
      createdAt: new Date().toISOString(),
      createdBy: {
        uid: 'manual-dispatch',
        name: 'Manual Dispatch',
      },
      requirements: {
        location: 'Riyadh',
        vehicleType: pendingJob.vehicleType,
        licenseValidity: true,
        insuranceValidity: true,
      },
    };

    const newJobId = assignJobToVehicle(vehicle.id, jobToAssign);
    if (newJobId) {
        toast({
            title: "Job Assigned",
            description: `Job ${newJobId} has been assigned to ${vehicle.driver.name}.`,
        });
        handleAssignJobSuccess(vehicle);
    } else {
        toast({
            variant: 'destructive',
            title: "Assignment Failed",
            description: 'Could not assign job. Please try again.',
        });
    }
  };


  // Effect to show job info popup and center map
  useEffect(() => {
    const handlePopupClose = () => {
        onVehicleSelect(null);
    };

    if (selectedVehicle && mapInstance.current) {
        if (!isTracking) {
             mapInstance.current.setView(selectedVehicle.position, mapInstance.current.getZoom(), {
                animate: true,
            });
        }

        if (popupRef.current) {
            popupRef.current.remove();
        }
        
        const popupContent = document.createElement('div');
        const root = createRoot(popupContent);
        
        root.render(<JobInfoPopup vehicle={selectedVehicle} onClose={handlePopupClose} onAssignSuccess={() => handleAssignJobSuccess(selectedVehicle)} />);
        
        const newPopup = L.popup({
            offset: [0, -16],
            closeButton: false,
            className: 'job-info-popup'
        })
        .setLatLng(selectedVehicle.position)
        .setContent(popupContent)
        .on('remove', handlePopupClose);

        newPopup.openOn(mapInstance.current);
        popupRef.current = newPopup;

    } else {
        if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
        }
    }
    
    return () => {
        if (popupRef.current) {
            popupRef.current.off('remove', handlePopupClose);
        }
    };

  }, [selectedVehicle, onVehicleSelect, router, isTracking]);


  // Update vehicle markers
  useEffect(() => {
    const markers = vehicleMarkersRef.current;
    if (!mapInstance.current) return;

    markers.clearLayers();
    
    vehicles.forEach(vehicle => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        const marker = L.marker(vehicle.position, { icon: getIcon(vehicle, isSelected) }).addTo(markers);
        
        if (showCallsigns) {
            marker.bindTooltip(vehicle.callsign, {
                direction: 'top',
                offset: [0, -16],
                className: 'callsign-tooltip',
            });
        }

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onVehicleSelect(vehicle);
          setContextMenu(null);
          setMapContextMenu(null);
        });
        
        marker.on('contextmenu', (e) => {
            L.DomEvent.stopPropagation(e);
            onVehicleSelect(vehicle);
            setContextMenu({ x: e.originalEvent.clientX, y: e.originalEvent.clientY, vehicle });
            setMapContextMenu(null);
        });
    });

  }, [vehicles, showCallsigns, selectedVehicle, onVehicleSelect]);

  // Update awaiting job markers
  useEffect(() => {
    const markers = awaitingJobMarkersRef.current;
    if (!mapInstance.current) return;

    markers.clearLayers();

    awaitingJobs.forEach(job => {
        if (job.pickupCoordinates) {
            const marker = L.marker([job.pickupCoordinates.lat, job.pickupCoordinates.lng], { icon: awaitingJobIcon }).addTo(markers);
            marker.bindPopup(`<b>Awaiting Allocation</b><br>Job: ${job.id}<br>Type: ${job.requirements.vehicleType}`);
        }
    });

  }, [awaitingJobs]);

   // Update incident markers
  useEffect(() => {
    const markers = incidentMarkersRef.current;
    if (!mapInstance.current) return;

    markers.clearLayers();
    if (showIncidents) {
        incidentData.forEach(incident => {
            L.marker(incident.position, { icon: incidentIcon })
                .addTo(markers)
                .bindPopup(`<b>${incident.type}</b><br>${incident.description}`);
        });
    }
  }, [showIncidents]);


  // Handle route display
  useEffect(() => {
    const routeLayer = routeLayerRef.current;
    const map = mapInstance.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (showRoutes && selectedVehicle?.job.plannedRoute) {
        const { plannedRoute, actualRoute } = selectedVehicle.job;

        if (plannedRoute.length > 0) {
            const plannedLine = L.polyline(plannedRoute, {
                color: 'red',
                weight: 3,
                dashArray: '5, 10'
            }).addTo(routeLayer);
            
            if (actualRoute && actualRoute.length > 0) {
                L.polyline(actualRoute, {
                    color: 'blue',
                    weight: 4,
                }).addTo(routeLayer);
            }

            L.marker(plannedRoute[0], { icon: plannedPickupIcon }).addTo(routeLayer).bindPopup('Planned Pickup');
            L.marker(plannedRoute[plannedRoute.length - 1], { icon: plannedDropoffIcon }).addTo(routeLayer).bindPopup('Planned Dropoff');
        }
    }
  }, [showRoutes, selectedVehicle]);


  // Handle Auto-Refresh
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoRefreshOn) {
        intervalId = setInterval(() => {
            toast({
                title: 'Refreshing Data...',
                description: 'Fetching latest vehicle locations.',
            });
        }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoRefreshOn, toast]);

  // Handle Find Nearest
  useEffect(() => {
    if (shouldFindNearest && mapInstance.current) {
        const mapCenter = mapInstance.current.getCenter();
        const nearestVehicle = vehicles.reduce<Vehicle | null>((nearest, vehicle) => {
            const distance = mapCenter.distanceTo(L.latLng(vehicle.position));
            if (!nearest) return vehicle;

            const nearestDistance = mapCenter.distanceTo(L.latLng(nearest.position));
            return distance < nearestDistance ? vehicle : nearest;
        }, null);

        if (nearestVehicle) {
            onVehicleSelect(nearestVehicle);
            mapInstance.current.setView(nearestVehicle.position, 13);
            toast({
                title: "Found Nearest Vehicle",
                description: `Highlighted ${nearestVehicle.callsign} as the closest to the map center.`
            })
        }
        setShouldFindNearest(false); // Reset the trigger
    }
  }, [shouldFindNearest, toast, setShouldFindNearest, vehicles, onVehicleSelect]);

  // Handle vehicle tracking
  const trackVehicle = useCallback(() => {
    if (isTracking && selectedVehicle && mapInstance.current) {
        mapInstance.current.panTo(selectedVehicle.position, { animate: true });
    }
  }, [isTracking, selectedVehicle]);

  useEffect(() => {
      trackVehicle();
  }, [trackVehicle, vehicles]); // Re-run when vehicles data updates


  return (
    <>
        <div ref={mapRef} className="h-full w-full z-0" />
        {contextMenu && (
            <VehicleContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                vehicle={contextMenu.vehicle}
                onClose={() => setContextMenu(null)}
                canAssignJob={!!pendingJob}
                onAssignJob={() => handleAssignJob(contextMenu.vehicle)}
            />
        )}
        {mapContextMenu && (
            <WhoWasHereDialog
                x={mapContextMenu.x}
                y={mapContextMenu.y}
                latlng={mapContextMenu.latlng}
                onClose={() => setMapContextMenu(null)}
            />
        )}
    </>
    );
};

export default Map;

