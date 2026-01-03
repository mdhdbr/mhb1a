
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Truck, Caravan, MapPin, Sparkles, Map, Star, CreditCard } from 'lucide-react';
import type { Job, JobCreator } from '@/lib/types';
import { useAwaitingJobsStore } from '@/stores/awaiting-jobs-store';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useCustomerStore } from '@/stores/customer-store';
import { cn } from '@/lib/utils';
import { useAlertStore } from '@/stores/alert-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertIcon } from '@/components/alert-icon';
import ContextMenu from '@/components/context-menu';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const vehicleIcons: Record<string, React.ReactNode> = {
  Car: <Car className="h-4 w-4" />,
  Van: <Caravan className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
};

type SuggestedDriver = {
  driverId: string;
  name: string;
  suitabilityScore: number;
  reason: string;
  distance: number;
};

function JobAllocatorName({ createdBy }: { createdBy?: JobCreator }) {
  if (!createdBy || !createdBy.name) return <span>Unknown User</span>;
  return <span>{createdBy.name}</span>;
}

const RatingBadge = ({ customerName }: { customerName: string | null }) => {
    const { customers } = useCustomerStore();
    if (!customerName) return null;
    const customer = customers.find(c => c.name === customerName);
    const rating = customer?.rating || null;
    if (!rating) return null;
    
    const ratingClasses: Record<string, string> = {
        'Platinum': 'bg-purple-200 text-purple-800 border-purple-300',
        'Gold': 'bg-yellow-200 text-yellow-800 border-yellow-300',
        'Silver': 'bg-gray-300 text-gray-800 border-gray-400',
        'Bronze': 'bg-orange-200 text-orange-800 border-orange-300',
        'Blue': 'bg-blue-200 text-blue-800 border-blue-300',
    };

    return (
      <Badge variant="outline" className={cn("font-semibold", ratingClasses[rating] || '')}>
        <Star className="mr-1.5 h-3.5 w-3.5" />
        {rating}
      </Badge>
    );
};

export default function AwaitingAllocationPage() {
  const { awaitingJobs } = useAwaitingJobsStore();
  const { alerts } = useAlertStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedDriver[] | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();
  
  const getAlertForJob = (jobId: string) => alerts.find(alert => alert.jobId === jobId);

  const handleFindDriver = async (job: Job) => {
    setIsLoading(job.id);

    if (!job.pickupCoordinates) {
      toast({ variant: 'destructive', title: 'Error', description: 'Job is missing location data.' });
      setIsLoading(null);
      return;
    }

    // Simplified manual lookup: Redirect user to map near the job location
    toast({
      title: 'Opening Map',
      description: 'Locating nearby drivers for manual allocation.',
    });

    const { lat, lng } = job.pickupCoordinates;
    router.push(`/dashboard/fleet-tracking?lat=${lat}&lng=${lng}&from=dispatch`);
    
    setIsLoading(null);
  };

  const handleLookOnMap = () => {
    router.push('/dashboard/fleet-tracking');
    setSuggestions(null);
    setSelectedJob(null);
  };
  
  const formatBookingTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
        return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (e) {
        return 'Invalid Date';
    }
  };

  const menuItems = (job: Job) => (
    <DropdownMenuItem onSelect={() => handleFindDriver(job)} disabled={!!isLoading}>
        <Sparkles className="mr-2 h-4 w-4" />
        <span>Find Driver</span>
    </DropdownMenuItem>
  );

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Confirmed Jobs (Awaiting Allocation)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booked By</TableHead>
                <TableHead>Booked At</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Alerts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {awaitingJobs.map(job => {
                const jobAlert = getAlertForJob(job.id);
                return (
                  <TableRow key={job.id}>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell className="font-medium"><JobAllocatorName createdBy={job.createdBy} /></TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>{formatBookingTime(job.createdAt)}</TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>
                          {job.customerName ? (
                            <div className="flex flex-col gap-1.5">
                                <span className="font-medium">{job.customerName}</span>
                                <RatingBadge customerName={job.customerName} />
                            </div>
                          ) : 'N/A'}
                      </TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>
                        {job.paymentMethod ? (
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <div>
                                    <span className="font-semibold">{job.paymentMethod}</span>
                                    {job.paymentStatus === 'Paid' && (
                                        <p className="text-xs text-green-600 font-bold">Prepaid</p>
                                    )}
                              </div>
                            </div>
                        ) : 'N/A'}
                      </TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>{job.title}</TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{job.from}</span>
                          <span className="text-muted-foreground">to {job.to}</span>
                        </div>
                      </TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vehicleIcons[job.vehicleType] || <Car className="h-4 w-4" />}
                          {job.requirements.vehicleType}
                        </div>
                      </TableCell>
                    </ContextMenu>
                    <ContextMenu menuItems={menuItems(job)}>
                      <TableCell>
                          {jobAlert && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger><AlertIcon type={jobAlert.type as any} /></TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">{jobAlert.type}</p>
                                  <p>{jobAlert.hint || jobAlert.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                      </TableCell>
                    </ContextMenu>
                  </TableRow>
                )
              })}
              {awaitingJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No jobs awaiting allocation.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!suggestions} onOpenChange={() => { setSuggestions(null); setSelectedJob(null); }}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Suggested Drivers</DialogTitle>
                  <DialogDescription>Recommendations based on availability.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  {suggestions?.map(suggestion => (
                      <div key={suggestion.driverId} className="p-4 border rounded-lg">
                          <p className="font-bold">{suggestion.name}</p>
                          <p className="text-sm">{suggestion.reason}</p>
                      </div>
                  ))}
              </div>
          </DialogContent>
      </Dialog>
    </>
  );
}
