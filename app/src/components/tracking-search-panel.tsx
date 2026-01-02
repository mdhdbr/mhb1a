

'use client';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVehicleJobStore } from '@/stores/job-store';
import VehicleCard from './vehicle-card';
import type { Vehicle, VehicleResult } from '@/lib/types';
import VehicleCardContextMenu from './vehicle-card-context-menu';
import { ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type Props = {
    onVehicleSelect: (vehicle: VehicleResult | null) => void;
    onToggleVisibility: () => void;
}

const statusSortOrder = [
    'Empty for',
    'GoingHome', // Placeholder, not in data
    'Drop-10', // Placeholder
    'Drop-5', // Placeholder
    'POD', // Placeholder
    'POB', // Placeholder
    'Arrived', // Placeholder
    'POB-On Route', // Placeholder
    'Arrive-5', // Placeholder
    'Arrive-10', // Placeholder
    'On route to PU', // Placeholder
    'On Job', // Using "On Job" as a stand-in for active statuses
    'Accepted', // Placeholder
    'Received', // Placeholder
    'On Break',
    'Offline',
];

const mapVehicleToVehicleResult = (vehicle: Vehicle): VehicleResult => ({
    id: vehicle.id,
    callsign: vehicle.callsign,
    status: vehicle.job.status === 'Idle' || vehicle.job.status === 'Empty' ? 'Empty for' : vehicle.status,
    statusDuration: vehicle.job.dwellTime,
    vehicleType: vehicle.vehicleType.toUpperCase(),
    shiftEnd: '16:00', // Mock data
    shiftDuration: '6h 17m', // Mock data
    isShiftEndingSoon: false, // Mock data
    earnings: `${vehicle.driver.earnings.toFixed(2)} SAR`,
    speed: `${Math.floor(Math.random() * 60)} MPH`, // Mock data - this can cause hydration issues if not handled
    isOverSpeeding: false, // Mock data
    gpsStatus: 'ok', // Mock data
    batteryLevel: vehicle.telemetry.battery,
    fuelLevel: vehicle.telemetry.fuel,
    isSuspended: false, // Mock data
    driverName: vehicle.driver.name,
    driverPhone: vehicle.driver.phone,
    description: `${vehicle.make} ${vehicle.model}`,
    address: 'Mock Address, Riyadh', // Mock data
    licensePlate: vehicle.licensePlate,
    extras: [] // Mock data
});


const sortVehicles = (vehicles: VehicleResult[], sortBy: 'status' | 'callsign'): VehicleResult[] => {
    return [...vehicles].sort((a, b) => {
        if (sortBy === 'status') {
            const statusA = statusSortOrder.indexOf(a.status);
            const statusB = statusSortOrder.indexOf(b.status);

            const effectiveStatusA = statusA === -1 ? Infinity : statusA;
            const effectiveStatusB = statusB === -1 ? Infinity : statusB;
            
            if (effectiveStatusA !== effectiveStatusB) {
                return effectiveStatusA - effectiveStatusB;
            }
        }
        
        // Secondary sort by callsign
        return a.callsign.localeCompare(b.callsign, undefined, { numeric: true });
    });
};


export default function TrackingSearchPanel({ onVehicleSelect, onToggleVisibility }: Props) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; vehicle: VehicleResult } | null>(null);
  const [sortBy, setSortBy] = useState<'status' | 'callsign'>('status');

  const { vehicles } = useVehicleJobStore();
  const [vehicleResults, setVehicleResults] = useState<VehicleResult[]>([]);

  useEffect(() => {
    // Generate results on client to avoid hydration mismatch from random data
    setVehicleResults(vehicles.map(mapVehicleToVehicleResult));
  }, [vehicles]);


  const handleContextMenu = (event: React.MouseEvent, vehicle: VehicleResult) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, vehicle });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleSelect = (vehicle: VehicleResult) => {
      setSelectedVehicleId(vehicle.id);
      onVehicleSelect(vehicle);
  }
  
  const sortedVehicles = sortVehicles(vehicleResults, sortBy);


  return (
    <div className="bg-card flex flex-col h-full overflow-hidden">
       <div className="p-2 border-b flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-2">
                 <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="outline" size="sm" className="h-8">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                       <div className="space-y-4">
                            <div>
                                <h4 className="font-medium leading-none">Filters</h4>
                                <p className="text-sm text-muted-foreground">
                                    Refine the vehicles shown on the map.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Select><SelectTrigger><SelectValue placeholder="Depots" /></SelectTrigger><SelectContent><SelectItem value="all">All Depots</SelectItem></SelectContent></Select>
                                <Select><SelectTrigger><SelectValue placeholder="Vehicle type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem></SelectContent></Select>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="empty">Empty</SelectItem>
                                        <SelectItem value="on_job">On Job</SelectItem>
                                        <SelectItem value="on_break">On Break</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="callsign">Callsign</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleVisibility}>
                <ChevronRight className="h-5 w-5" />
            </Button>
       </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
            {sortedVehicles.map(vehicle => (
                <div key={vehicle.id} onContextMenu={(e) => handleContextMenu(e, vehicle)}>
                    <VehicleCard 
                        vehicle={vehicle}
                        isSelected={selectedVehicleId === vehicle.id}
                        onSelect={() => handleSelect(vehicle)}
                    />
                </div>
            ))}
             {sortedVehicles.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    No vehicles found.
                </div>
             )}
        </div>
      </ScrollArea>
       {contextMenu && (
        <VehicleCardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          vehicle={contextMenu.vehicle}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
}
