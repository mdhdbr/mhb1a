
'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Car,
  User,
  LogOut,
  Phone,
  MessageSquare,
  Ban,
  Clock,
  History,
  UserCog,
  Briefcase,
  FileText,
} from 'lucide-react';
import type { VehicleResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import ActivityReportDialog from './activity-report-dialog';

type Props = {
  x: number;
  y: number;
  vehicle: VehicleResult;
  onClose: () => void;
};

export default function VehicleCardContextMenu({ x, y, vehicle, onClose }: Props) {
  const { toast } = useToast();
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isActivityReportOpen, setActivityReportOpen] = useState(false);
  const [activityReportType, setActivityReportType] = useState<'vehicle' | 'driver' | null>(null);

  const handleCallDriver = () => {
    if (vehicle.driverPhone) {
        window.location.href = `tel:${vehicle.driverPhone}`;
    } else {
        toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: 'Driver phone number is not available.',
        });
    }
    onClose();
  };

  const handleSendMessage = () => {
     if (vehicle.driverPhone) {
        window.location.href = `sms:${vehicle.driverPhone}`;
    } else {
        toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: 'Driver phone number is not available.',
        });
    }
    onClose();
  };
  
  const handleForceLogout = () => {
    setLogoutConfirmOpen(false);
    toast({
      title: 'Driver Logged Out',
      description: `${vehicle.driverName} has been forced to log out.`,
    });
    onClose();
  }

  const handleShowActivity = (type: 'vehicle' | 'driver') => {
    setActivityReportType(type);
    setActivityReportOpen(true);
    onClose();
  };

  const handleGenericAction = (action: string) => {
    toast({
      title: 'Action Triggered (Demo)',
      description: `${action} for vehicle ${vehicle.callsign}`,
    });
    onClose();
  };

  const suspensionTimes = [
    { label: 'Next 5 min', value: 5 },
    { label: 'Next 15 min', value: 15 },
    { label: 'Next 30 min', value: 30 },
    { label: 'Next hour', value: 60 },
    { label: 'Next 2 hours', value: 120 },
    { label: 'Next 4 hours', value: 240 },
  ];

  return (
    <>
      <DropdownMenu open onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DropdownMenuContent
          className="w-64 fixed"
          style={{ top: y, left: x }}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="flex items-center gap-2">
            <Car className="mr-2 h-4 w-4" />
            <span>Vehicle: {vehicle.callsign}</span>
          </DropdownMenuLabel>
          <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground">
             <User className="mr-2 h-4 w-4" />
             <span>Driver: {vehicle.driverName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={() => setLogoutConfirmOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Force Logout Driver</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleCallDriver}>
            <Phone className="mr-2 h-4 w-4" />
            <span>Call Driver</span>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleSendMessage}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Send Message</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Ban className="mr-2 h-4 w-4" />
              <span>Suspend Auto-Allocation</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                {suspensionTimes.map(time => (
                    <DropdownMenuItem key={time.value} onSelect={() => handleGenericAction(`Suspend for ${time.label}`)}>
                        <span>{time.label}</span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleGenericAction('Cancel Suspension')}>
                    <span>Cancel Suspension</span>
                </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem onSelect={() => handleGenericAction('Change Shift End')}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Change Shift End</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => handleShowActivity('vehicle')}>
            <History className="mr-2 h-4 w-4" />
            <span>Show vehicle activity</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleShowActivity('driver')}>
            <History className="mr-2 h-4 w-4" />
            <span>Show driver activity</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleGenericAction('Open Vehicle Profile')}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Open Vehicle Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleGenericAction('Open Driver Profile')}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Open Driver Profile</span>
          </DropdownMenuItem>
           <DropdownMenuItem onSelect={() => handleGenericAction('Open Reports')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

       <AlertDialog open={isLogoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Force Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to force logout driver {vehicle.driverName} ({vehicle.callsign})? The driver will be logged out and their status will change to Offline.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={handleForceLogout}>Yes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {activityReportType && (
            <ActivityReportDialog
                isOpen={isActivityReportOpen}
                onClose={() => setActivityReportOpen(false)}
                type={activityReportType}
                vehicle={vehicle}
            />
        )}
    </>
  );
}
