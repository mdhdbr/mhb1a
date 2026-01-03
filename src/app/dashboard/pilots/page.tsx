
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { useDriverStore, StoredDriverData } from '@/stores/driver-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Power } from 'lucide-react';
import type { DriverData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ContextMenu from '@/components/context-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useVehicleJobStore } from '@/stores/job-store';

const getFatigueVariant = (level: 'Critical' | 'High' | 'Medium' | 'Low' | null): "destructive" | "secondary" | "default" => {
    if (!level) return 'default';
    switch (level) {
        case 'Critical':
        case 'High':
            return 'destructive';
        case 'Medium':
            return 'secondary';
        case 'Low':
        default:
            return 'default';
    }
}

const DutyHoursDisplay = ({ dutyStartTime }: { dutyStartTime: number | null | undefined }) => {
    const [dutyHours, setDutyHours] = useState('-');

    useEffect(() => {
        if (!dutyStartTime) {
            setDutyHours('-');
            return;
        }

        const formatDutyHours = () => {
            const elapsedSeconds = Math.floor((Date.now() - dutyStartTime) / 1000);
            if (elapsedSeconds < 0) return '0s';

            const hours = Math.floor(elapsedSeconds / 3600);
            const minutes = Math.floor((elapsedSeconds % 3600) / 60);
            const seconds = elapsedSeconds % 60;

            return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
        };

        setDutyHours(formatDutyHours()); // Initial set

        const timer = setInterval(() => {
            setDutyHours(formatDutyHours());
        }, 1000);

        return () => clearInterval(timer);
    }, [dutyStartTime]);

    return <>{dutyHours}</>;
};


export default function PilotsPage() {
  const { vehicles } = useVehicleJobStore();
  const { driverGridData, getFatigueLevel, setDutyStartTime } = useDriverStore();
  const [filter, setFilter] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'On Duty':
            return 'default';
        case 'Offline':
            return 'outline';
        default:
            return 'secondary';
    }
  }

  const filteredPilots = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    
    return driverGridData.filter(pilot => {
      if (!filter) return true;
      
      const fatigue = getFatigueLevel(pilot.dutyStartTime);

      return (
        pilot.name.toLowerCase().includes(lowercasedFilter) ||
        pilot.contactNumber.toLowerCase().includes(lowercasedFilter) ||
        pilot.dlNo.toLowerCase().includes(lowercasedFilter) ||
        pilot.allowedVehicles.toLowerCase().includes(lowercasedFilter) ||
        pilot.status.toLowerCase().includes(lowercasedFilter) ||
        (fatigue && fatigue.toLowerCase().includes(lowercasedFilter))
      );
    });
  }, [filter, driverGridData, getFatigueLevel]);
  
  const handleLocate = (pilot: StoredDriverData) => {
    const vehicle = vehicles.find(v => v.driver.name === pilot.name);
    if (vehicle) {
        const [lat, lng] = vehicle.position as [number, number];
        router.push(`/dashboard/fleet-tracking?lat=${lat}&lng=${lng}`);
    } else {
        toast({
            variant: "destructive",
            title: "Cannot Locate",
            description: `${pilot.name} is not currently assigned to a vehicle in the system.`
        });
    }
  };
  
  const handleToggleDuty = (dlNo: string, currentDutyStart: number | null | undefined) => {
    const pilot = driverGridData.find(d => d.dlNo === dlNo);
    if (!pilot) return;
  
    if (currentDutyStart) {
      setDutyStartTime(dlNo, null);
      toast({ title: "Duty Status Updated", description: `${pilot.name} is now Offline.` });
    } else {
      // Set to 13 hours ago to trigger CRITICAL fatigue for demonstration
      setDutyStartTime(dlNo, Date.now() - 13 * 60 * 60 * 1000);
      toast({ title: "Duty Status Updated", description: `${pilot.name} is now On Duty (and in CRITICAL fatigue state).` });
    }
  };
  
  const PilotContextMenu = ({ pilot }: { pilot: StoredDriverData }) => (
    <>
      <DropdownMenuItem onSelect={() => handleToggleDuty(pilot.dlNo, pilot.dutyStartTime)}>
        <Power className="mr-2 h-4 w-4" />
        <span>{pilot.dutyStartTime ? 'Go Offline' : 'Go On Duty'}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => handleLocate(pilot)}>
        <MapPin className="mr-2 h-4 w-4" />
        <span>Locate Pilot</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pilots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <p className="text-sm text-muted-foreground flex-1">This table displays pilot information and is synchronized with the Data Management page.</p>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter pilots..."
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
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Contact Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duty Hrs</TableHead>
                <TableHead>Fatigue Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPilots.map((pilot) => {
                  const fatigueLevel = getFatigueLevel(pilot.dutyStartTime);
                  return (
                    <ContextMenu key={pilot.dlNo} menuItems={<PilotContextMenu pilot={pilot} />}>
                      <TableRow>
                        <TableCell>{pilot.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{pilot.contactNumber}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(pilot.status)}>
                            {pilot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          <DutyHoursDisplay dutyStartTime={pilot.dutyStartTime} />
                        </TableCell>
                        <TableCell>
                            {fatigueLevel ? (
                                <Badge variant={getFatigueVariant(fatigueLevel)}>{fatigueLevel}</Badge>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                        </TableCell>
                      </TableRow>
                    </ContextMenu>
                  );
                })}
                 {filteredPilots.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No pilots found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
