
'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VehicleResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Flag, Battery, WifiOff, Fuel } from 'lucide-react';
import { useState, useEffect } from 'react';

type Props = {
    vehicle: VehicleResult;
    isSelected: boolean;
    onSelect: () => void;
}

const getStatusClass = (status: VehicleResult['status']) => {
    switch (status) {
        case 'Empty for': return 'bg-green-500';
        case 'On Job': return 'bg-orange-500';
        case 'On Break': return 'bg-yellow-500';
        case 'Received': return 'bg-purple-500';
        default: return 'bg-gray-500';
    }
};

const DetailRow = ({ label, value, valueClassName }: { label: string, value?: string | number, valueClassName?: string }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("font-semibold", valueClassName)}>{value}</span>
        </div>
    )
}

export default function VehicleCard({ vehicle, isSelected, onSelect }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const fuelLevelDisplay = mounted ? `${vehicle.fuelLevel}%` : '--%';
  const speedDisplay = mounted ? vehicle.speed : '-- MPH';


  return (
    <Card 
        className={cn(
            "p-3 transition-all duration-200 cursor-pointer",
            isSelected ? "bg-blue-100 border-blue-400" : "bg-card"
        )}
        onClick={onSelect}
    >
        {!isSelected && (
             <div className="grid grid-cols-[1fr_auto] gap-x-3 text-sm">
                <div className="flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cn("h-3 w-3 rounded-full", getStatusClass(vehicle.status))} />
                        <span className="font-bold text-lg">{vehicle.callsign}</span>
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-semibold">{fuelLevelDisplay}</span>
                    </div>
                     <p className={cn("font-semibold", vehicle.status === 'Empty for' && 'text-green-600')}>{vehicle.status} {vehicle.statusDuration}</p>
                </div>

                <div className="text-right flex flex-col justify-between">
                    <p className="font-semibold">{vehicle.vehicleType}</p>
                    <p className="font-semibold text-muted-foreground">{vehicle.earnings}</p>
                </div>

                <div className="col-start-2 row-start-1 row-span-2 flex flex-col items-end justify-between ml-4">
                     <div className={cn("flex items-center gap-2 text-muted-foreground", vehicle.isShiftEndingSoon && "text-yellow-600 font-bold")}>
                        <Flag className="h-4 w-4" />
                        <span>{vehicle.shiftEnd} {vehicle.shiftDuration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className={cn(vehicle.isOverSpeeding && "text-red-500 font-bold")}>{speedDisplay}</span>
                        {vehicle.gpsStatus === 'unavailable' && <WifiOff className="h-4 w-4 text-red-500" />}
                        <Battery className="h-4 w-4" />
                        <span className="font-semibold">{mounted ? `${vehicle.batteryLevel}%` : '--%'}</span>
                    </div>
                </div>
            </div>
        )}

        {isSelected && (
            <div className="space-y-3">
                 <div className="grid grid-cols-[1fr_auto] gap-x-3 text-sm">
                    <div className="flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className={cn("h-3 w-3 rounded-full", getStatusClass(vehicle.status))} />
                            <span className="font-bold text-lg">{vehicle.callsign}</span>
                        </div>
                        <p className={cn("font-semibold", vehicle.status === 'Empty for' && 'text-green-600')}>{vehicle.status} {vehicle.statusDuration}</p>
                    </div>

                    <div className="text-right flex flex-col justify-between">
                        <p className="font-semibold">{vehicle.vehicleType}</p>
                         <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-400 py-1 px-3 self-end">{vehicle.licensePlate}</Badge>
                    </div>
                </div>

                <div>
                    <p className="font-bold">{vehicle.driverName}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.address}</p>
                </div>
                
                <div className="space-y-1 pt-2">
                    <DetailRow 
                        label="Shift End" 
                        value={`${vehicle.shiftEnd} (${vehicle.shiftDuration})`} 
                        valueClassName={vehicle.isShiftEndingSoon ? "text-yellow-600" : ""}
                    />
                    <DetailRow label="Earnings" value={vehicle.earnings} />
                    <DetailRow 
                        label="Speed" 
                        value={speedDisplay}
                        valueClassName={vehicle.isOverSpeeding ? "text-red-500" : ""}
                    />
                     {vehicle.gpsStatus === 'unavailable' && (
                        <DetailRow 
                            label="GPS" 
                            value={`No GPS, ${vehicle.gpsUnavailableTime}`}
                            valueClassName="text-red-500"
                        />
                    )}
                    <DetailRow label="Battery" value={mounted ? `${vehicle.batteryLevel}%` : '--%'} />
                    <DetailRow label="Fuel" value={fuelLevelDisplay} />
                    {vehicle.extras.length > 0 && (
                        <DetailRow label="Extras" value={vehicle.extras.join(', ')} />
                    )}
                    {vehicle.isSuspended && (
                        <DetailRow 
                            label="Suspension" 
                            value={`Auto-allocation suspended for ${vehicle.suspensionTime}`}
                            valueClassName="text-orange-600"
                        />
                    )}
                </div>
            </div>
        )}

    </Card>
  )
}
