
'use client';

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
} from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type Props = {
  x: number;
  y: number;
  vehicle: Vehicle;
  onClose: () => void;
  canAssignJob: boolean;
  onAssignJob: () => void;
};

export default function VehicleContextMenu({ x, y, vehicle, onClose, canAssignJob, onAssignJob }: Props) {
  const { toast } = useToast();
  const isVehicleAvailable = vehicle.status === 'Idle' || (vehicle.job.status && ['Empty', 'Completed', 'Idle'].includes(vehicle.job.status));


  const handleCallDriver = () => {
    if (vehicle.driver.phone) {
        window.location.href = `tel:${vehicle.driver.phone}`;
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
     if (vehicle.driver.phone) {
        window.location.href = `sms:${vehicle.driver.phone}`;
    } else {
        toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: 'Driver phone number is not available.',
        });
    }
    onClose();
  };

  const handleGenericAction = (action: string) => {
    toast({
      title: 'Action Triggered (Demo)',
      description: `${action} for vehicle ${vehicle.callsign}`,
    });
    onClose();
  };

  return (
    <DropdownMenu open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DropdownMenuContent
        className="w-64 fixed"
        style={{ top: y, left: x }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Car className="mr-2 h-4 w-4" />
          <span>{vehicle.callsign}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
         <DropdownMenuItem onSelect={onAssignJob} disabled={!canAssignJob || !isVehicleAvailable}>
          <Briefcase className="mr-2 h-4 w-4" />
          <span>Assign Job</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
            <User className="mr-2 h-4 w-4" />
            <span>Driver Actions</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => handleGenericAction('Force Logout')}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Force Logout</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleGenericAction('Change Shift End')}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Change Shift End</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Job Actions</span>
          </DropdownMenuSubTrigger>
           <DropdownMenuSubContent>
             <DropdownMenuItem onSelect={() => handleGenericAction('Suspend Auto-Allocation')}>
                <Ban className="mr-2 h-4 w-4" />
                <span>Suspend Auto-Allocation</span>
              </DropdownMenuItem>
           </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => handleGenericAction('Show Vehicle/Driver Activity')}>
          <History className="mr-2 h-4 w-4" />
          <span>Show Activity</span>
        </DropdownMenuItem>
         <DropdownMenuItem onSelect={() => handleGenericAction('Open Profile')}>
          <UserCog className="mr-2 h-4 w-4" />
          <span>Open Profile</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
