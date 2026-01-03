

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import L, { Map as LeafletMap, Marker, LatLng, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { OpenStreetMapProvider, SearchResult } from 'leaflet-geosearch';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Check, Search, GripVertical } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

// Fix for default Leaflet icon issue with webpack
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

const createCustomIcon = (color: 'blue' | 'red') => new Icon({
    iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const pickupIcon = createCustomIcon('blue');
const dropoffIcon = createCustomIcon('red');

type LocationState = { lat: number, lng: number, address: string };
type SelectionMode = 'pickup' | 'dropoff' | null;

const LocationSearchInput = ({ onResultSelect, placeholder, value, onChange, onFocus }: { onResultSelect: (result: SearchResult<any>) => void; placeholder?: string, value: string, onChange: (value: string) => void, onFocus: () => void }) => {
    const [results, setResults] = useState<SearchResult<any>[]>([]);
    const provider = useRef(new OpenStreetMapProvider());
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery) {
            setResults([]);
            return;
        }
        const searchResults = await provider.current.search({ query: searchQuery });
        setResults(searchResults);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        onChange(newQuery);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            handleSearch(newQuery);
        }, 500); // 500ms debounce
    };

    const handleSelect = (result: SearchResult<any>) => {
        onResultSelect(result);
        setResults([]);
        onChange(result.label);
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                    placeholder={placeholder || "Search or pin on map..."}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={onFocus}
                    className="pl-6 h-7 text-xs"
                />
            </div>
            {results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className="p-2 cursor-pointer hover:bg-muted text-sm"
                            onClick={() => handleSelect(result)}
                        >
                            {result.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function CustomerLocationPickerMap() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<LeafletMap | null>(null);
    const pickupMarker = useRef<Marker | null>(null);
    const dropoffMarker = useRef<Marker | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const [pickupLocation, setPickupLocation] = useState<LocationState | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<LocationState | null>(null);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

    const [pickupQuery, setPickupQuery] = useState('');
    const [dropoffQuery, setDropoffQuery] = useState('');
    
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const canConfirm = pickupLocation && dropoffLocation;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        
        const dragHandle = (e.target as HTMLElement).closest('[data-drag-handle]');
        if (!dragHandle) {
            return;
        }

        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - offset.x,
                y: e.clientY - offset.y
            });
        }
    }, [isDragging, offset]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove]);
    

    // Initialize locations from URL params
    useEffect(() => {
        const pLat = searchParams.get('pickupLat');
        const pLng = searchParams.get('pickupLng');
        const pAddr = searchParams.get('pickupAddress');
        if (pLat && pLng && pAddr) {
            const location = { lat: parseFloat(pLat), lng: parseFloat(pLng), address: pAddr };
            setPickupLocation(location);
            setPickupQuery(pAddr);
        }
        
        const dLat = searchParams.get('dropoffLat');
        const dLng = searchParams.get('dropoffLng');
        const dAddr = searchParams.get('dropoffAddress');
        if (dLat && dLng && dAddr) {
            const location = { lat: parseFloat(dLat), lng: parseFloat(dLng), address: dAddr };
            setDropoffLocation(location);
            setDropoffQuery(dAddr);
        }
    }, [searchParams]);

    const handleConfirm = () => {
        if (!pickupLocation || !dropoffLocation) return;
        
        const params = new URLSearchParams();
        params.set('pickupAddress', pickupLocation.address);
        params.set('pickupLat', pickupLocation.lat.toString());
        params.set('pickupLng', pickupLocation.lng.toString());
        params.set('dropoffAddress', dropoffLocation.address);
        params.set('dropoffLat', dropoffLocation.lat.toString());
        params.set('dropoffLng', dropoffLocation.lng.toString());
        
        router.push(`/customer/dashboard?${params.toString()}`);
    };

    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationState> => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            return { lat, lng, address };
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            return { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
        }
    }, []);

    const setLocationFromMapClick = useCallback(async (e: L.LeafletMouseEvent) => {
        const location = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        if (selectionMode === 'pickup') {
            setPickupLocation(location);
            setPickupQuery(location.address);
        } else if (selectionMode === 'dropoff') {
            setDropoffLocation(location);
            setDropoffQuery(location.address);
        }
        setSelectionMode(null); // End selection mode after one click
    }, [selectionMode, reverseGeocode]);
    
    const handleSetOnMap = (type: 'pickup' | 'dropoff') => {
        setSelectionMode(type);
        if (mapInstance.current) {
            mapInstance.current.getContainer().style.cursor = 'crosshair';
        }
    };

    const setLocationFromSearchResult = (result: SearchResult<any>, type: 'pickup' | 'dropoff') => {
        const location = { lat: result.y, lng: result.x, address: result.label };
        if (type === 'pickup') {
            setPickupLocation(location);
            setPickupQuery(location.address);
        } else {
            setDropoffLocation(location);
            setDropoffQuery(location.address);
        }
        if (mapInstance.current) {
            mapInstance.current.setView([result.y, result.x], 13);
        }
    }
    
    const handleMarkerDrag = async (e: L.DragEndEvent, type: 'pickup' | 'dropoff') => {
        const latlng = e.target.getLatLng();
        const location = await reverseGeocode(latlng.lat, latlng.lng);
         if (type === 'pickup') {
            setPickupLocation(location);
            setPickupQuery(location.address);
        } else {
            setDropoffLocation(location);
            setDropoffQuery(location.address);
        }
    };


    // Effect for initializing the map
    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            const saudiBounds = L.latLngBounds(L.latLng(16.3, 34.5), L.latLng(32.1, 55.7));
            mapInstance.current = L.map(mapRef.current, {
                center: [24.7136, 46.6753], // Riyadh, KSA
                zoom: 6,
                minZoom: 6,
                maxBounds: saudiBounds,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);

            L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
        }
    }, []);

     // Effect for handling map clicks during selection mode
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        if (selectionMode) {
            map.on('click', setLocationFromMapClick);
             map.getContainer().style.cursor = 'crosshair';
        } else {
            map.getContainer().style.cursor = '';
        }

        return () => {
            map.off('click', setLocationFromMapClick);
        };
    }, [selectionMode, setLocationFromMapClick]);
    
    // Effect for managing markers and view
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        // Manage Pickup Marker
        if (pickupLocation) {
            if (pickupMarker.current) {
                pickupMarker.current.setLatLng([pickupLocation.lat, pickupLocation.lng]);
            } else {
                pickupMarker.current = L.marker([pickupLocation.lat, pickupLocation.lng], { icon: pickupIcon, draggable: true }).addTo(map);
                pickupMarker.current.on('dragend', (e) => handleMarkerDrag(e, 'pickup'));
            }
        } else if (pickupMarker.current) {
            pickupMarker.current.remove();
            pickupMarker.current = null;
        }

        // Manage Dropoff Marker
        if (dropoffLocation) {
             if (dropoffMarker.current) {
                dropoffMarker.current.setLatLng([dropoffLocation.lat, dropoffLocation.lng]);
            } else {
                dropoffMarker.current = L.marker([dropoffLocation.lat, dropoffLocation.lng], { icon: dropoffIcon, draggable: true }).addTo(map);
                dropoffMarker.current.on('dragend', (e) => handleMarkerDrag(e, 'dropoff'));
            }
        } else if (dropoffMarker.current) {
            dropoffMarker.current.remove();
            dropoffMarker.current = null;
        }

        // Adjust map view
        const markersToShow = [pickupLocation, dropoffLocation].filter(Boolean) as LocationState[];
        if (markersToShow.length > 1) {
            const bounds = L.latLngBounds(markersToShow.map(l => [l.lat, l.lng]));
            map.fitBounds(bounds, { padding: [70, 70] });
        } else if (markersToShow.length === 1) {
            map.setView([markersToShow[0].lat, markersToShow[0].lng], 13);
        }

    }, [pickupLocation, dropoffLocation, handleMarkerDrag]);

    return (
        <div className="h-full w-full relative">
            <div ref={mapRef} className="h-full w-full z-0" />
            <div
                ref={cardRef}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-lg"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }}
            >
                <Card
                    className="shadow-lg bg-background/80 backdrop-blur-sm cursor-move"
                    onMouseDown={handleMouseDown}
                >
                    <CardContent className="p-2 flex items-center gap-2">
                        <div
                            data-drag-handle
                            className="p-1 self-stretch flex items-center rounded-l-md"
                            title="Drag to move"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                         <div className="flex-1 space-y-1">
                            <Label className={cn("font-semibold text-[10px] pl-1", selectionMode === 'pickup' && "text-blue-600 animate-pulse")}>Pickup</Label>
                            <LocationSearchInput 
                                value={pickupQuery}
                                onChange={setPickupQuery}
                                onFocus={() => handleSetOnMap('pickup')}
                                onResultSelect={(result) => setLocationFromSearchResult(result, 'pickup')}
                            />
                        </div>

                        <div className="flex-1 space-y-1">
                            <Label className={cn("font-semibold text-[10px] pl-1", selectionMode === 'dropoff' && "text-red-600 animate-pulse")}>Dropoff</Label>
                            <LocationSearchInput 
                                value={dropoffQuery}
                                onChange={setDropoffQuery}
                                onFocus={() => handleSetOnMap('dropoff')}
                                onResultSelect={(result) => setLocationFromSearchResult(result, 'dropoff')}
                            />
                        </div>
                        
                        <div className="flex items-end h-full pb-1">
                            <Button onClick={handleConfirm} disabled={!canConfirm} size="sm" className="h-7 px-3">
                                <Check className="mr-1.5 h-4 w-4" />
                                OK
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
