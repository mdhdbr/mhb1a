
'use client';
import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Search, MapPin, AlertTriangle } from 'lucide-react';
import type { Vehicle } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAlertStore } from '@/stores/alert-store';
import { AlertIconType } from '@/stores/alert-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertIcon } from '@/components/alert-icon';
import ContextMenu from '@/components/context-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function InProgressPage() {
  const { vehicles } = useVehicleJobStore();
  const { alerts } = useAlertStore();
  const [filter, setFilter] = useState('');
  const router = useRouter();

  const getAlertForJob = (jobId: string) => {
    return alerts.find(alert => alert.jobId === jobId);
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
  
  const filteredJobs = useMemo(() => {
    const activeJobs = vehicles.filter(vehicle => vehicle.job.id && vehicle.job.status !== 'Completed');
    if (!filter) return activeJobs;
    const lowercasedFilter = filter.toLowerCase();

    return activeJobs.filter(vehicle => {
      const { job, driver, licensePlate, vehicleType } = vehicle;
      return (
        (job.id && job.id.toLowerCase().includes(lowercasedFilter)) ||
        (job.service && job.service.toLowerCase().includes(lowercasedFilter)) ||
        (job.pickup && job.pickup.toLowerCase().includes(lowercasedFilter)) ||
        (job.pickupDate && job.pickupDate.toLowerCase().includes(lowercasedFilter)) ||
        (job.status && job.status.toLowerCase().includes(lowercasedFilter)) ||
        (driver.name && driver.name.toLowerCase().includes(lowercasedFilter)) ||
        (licensePlate && licensePlate.toLowerCase().includes(lowercasedFilter)) ||
        (vehicleType && vehicleType.toLowerCase().includes(lowercasedFilter))
      );
    });
  }, [vehicles, filter]);

  const handleLocate = (vehicle: Vehicle) => {
    const [lat, lng] = vehicle.position as [number, number];
    router.push(`/dashboard/fleet-tracking?lat=${lat}&lng=${lng}&vehicleId=${vehicle.id}`);
  };
  
  const JobContextMenu = ({ vehicle }: { vehicle: Vehicle }) => (
    <DropdownMenuItem onSelect={() => handleLocate(vehicle)}>
      <MapPin className="mr-2 h-4 w-4" />
      <span>Locate Vehicle</span>
    </DropdownMenuItem>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">In-progress Jobs</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <p className="text-sm text-muted-foreground flex-1">
                This table displays all active job assignments from the fleet.
            </p>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter jobs..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 h-11"
                />
            </div>
        </div>
        
        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {filteredJobs.map(vehicle => {
            const jobAlert = vehicle.job.id ? getAlertForJob(vehicle.job.id) : null;
            return (
              <Card key={vehicle.job.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg">{vehicle.job.id}</span>
                  <Badge variant={getStatusVariant(vehicle.job.status)}>{vehicle.job.status}</Badge>
                </div>
                 {jobAlert && (
                    <div className="flex items-center gap-2 text-destructive border-t pt-2">
                        <AlertIcon type={(jobAlert.icon as AlertIconType) || 'warning'} />
                        <p className="text-sm font-semibold">{jobAlert.hint || jobAlert.description}</p>
                    </div>
                 )}
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Driver:</span> {vehicle.driver.name}</p>
                  <p><span className="font-semibold text-foreground">Vehicle:</span> {vehicle.licensePlate}</p>
                  <p><span className="font-semibold text-foreground">Type:</span> {vehicle.vehicleType}</p>
                  <p><span className="font-semibold text-foreground">Pickup:</span> {vehicle.job.pickup}</p>
                  <p><span className="font-semibold text-foreground">Date:</span> {vehicle.job.pickupDate}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleLocate(vehicle)}>
                  <MapPin className="mr-2 h-4 w-4" /> Locate
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Pickup Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle Reg</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Alerts</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((vehicle) => {
                const jobAlert = vehicle.job.id ? getAlertForJob(vehicle.job.id) : null;
                return (
                  <ContextMenu key={vehicle.job.id} menuItems={<JobContextMenu vehicle={vehicle}/>}>
                    <TableRow>
                        <TableCell className="font-medium">{vehicle.job.id}</TableCell>
                        <TableCell>{vehicle.job.service}</TableCell>
                        <TableCell>{vehicle.job.pickup}</TableCell>
                        <TableCell>{vehicle.job.pickupDate}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(vehicle.job.status)}>{vehicle.job.status}</Badge>
                        </TableCell>
                        <TableCell>{vehicle.driver.name}</TableCell>
                        <TableCell>{vehicle.licensePlate}</TableCell>
                        <TableCell>{vehicle.vehicleType}</TableCell>
                        <TableCell>
                        {jobAlert && (
                            <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <AlertIcon type={(jobAlert.icon as AlertIconType) || 'warning'} />
                                </TooltipTrigger>
                                <TooltipContent>
                                <p className="font-semibold">{jobAlert.type}</p>
                                <p>{jobAlert.hint || jobAlert.description}</p>
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleLocate(vehicle)}>
                            <MapPin className="h-4 w-4" />
                            <span className="sr-only">Locate</span>
                        </Button>
                        </TableCell>
                    </TableRow>
                  </ContextMenu>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
              No active jobs found matching your filter.
          </div>
        )}

      </CardContent>
    </Card>
  );
}
