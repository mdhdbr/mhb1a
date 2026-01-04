

'use client';
import { useToast } from "@/hooks/use-toast";
import { useManualDispatchStore } from "@/stores/manual-dispatch-store";
import { useVehicleJobStore } from "@/stores/job-store";
import { Button } from "./ui/button";
import { X, Briefcase } from 'lucide-react';
import type { Vehicle } from "@/lib/types";

type Props = {
    vehicle: Vehicle;
    onClose: () => void;
    onAssignSuccess: (vehicle: Vehicle) => void;
}

const DetailRow = ({ label, value, isLink = false, isBold = false }: { label: string; value: string | null | undefined, isLink?: boolean, isBold?: boolean }) => (
    value ? (
        <tr>
            <td className="pr-4 font-semibold text-muted-foreground align-top">{label}:</td>
            <td className={isBold ? 'font-bold' : ''}>{isLink ? <a href="#" className="text-blue-600 hover:underline">{value}</a> : value}</td>
        </tr>
    ) : null
);

const eligibleEtaStatuses = ['POB-ON ROUTE', 'ON ROUTE TO PU', 'ARRIVE 5', 'ARRIVE 10', 'DROP 5', 'DROP 10', 'En Route to Dropoff'];


export default function JobInfoPopup({ vehicle, onClose, onAssignSuccess }: Props) {
    const { toast } = useToast();
    const { job, driver } = vehicle;
    const showEta = job?.status && eligibleEtaStatuses.includes(job.status);
    const hasJob = Boolean(job?.id);

    const { pendingJob } = useManualDispatchStore();
    const { assignJobToVehicle } = useVehicleJobStore();
    const isVehicleAvailable = vehicle.status === 'Idle' || (vehicle.job.status && ['Empty', 'Completed', 'Idle'].includes(vehicle.job.status));
    const canAssign = pendingJob && isVehicleAvailable;

    const handleAssignJob = () => {
        const newJobId = assignJobToVehicle(vehicle.id);
        if (newJobId) {
            toast({
                title: "Job Assigned",
                description: `Job ${newJobId} has been assigned to ${vehicle.driver.name}.`,
            });
            onClose();
            onAssignSuccess(vehicle); // Use the callback to navigate
        } else {
            toast({
                variant: 'destructive',
                title: "Assignment Failed",
                description: 'Could not assign job. Please try again.',
            });
        }
    };
    
    return (
        <div className="bg-background text-foreground rounded-lg w-72">
            <div className="p-3">
                <table className="text-sm w-full">
                    <tbody>
                        <DetailRow label="Job" value={hasJob ? `${job.id} / ${job.status}`: 'No active job'} isLink={hasJob} isBold />
                        <DetailRow label="Service" value={job?.service} />
                        <DetailRow label="Account" value={job?.account} />
                        <DetailRow label="Pickup" value={job?.pickup} />
                        <DetailRow label="Pickup date" value={job?.pickupDate} />
                        <DetailRow label="PAX" value={job?.pax} />
                        <DetailRow label="Driver" value={driver.name} />
                         {showEta && <DetailRow label="ETA" value={job.eta} />}
                    </tbody>
                </table>
                <div className="mt-4 space-y-2">
                     {canAssign && (
                        <Button onClick={handleAssignJob} className="w-full">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Assign Job to {driver.name}
                        </Button>
                    )}
                </div>
            </div>
             <button onClick={onClose} className="popup-close-button absolute top-1 right-1 p-1 rounded-full hover:bg-muted">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
