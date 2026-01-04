
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Star, 
    Power, 
    ClipboardCheck, 
    AlertTriangle, 
    Fuel, 
    Wrench,
    List,
    Car,
    Users,
    Clock,
    CheckCircle,
    Wifi,
    Briefcase,
    MapPin,
    Flag,
    Check,
    X,
    MessageSquare,
    Send,
    Phone,
    Route as RouteIcon,
    UserCheck as PobIcon,
    CircleCheck,
    DollarSign,
    Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PreTripChecklistDialog from '@/components/pre-trip-checklist-dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAlertStore } from '@/stores/alert-store';
import { Timestamp } from 'firebase/firestore';

const ActionButton = ({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }) => (
    <div className="flex flex-col items-center gap-2 text-center">
        <Button 
            variant="secondary" 
            size="lg" 
            className="h-16 w-full bg-primary/10 hover:bg-primary/20 text-primary disabled:bg-muted disabled:text-muted-foreground"
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
        </Button>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
);

const JobCard = ({ job }: { job: any }) => {
    const isPending = job.status === 'PENDING';
    const isCompleted = job.status === 'COMPLETED';
    
    return (
        <Card className="bg-secondary/50 border-border">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-foreground">{job.id}</p>
                    <Badge variant={isCompleted ? 'default' : 'destructive'} className={cn(isCompleted ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300')}>
                        {job.status}
                    </Badge>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {isPending ? <Car className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <span>{isPending ? job.vehicle : `${job.passengers} passengers`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPending ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                        <span>{job.time}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const IncomingJobCard = ({ job, onAccept, onReject }: { job: any, onAccept: () => void, onReject: () => void }) => {
    return (
        <Card className="bg-card shadow-lg border-primary/50 animate-in fade-in-50 slide-in-from-bottom-5">
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary"/>
                        <p className="text-lg font-bold">Next Job</p>
                    </div>
                    <Badge variant="default">ASSIGNED</Badge>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-blue-500"/>
                        <div>
                            <p className="text-muted-foreground">Pickup</p>
                            <p className="font-semibold">{job.pickup}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Flag className="h-4 w-4 mt-0.5 text-red-500"/>
                        <div>
                            <p className="text-muted-foreground">Dropoff</p>
                            <p className="font-semibold">{job.dropoff}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-around items-center text-center bg-secondary/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm font-semibold">{job.duration}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <RouteIcon className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm font-semibold">{job.distance}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm font-semibold">{job.pax}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button onClick={onAccept} className="bg-green-500 hover:bg-green-600 text-white h-11">
                        <Check className="mr-2 h-5 w-5"/>
                        Accept Job
                    </Button>
                    <Button onClick={onReject} variant="destructive" className="h-11">
                        <X className="mr-2 h-5 w-5"/>
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


const ReasonForm = ({ title, icon, onSend, onCancel }: { title: string, icon: React.ReactNode, onSend: (reason: string) => void, onCancel: () => void }) => {
    const [reason, setReason] = useState('');

    const handleSend = () => {
        onSend(reason);
    }
    
    return (
         <Card className="bg-card shadow-lg border-destructive/50 animate-in fade-in-50">
            <CardContent className="p-4 space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {icon}
                        <p className="text-lg font-bold">{title}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reason-input">Please provide a reason to send to the control panel.</Label>
                    <Textarea 
                        id="reason-input" 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Stuck in traffic, Personal emergency..."
                        rows={3}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button onClick={onCancel} variant="outline" className="h-11">Cancel</Button>
                    <Button onClick={handleSend} disabled={!reason} className="h-11">
                        <Send className="mr-2 h-4 w-4"/>
                        Send
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

const ActiveTripCard = ({ trip, onUpdateStatus }: { trip: any, onUpdateStatus: (newStatus: string) => void }) => {
    const stages = ['Accepted', 'En Route', 'Arrived', 'POB', 'Completed'];
    const currentStageIndex = stages.indexOf(trip.status);

    const updateStatusAndNotify = (newStatus: string) => {
        onUpdateStatus(newStatus);
    }

    const nextActions = [
        { label: "Start Trip (En Route)", icon: <RouteIcon />, newStatus: "En Route" },
        { label: "Mark as Arrived", icon: <MapPin />, newStatus: "Arrived" },
        { label: "Passenger on Board", icon: <PobIcon />, newStatus: "POB" },
        { label: "Complete Trip", icon: <CircleCheck />, newStatus: "Completed" },
    ];
    
    const currentAction = nextActions[currentStageIndex];

    return (
         <Card className="bg-card shadow-lg border-primary/50 animate-in fade-in-50">
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary"/>
                        <p className="text-lg font-bold">Active Trip</p>
                    </div>
                    <Badge variant="destructive" className="bg-orange-500 text-white border-orange-500">IN PROGRESS</Badge>
                </div>
                
                {/* Trip Progress Bar */}
                <div className="pt-2">
                    <div className="flex items-center justify-between">
                        {stages.map((stage, index) => (
                            <div key={stage} className="flex flex-col items-center flex-1 relative">
                               <div className="flex items-center w-full">
                                    {index > 0 && <div className={cn("flex-1 h-0.5", index <= currentStageIndex ? 'bg-primary' : 'bg-border')}></div>}
                                    
                                    <div className={cn("h-5 w-5 rounded-full flex items-center justify-center border-2", 
                                        index < currentStageIndex ? 'bg-primary border-primary' : 
                                        index === currentStageIndex ? 'bg-white border-primary' : 'bg-card border-border')}>
                                        {index < currentStageIndex && <Check className="h-3 w-3 text-primary-foreground" />}
                                        {index === currentStageIndex && <div className="h-2.5 w-2.5 bg-primary rounded-full"></div>}
                                    </div>

                                    {index < stages.length - 1 && <div className={cn("flex-1 h-0.5", index < currentStageIndex ? 'bg-primary' : 'bg-border')}></div>}
                               </div>
                                <p className={cn("text-xs mt-1.5", index <= currentStageIndex ? 'text-foreground' : 'text-muted-foreground')}>{stage}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 text-sm pt-3">
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 mt-0.5 text-blue-500"/>
                        <div>
                            <p className="text-muted-foreground">Passenger</p>
                            <p className="font-semibold text-base">{trip.passenger.name}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 mt-0.5 text-green-500"/>
                        <div>
                            <p className="text-muted-foreground">Contact</p>
                            <p className="font-semibold text-base">{trip.passenger.phone}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    {currentAction ? (
                        <Button className="w-full h-12 text-base" onClick={() => updateStatusAndNotify(currentAction.newStatus)}>
                           {currentAction.icon}
                           {currentAction.label}
                        </Button>
                    ) : (
                         <div className="text-center py-2">
                            <p className="text-muted-foreground">Trip is complete!</p>
                        </div>
                    )}
                    <Button variant="destructive" className="w-full h-11" onClick={() => updateStatusAndNotify('Cancelled')}>
                        <X className="mr-2 h-4 w-4"/> Cancel Trip
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function DriverDashboardPage() {
    const [isOnline, setIsOnline] = useState(false);
    const [isChecklistComplete, setIsChecklistComplete] = useState(false);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [incomingJob, setIncomingJob] = useState<any | null>(null);
    const [activeJob, setActiveJob] = useState<any | null>(null);
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [showCancelReason, setShowCancelReason] = useState(false);
    
    const [dutyStartTime, setDutyStartTime] = useState<number | null>(null);
    const [dutyHours, setDutyHours] = useState('0h 0m');
    const [dutyProgress, setDutyProgress] = useState(0);

    const { toast } = useToast();
    const router = useRouter();
    const { addAlert } = useAlertStore();

    useEffect(() => {
        let jobTimer: NodeJS.Timeout;
        if (isOnline && !incomingJob && !showRejectReason && !activeJob && !showCancelReason) {
            // Simulate receiving a job after 5 seconds
            jobTimer = setTimeout(() => {
                setIncomingJob({
                    pickup: 'King Fahd Road, Riyadh',
                    dropoff: 'King Abdullah Financial District',
                    duration: '12 min',
                    distance: '8.5 km',
                    pax: '3 pax',
                    fare: '45.00 SAR'
                });
            }, 5000);
        }
        return () => clearTimeout(jobTimer);
    }, [isOnline, incomingJob, showRejectReason, activeJob, showCancelReason]);
    
    useEffect(() => {
        let dutyTimer: NodeJS.Timeout;
        if (dutyStartTime) {
            dutyTimer = setInterval(() => {
                const elapsedSeconds = Math.floor((Date.now() - dutyStartTime) / 1000);
                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60);

                setDutyHours(`${hours}h ${minutes}m`);
                
                // Assuming an 8-hour shift for progress
                const totalDutySeconds = 8 * 60 * 60;
                setDutyProgress((elapsedSeconds / totalDutySeconds) * 100);

            }, 1000);
        }
        return () => clearInterval(dutyTimer);
    }, [dutyStartTime]);


    const jobs = [
        { id: '#JOB-20251202-001', status: 'PENDING', vehicle: 'Premium Sedan', time: '05:30 AM' },
        { id: '#JOB-20251201-089', status: 'COMPLETED', passengers: 3, time: 'Yesterday' },
    ];

    const handleCompleteChecklist = () => {
        setIsChecklistComplete(true);
        setIsChecklistOpen(false);
        toast({
            title: "Checklist Completed",
            description: "You are now ready to go online.",
        });
    };

    const handleGoOnlineToggle = (online: boolean) => {
        if (online && !isChecklistComplete) {
            toast({
                variant: 'destructive',
                title: 'Pre-Trip Check Required',
                description: 'Please complete the pre-trip safety checklist before going online.',
            });
            return;
        }
        setIsOnline(online);
        if (online) { // If going online
            setDutyStartTime(Date.now());
            setIncomingJob(null);
            setShowRejectReason(false);
            setActiveJob(null);
        } else { // If going offline
             setDutyStartTime(null);
        }
    };

    const handleAcceptJob = () => {
        toast({
            title: "Job Accepted!",
            description: "Navigating to job details...",
        });
        setActiveJob({
            status: 'Accepted',
            passenger: {
                name: 'Mohammed Al-Rashid',
                phone: '+966 50 XXX XXXX'
            },
            details: incomingJob // Store details from the alert
        });
        setIncomingJob(null);
    };

    const handleRejectJob = () => {
        setIncomingJob(null);
        setShowRejectReason(true);
    };

    const handleSendRejection = (reason: string) => {
        toast({
            title: "Reason Sent to Control Panel",
            description: "You will be available for the next job.",
        });
        setShowRejectReason(false);
    };

    const handleSendCancellation = (reason: string) => {
        toast({
            title: "Cancellation Reason Sent",
            description: "The trip has been cancelled. You will be available for the next job.",
        });
        setShowCancelReason(false);
        setActiveJob(null);
    }
    
    const handleUpdateJobStatus = (newStatus: string) => {
        if (newStatus === 'Completed') {
            setActiveJob(null);
            toast({
                title: `Trip ${newStatus}!`,
                description: 'Returning to search screen.',
            });
        } else if (newStatus === 'Cancelled') {
            setShowCancelReason(true);
        } else {
            setActiveJob((prev: any) => ({ ...prev, status: newStatus }));
            toast({
                title: `Trip status updated to: ${newStatus}`,
            });

            if (newStatus === 'Arrived') {
                toast({
                    title: "PAX Notified",
                    description: `SMS sent: Your booked vehicle (SA-12345) is waiting at the booked location.`
                });
            }
        }
    }

    const handleLogout = () => {
        toast({ title: 'Logging out...' });
        // In a real app, you would also clear auth state
        router.push('/login');
    };

    const handleOpenMap = () => {
        if (!activeJob) return;
        const { pickup, dropoff } = activeJob.details;
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&travelmode=driving`;
        window.open(mapsUrl, '_blank');
    };

    const handleReportIncident = () => {
        addAlert({
            alertId: `driver-sos-${Date.now()}`,
            type: 'sos_alert',
            severity: 'critical',
            status: 'active',
            message: 'Driver Ahmed has triggered an SOS alert. Immediate attention required.',
            icon: 'sos',
            triggeredAt: Timestamp.now(),
            source: 'driver',
        });
        toast({
            variant: "destructive",
            title: "SOS Alert Sent!",
            description: "Your emergency alert has been sent to the control center.",
        })
    };

    const isTripEnRouteOrLater = activeJob && ['En Route', 'Arrived', 'POB'].includes(activeJob.status);

    const renderActiveContent = () => {
        if (showCancelReason) {
            return (
                <ReasonForm
                    title="Reason for Cancellation"
                    icon={<MessageSquare className="h-5 w-5 text-destructive" />}
                    onSend={handleSendCancellation}
                    onCancel={() => setShowCancelReason(false)}
                />
            );
        }
        if (activeJob) {
            return <ActiveTripCard trip={activeJob} onUpdateStatus={handleUpdateJobStatus} />;
        }
        if (incomingJob) {
            return <IncomingJobCard job={incomingJob} onAccept={handleAcceptJob} onReject={handleRejectJob} />;
        }
        if (showRejectReason) {
            return (
                <ReasonForm
                    title="Reason for Rejection"
                    icon={<MessageSquare className="h-5 w-5 text-destructive" />}
                    onSend={handleSendRejection}
                    onCancel={() => setShowRejectReason(false)}
                />
            );
        }
        
        // This part is only rendered if online and no other modal/card is showing
        return (
            <div className="text-center py-10 space-y-4">
                <div className="relative inline-flex">
                    <Wifi className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground">Searching for jobs...</p>
                <p className="text-sm text-muted-foreground">You will be notified when a new job is available.</p>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {!activeJob ? (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-primary">
                                <AvatarImage src="/placeholder.svg" alt="Ahmed" />
                                <AvatarFallback className="bg-muted text-lg">A</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Ahmed</h1>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="font-semibold">4.7</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-1.5">
                                <Switch
                                    checked={isOnline}
                                    onCheckedChange={handleGoOnlineToggle}
                                    disabled={!isChecklistComplete}
                                    id="online-switch"
                                />
                                <Label htmlFor="online-switch" className={cn("text-xs font-medium", isOnline ? "text-green-600" : "text-muted-foreground")}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </Label>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <Power className="h-6 w-6 text-destructive" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <Button
                                variant="secondary"
                                size="lg"
                                className={cn(
                                    "h-16 w-full text-primary",
                                    isChecklistComplete ? "bg-green-100 hover:bg-green-200 text-green-800" : "bg-primary/10 hover:bg-primary/20"
                                )}
                                onClick={() => setIsChecklistOpen(true)}
                            >
                                {isChecklistComplete ? <CheckCircle /> : <ClipboardCheck />}
                            </Button>
                            <p className="text-xs font-medium text-muted-foreground">Pre-Trip Check</p>
                        </div>
                        <ActionButton icon={<AlertTriangle />} label="Report Incident" onClick={handleReportIncident} />
                        <ActionButton icon={<Fuel />} label="Request Fuel" disabled={!isChecklistComplete} />
                        <ActionButton icon={<Wrench />} label="Mechanic" disabled={!isChecklistComplete} />
                    </div>
                </>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-headline">Current Trip Details</CardTitle>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleOpenMap} 
                            disabled={!isTripEnRouteOrLater}
                            aria-label="Open navigation map"
                        >
                            <Map className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-0.5 text-blue-500"/>
                                <div>
                                    <p className="text-muted-foreground">Pickup</p>
                                    <p className="font-semibold">{activeJob.details.pickup}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Flag className="h-4 w-4 mt-0.5 text-red-500"/>
                                <div>
                                    <p className="text-muted-foreground">Dropoff</p>
                                    <p className="font-semibold">{activeJob.details.dropoff}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-around items-center text-center bg-secondary/50 rounded-lg p-2">
                             <div className="flex items-center gap-1.5">
                                <RouteIcon className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-sm font-semibold">{activeJob.details.distance}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-sm font-semibold">{activeJob.details.fare}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {isOnline ? (
                    renderActiveContent()
                ) : (
                    !activeJob && <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <List className="h-5 w-5 text-foreground" />
                            <h2 className="text-lg font-bold text-foreground">My Jobs</h2>
                        </div>
                        <div className="space-y-3">
                            {jobs.map(job => <JobCard key={job.id} job={job} />)}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Duty Hours</span>
                    </div>
                    <span>{dutyHours}</span>
                </div>
                <Progress value={dutyProgress} className="h-2 bg-muted" />
            </div>

            <PreTripChecklistDialog
                isOpen={isChecklistOpen}
                onClose={() => setIsChecklistOpen(false)}
                onComplete={handleCompleteChecklist}
            />
        </div>
    );
}
