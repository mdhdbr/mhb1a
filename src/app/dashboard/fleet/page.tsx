
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useVehicleJobStore } from "@/stores/job-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import type { Vehicle } from "@/lib/types";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Pencil } from 'lucide-react';
import ContextMenu from '@/components/context-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function FleetPage() {
  const { vehicles } = useVehicleJobStore();
  const [filter, setFilter] = useState('');
  const router = useRouter();

  const getVehicleStatus = (vehicle: Vehicle) => {
    return vehicle.job.status || vehicle.status || "Idle";
  };
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Idle':
        case 'Empty':
            return 'secondary';
        case 'Offline':
            return 'outline';
        case 'On Break':
        case 'Maintenance':
            return 'destructive';
        case 'Completed':
            return 'outline';
        // Active job statuses
        case 'On Duty':
        case 'En Route to Dropoff':
        case 'POB-ON ROUTE':
        case 'ON ROUTE TO PU':
        case 'Arrived':
        case 'Accepted':
        case 'Received':
        case 'At Drop-off Location':
            return 'default';
        default:
            return 'outline';
    }
  };
  
  const filteredVehicles = useMemo(() => {
    if (!filter) return vehicles;
    const lowercasedFilter = filter.toLowerCase();
    return vehicles.filter(vehicle => {
      const status = getVehicleStatus(vehicle);
      return (
        vehicle.licensePlate.toLowerCase().includes(lowercasedFilter) ||
        vehicle.vehicleType.toLowerCase().includes(lowercasedFilter) ||
        vehicle.make.toLowerCase().includes(lowercasedFilter) ||
        vehicle.model.toLowerCase().includes(lowercasedFilter) ||
        vehicle.capacity.toLowerCase().includes(lowercasedFilter) ||
        status.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [vehicles, filter]);

  const handleLocate = (vehicle: Vehicle) => {
    const [lat, lng] = vehicle.position as [number, number];
    router.push(`/dashboard/fleet-tracking?lat=${lat}&lng=${lng}`);
  };

  const handleEdit = (vehicle: Vehicle) => {
    router.push(`/dashboard/fleet/edit?id=${vehicle.id}`);
  };

  const VehicleContextMenu = ({ vehicle }: { vehicle: Vehicle }) => (
    <>
      <DropdownMenuItem onSelect={() => handleEdit(vehicle)}>
        <Pencil className="mr-2 h-4 w-4" />
        <span>Edit Vehicle</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handleLocate(vehicle)}>
        <MapPin className="mr-2 h-4 w-4" />
        <span>Locate on Map</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <p className="text-sm text-muted-foreground flex-1">This table displays vehicle information and is synchronized with the Data Management page.</p>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter vehicles..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>
        </div>
         <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Reg Num</TableHead>
                <TableHead className="hidden sm:table-cell">Vehicle Type</TableHead>
                <TableHead className="hidden lg:table-cell">Make</TableHead>
                <TableHead className="hidden lg:table-cell">Model</TableHead>
                <TableHead className="hidden sm:table-cell">Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                  const status = getVehicleStatus(vehicle);
                  return (
                      <TableRow key={vehicle.id}>
                        <ContextMenu menuItems={<VehicleContextMenu vehicle={vehicle}/>}>
                            <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                        </ContextMenu>
                        <ContextMenu menuItems={<VehicleContextMenu vehicle={vehicle}/>}>
                            <TableCell className="hidden sm:table-cell">{vehicle.vehicleType}</TableCell>
                        </ContextMenu>
                        <ContextMenu menuItems={<VehicleContextMenu vehicle={vehicle}/>}>
                            <TableCell className="hidden lg:table-cell">{vehicle.make}</TableCell>
                        </ContextMenu>
                        <ContextMenu menuItems={<VehicleContextMenu vehicle={vehicle}/>}>
                            <TableCell className="hidden lg:table-cell">{vehicle.model}</TableCell>
                        </ContextMenu>
                        <ContextMenu menuItems={<VehicleContextMenu vehicle={vehicle}/>}>
                            <TableCell className="hidden sm:table-cell">{vehicle.capacity}</TableCell>
                        </ContextMenu>
                        <ContextMenu menuItems={<VehicleContextMenu vehicle={vehicle}/>}>
                            <TableCell>
                              <Badge variant={getStatusVariant(status)}>
                                {status}
                              </Badge>
                            </TableCell>
                        </ContextMenu>
                      </TableRow>
                  );
                })}
                {filteredVehicles.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No vehicles found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
