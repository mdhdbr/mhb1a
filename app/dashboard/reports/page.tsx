
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { format, parse, isWithinInterval, isValid } from 'date-fns';
import { useVehicleJobStore } from '@/stores/job-store';
import { useIncidentStore } from '@/stores/incident-store';
import type { VehicleJob, IncidentReportData } from '@/lib/types';
import { exportJsonToExcel } from '@/lib/backup';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportJob extends VehicleJob {
    driverName: string;
    vehicleReg: string;
}

export default function ReportsPage() {
    const { vehicles } = useVehicleJobStore();
    const { incidents } = useIncidentStore();
    const { toast } = useToast();
    
    // Filters for Jobs
    const [jobDateRange, setJobDateRange] = useState({ start: '', startTime: '00:00', end: '', endTime: '23:59' });
    const [driverFilter, setDriverFilter] = useState('');
    const [jobIdFilter, setJobIdFilter] = useState('');
    const [accountFilter, setAccountFilter] = useState('');

    // Filters for Incidents
    const [incidentDateRange, setIncidentDateRange] = useState({ start: '', end: '' });
    const [incidentIdFilter, setIncidentIdFilter] = useState('');
    const [driverInvolvedFilter, setDriverInvolvedFilter] = useState('');
    const [vehicleInvolvedFilter, setVehicleInvolvedFilter] = useState('');


    const allJobs: ReportJob[] = useMemo(() => {
        return vehicles
            .filter(v => v.job.id) // Only include vehicles with active jobs
            .map(v => ({
                ...v.job,
                driverName: v.driver.name,
                vehicleReg: v.licensePlate,
            }));
    }, [vehicles]);
    
    const filteredJobs = useMemo(() => {
        let startDateTime: Date | null = null;
        let endDateTime: Date | null = null;
        
        if (jobDateRange.start && jobDateRange.startTime) {
            const parsed = parse(`${jobDateRange.start} ${jobDateRange.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
            if (isValid(parsed)) startDateTime = parsed;
        }

        if (jobDateRange.end && jobDateRange.endTime) {
            const parsed = parse(`${jobDateRange.end} ${jobDateRange.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
            if (isValid(parsed)) endDateTime = parsed;
        }


        return allJobs.filter(job => {
            if (startDateTime && endDateTime && job.pickupDate) {
                try {
                    const jobDate = parse(job.pickupDate, 'dd/MM/yyyy HH:mm', new Date());
                    if (!isValid(jobDate) || !isWithinInterval(jobDate, { start: startDateTime, end: endDateTime })) {
                        return false;
                    }
                } catch(e) { return false; }
            }
            if (driverFilter && !job.driverName.toLowerCase().includes(driverFilter.toLowerCase())) return false;
            if (jobIdFilter && job.id && !job.id.toLowerCase().includes(jobIdFilter.toLowerCase())) return false;
            if (accountFilter && job.account && !job.account.toLowerCase().includes(accountFilter.toLowerCase())) return false;

            return true;
        });
    }, [allJobs, jobDateRange, driverFilter, jobIdFilter, accountFilter]);

    const filteredIncidents = useMemo(() => {
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        
        if (incidentDateRange.start) {
            const parsed = parse(incidentDateRange.start, 'yyyy-MM-dd', new Date());
            if (isValid(parsed)) startDate = parsed;
        }
        if (incidentDateRange.end) {
            const parsed = parse(incidentDateRange.end, 'yyyy-MM-dd', new Date());
            if (isValid(parsed)) endDate = parsed;
        }

        return incidents.filter(incident => {
            if (startDate && endDate && incident.incidentDate) {
                try {
                    const incidentDate = parse(incident.incidentDate, 'yyyy-MM-dd', new Date());
                    if (!isValid(incidentDate) || !isWithinInterval(incidentDate, { start: startDate, end: endDate })) {
                        return false;
                    }
                } catch (e) { return false; }
            }
            if (incidentIdFilter && !incident.id.toLowerCase().includes(incidentIdFilter.toLowerCase())) return false;
            if (driverInvolvedFilter && !incident.driverInvolved.toLowerCase().includes(driverInvolvedFilter.toLowerCase())) return false;
            if (vehicleInvolvedFilter && !incident.vehicleInvolved.toLowerCase().includes(vehicleInvolvedFilter.toLowerCase())) return false;

            return true;
        });
    }, [incidents, incidentDateRange, incidentIdFilter, driverInvolvedFilter, vehicleInvolvedFilter]);


    const handleDownloadJobs = () => {
        if (filteredJobs.length === 0) {
            toast({ variant: "destructive", title: "Export Failed", description: "There is no job data to export for the current filter selection." });
            return;
        }
        const success = exportJsonToExcel(filteredJobs, 'Job_Report', 'Job_Report');
        if (success) {
            toast({ title: "Report Downloaded", description: "The job report has been successfully exported to Excel." });
        } else {
             toast({ variant: "destructive", title: "Export Failed", description: "An unexpected error occurred during job export." });
        }
    };
    
    const handleDownloadIncidents = () => {
        if (filteredIncidents.length === 0) {
            toast({ variant: "destructive", title: "Export Failed", description: "There is no incident data to export for the current filter selection." });
            return;
        }
        // We need to flatten the photos array for excel export
        const dataToExport = filteredIncidents.map(inc => ({...inc, photos: inc.photos.map(p => p.name).join(', ')}));
        const success = exportJsonToExcel(dataToExport, 'Incident_Report', 'Incident_Report');
        if (success) {
            toast({ title: "Report Downloaded", description: "The incident report has been successfully exported to Excel." });
        } else {
             toast({ variant: "destructive", title: "Export Failed", description: "An unexpected error occurred during incident export." });
        }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate Reports</CardTitle>
        <p className="text-muted-foreground pt-2">Filter records and download them as an Excel file.</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="jobs">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs">Jobs Report</TabsTrigger>
                <TabsTrigger value="incidents">Incidents Report</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="mt-4">
                <div className="p-4 border rounded-lg space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label>Start Date & Time</Label>
                            <div className="flex gap-2">
                                <Input type="date" value={jobDateRange.start} onChange={e => setJobDateRange(p => ({...p, start: e.target.value}))} />
                                <Input type="time" value={jobDateRange.startTime} onChange={e => setJobDateRange(p => ({...p, startTime: e.target.value}))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>End Date & Time</Label>
                             <div className="flex gap-2">
                                <Input type="date" value={jobDateRange.end} onChange={e => setJobDateRange(p => ({...p, end: e.target.value}))} />
                                <Input type="time" value={jobDateRange.endTime} onChange={e => setJobDateRange(p => ({...p, endTime: e.target.value}))} />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="driver-filter">Driver Name</Label>
                            <Input id="driver-filter" placeholder="e.g., Ali Ahmed" value={driverFilter} onChange={e => setDriverFilter(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="job-id-filter">Job ID</Label>
                            <Input id="job-id-filter" placeholder="e.g., JOB-001" value={jobIdFilter} onChange={e => setJobIdFilter(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-filter">Booking Ref / Pax</Label>
                            <Input id="account-filter" placeholder="e.g., ACME Corp or phone #" value={accountFilter} onChange={e => setAccountFilter(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                        <span>Filtered Jobs ({filteredJobs.length})</span>
                        <Button onClick={handleDownloadJobs} disabled={filteredJobs.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Jobs Report
                        </Button>
                    </h3>
                    <div className="border rounded-lg max-h-[50vh] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>Job ID</TableHead>
                                    <TableHead>Pickup Date</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Vehicle Reg</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Pax</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.length > 0 ? filteredJobs.map((job, index) => (
                                    <TableRow key={job.id && job.pickupDate ? `${job.id}-${job.pickupDate}-${index}` : index}>
                                        <TableCell className="font-medium">{job.id}</TableCell>
                                        <TableCell>{job.pickupDate}</TableCell>
                                        <TableCell>{job.driverName}</TableCell>
                                        <TableCell>{job.vehicleReg}</TableCell>
                                        <TableCell>{job.account}</TableCell>
                                        <TableCell>{job.pax}</TableCell>
                                        <TableCell>{job.status}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No jobs match the current filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="incidents" className="mt-4">
                 <div className="p-4 border rounded-lg space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" value={incidentDateRange.start} onChange={e => setIncidentDateRange(p => ({...p, start: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" value={incidentDateRange.end} onChange={e => setIncidentDateRange(p => ({...p, end: e.target.value}))} />
                        </div>
                    </div>
                    <Separator />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="incident-id-filter">Incident ID</Label>
                            <Input id="incident-id-filter" placeholder="e.g., INC-123456" value={incidentIdFilter} onChange={e => setIncidentIdFilter(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driver-involved-filter">Driver Involved</Label>
                            <Input id="driver-involved-filter" placeholder="e.g., Ali Ahmed" value={driverInvolvedFilter} onChange={e => setDriverInvolvedFilter(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-involved-filter">Vehicle Involved</Label>
                            <Input id="vehicle-involved-filter" placeholder="e.g., SA-12345" value={vehicleInvolvedFilter} onChange={e => setVehicleInvolvedFilter(e.target.value)} />
                        </div>
                    </div>
                </div>
                 <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                        <span>Filtered Incidents ({filteredIncidents.length})</span>
                        <Button onClick={handleDownloadIncidents} disabled={filteredIncidents.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Incidents Report
                        </Button>
                    </h3>
                    <div className="border rounded-lg max-h-[50vh] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>Incident ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Severity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIncidents.length > 0 ? filteredIncidents.map((incident) => (
                                    <TableRow key={incident.id}>
                                        <TableCell className="font-medium">{incident.id}</TableCell>
                                        <TableCell>{incident.incidentDate} {incident.incidentTime}</TableCell>
                                        <TableCell>{incident.driverInvolved}</TableCell>
                                        <TableCell>{incident.vehicleInvolved}</TableCell>
                                        <TableCell>{incident.incidentType}</TableCell>
                                        <TableCell>{incident.severity}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No incidents match the current filters.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
