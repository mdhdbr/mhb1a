
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Car, Clock, RefreshCw, Route, Search, Settings, Truck } from 'lucide-react';
import { useVehicleJobStore } from '@/stores/job-store';
import { useDriverStore, StoredDriverData } from '@/stores/driver-store';
import { useAwaitingJobsStore } from '@/stores/awaiting-jobs-store';
import type { Vehicle, Job, VehicleJob } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInHours } from 'date-fns';

type DriverWithVehicle = StoredDriverData & { vehicle: Vehicle | undefined };

const DriverCard = ({ driver, onJobClick }: { driver: DriverWithVehicle, onJobClick: (job: VehicleJob) => void }) => {
    const dutyHours = driver.dutyStartTime ? differenceInHours(new Date(), driver.dutyStartTime) : 0;
    const shiftHours = 8; // Mock shift length
    const overtimeHours = 2; // Mock overtime
    const totalShiftWidth = shiftHours + overtimeHours;

    const dutyPercentage = Math.min((dutyHours / totalShiftWidth) * 100, 100);

    return (
        <div className="flex border-b last:border-b-0">
            <div className="w-[280px] p-3 border-r shrink-0">
                <div className="flex items-center justify-between">
                    <div className="font-bold truncate">{driver.name}</div>
                    <div className="text-sm font-mono text-muted-foreground">{driver.vehicle?.callsign}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{driver.vehicle?.vehicleType}</div>
                <div className="mt-2 h-4 w-full bg-secondary rounded-full flex items-center">
                    <div style={{ width: `${dutyPercentage}%` }} className="bg-primary rounded-l-full h-2"></div>
                </div>
                 <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                    <span>{driver.dutyStartTime ? 'On Duty' : 'Offline'}</span>
                    <span>{dutyHours}h</span>
                </div>
            </div>
            <div className="flex-1 p-2">
                 {driver.vehicle?.job?.id ? (
                     <JobBlock job={driver.vehicle.job} onClick={() => onJobClick(driver.vehicle!.job)} />
                 ) : (
                     <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        Driver is Idle
                    </div>
                 )}
            </div>
        </div>
    )
}

const JobBlock = ({ job, isUnplanned = false, onClick }: { job: Job | VehicleJob, isUnplanned?: boolean, onClick?: () => void }) => {
    const jobTitle = 'title' in job ? job.title : job.service || 'Unnamed Job';
    const location = 'from' in job ? `${job.from} → ${job.to}` : `${job.pickup}`;
    const vehicleType = 'vehicleType' in job ? job.vehicleType : job.service;
    
    const [relativeTime, setRelativeTime] = useState<string | null>(null);

    useEffect(() => {
        if ('createdAt' in job && job.createdAt) {
          setRelativeTime(
            formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
          );
        }
    }, [job]);


    return (
        <Card 
            className={cn("p-2 cursor-pointer shadow-md", 
                isUnplanned ? "bg-card hover:bg-muted/50" : "bg-blue-50 hover:bg-blue-100"
            )}
            onClick={onClick}
        >
            <div className="font-bold text-sm flex items-center gap-2">
                {vehicleType === 'Car' ? <Car className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                <span className="truncate">{jobTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{location}</p>
            <div className="text-xs mt-2 flex items-center justify-between">
                <span className="font-mono text-primary font-semibold">{job.id}</span>
                {relativeTime && <span className="text-muted-foreground">{relativeTime}</span>}
            </div>
        </Card>
    );
};


export default function ContinuousSchedulerPage() {
    const { driverGridData } = useDriverStore();
    const { vehicles } = useVehicleJobStore();
    const { awaitingJobs } = useAwaitingJobsStore();

    const [sortBy, setSortBy] = useState('status');
    const [depotFilter, setDepotFilter] = useState('all');
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAutoRefresh, setIsAutoRefresh] = useState(false);
    const [selectedJob, setSelectedJob] = useState<VehicleJob | null>(null);

    const driversWithVehicles = useMemo((): DriverWithVehicle[] => {
        return driverGridData.map(driver => ({
            ...driver,
            vehicle: vehicles.find(v => v.driver.name === driver.name)
        }));
    }, [driverGridData, vehicles]);

    const filteredDrivers = useMemo(() => {
        let result = driversWithVehicles;
        // Mock depot filter
        if (depotFilter !== 'all') {
            result = result.slice(0, 5);
        }
        if (vehicleTypeFilter !== 'all') {
            result = result.filter(d => d.vehicle?.vehicleType.toLowerCase() === vehicleTypeFilter.toLowerCase());
        }
        if(statusFilter !== 'all') {
            const status = statusFilter.toLowerCase();
            result = result.filter(d => (d.vehicle?.job?.status.toLowerCase() === status) || (d.vehicle?.status.toLowerCase() === status));
        }
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(d => d.name.toLowerCase().includes(lowerQuery) || d.vehicle?.callsign.toLowerCase().includes(lowerQuery));
        }

        // Sorting
        if (sortBy === 'callsign') {
            result.sort((a, b) => a.vehicle?.callsign.localeCompare(b.vehicle?.callsign || '') || 0);
        } else if (sortBy === 'shift') {
            result.sort((a,b) => (a.dutyStartTime || Infinity) - (b.dutyStartTime || Infinity));
        }
        
        return result;
    }, [driversWithVehicles, depotFilter, vehicleTypeFilter, statusFilter, searchQuery, sortBy]);

    const vehicleTypes = useMemo(() => Array.from(new Set(vehicles.map(v => v.vehicleType))), [vehicles]);
    const vehicleStatuses = useMemo(() => Array.from(new Set(vehicles.flatMap(v => [v.status, v.job?.status]))).filter(Boolean), [vehicles]);

    const handleJobClick = (job: VehicleJob) => {
        setSelectedJob(job);
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Continuous Scheduler</h1>
                    <p className="text-muted-foreground mt-1">Live feed of drivers and jobs for real-time allocation.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="auto-refresh" checked={isAutoRefresh} onCheckedChange={() => setIsAutoRefresh(p => !p)} />
                        <Label htmlFor="auto-refresh">Auto-refresh</Label>
                    </div>
                    <Button variant="outline"><RefreshCw className={cn("mr-2 h-4 w-4", isAutoRefresh && "animate-spin")} /> Refresh</Button>
                    <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
                </div>
            </header>

            <ScrollArea className="flex-1 -mr-6 pr-6">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                    {/* Main Scheduler View */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Driver Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 flex-1 flex flex-col gap-2 overflow-hidden">
                            <div className="px-4 pb-2 space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search driver or callsign..." className="pl-10 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="status">Sort by Status</SelectItem><SelectItem value="shift">Sort by Shift Start</SelectItem><SelectItem value="callsign">Sort by Callsign</SelectItem></SelectContent></Select>
                                    <Select value={depotFilter} onValueChange={setDepotFilter}><SelectTrigger className="h-9"><SelectValue placeholder="All Depots" /></SelectTrigger><SelectContent><SelectItem value="all">All Depots</SelectItem><SelectItem value="dpt1">Riyadh Central</SelectItem></SelectContent></Select>
                                    <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}><SelectTrigger className="h-9"><SelectValue placeholder="All Vehicle Types" /></SelectTrigger><SelectContent><SelectItem value="all">All Vehicle Types</SelectItem>{vehicleTypes.map(vt => <SelectItem key={vt} value={vt}>{vt}</SelectItem>)}</SelectContent></Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-9"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{vehicleStatuses.map(vs => vs && <SelectItem key={vs} value={vs}>{vs}</SelectItem>)}</SelectContent></Select>
                                </div>
                            </div>

                            <ScrollArea className="border rounded-md flex-1 min-h-[400px]">
                                {filteredDrivers.map(driver => <DriverCard key={driver.dlNo} driver={driver} onJobClick={handleJobClick} />)}
                                {filteredDrivers.length === 0 && <div className="p-8 text-center text-muted-foreground">No drivers match filters.</div>}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Right Pane: Unplanned Jobs & Details */}
                    <div className="flex flex-col gap-4">
                        <Card className="flex-1 flex flex-col">
                            <CardHeader>
                                <CardTitle>Unplanned Jobs ({awaitingJobs.length})</CardTitle>
                                <CardDescription>Jobs awaiting allocation.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-2">
                            <ScrollArea className="h-full min-h-[200px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 p-2">
                                    {awaitingJobs.map(job => (
                                        <JobBlock key={job.id} job={job} isUnplanned />
                                    ))}
                                    {awaitingJobs.length === 0 && <div className="col-span-full text-center text-muted-foreground p-8">No jobs awaiting allocation.</div>}
                                </div>
                            </ScrollArea>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 flex flex-col">
                            <CardHeader>
                                <CardTitle>Job Details</CardTitle>
                                <CardDescription>Details of the selected job.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedJob ? (
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-semibold">ID:</span> {selectedJob.id}</p>
                                        <p><span className="font-semibold">Service:</span> {selectedJob.service}</p>
                                        <p><span className="font-semibold">Account:</span> {selectedJob.account}</p>
                                        <p><span className="font-semibold">Pickup:</span> {selectedJob.pickup}</p>
                                        <p><span className="font-semibold">Pickup Date:</span> {selectedJob.pickupDate}</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground p-8">Select a planned job to see details.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
