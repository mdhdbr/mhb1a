
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowDown, ChevronLeft } from 'lucide-react';
import { format, subDays, addDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { VehicleResult, Activity, Booking, Break } from '@/lib/types';
import { activityReportData, bookingExample, breakExample } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type: 'vehicle' | 'driver';
  vehicle: VehicleResult;
};

type ActivityItemType = 'booking' | 'activity' | 'break';

const ActivityItem = ({ activity, type, onClick }: { activity: Activity | Booking | Break, type: ActivityItemType, onClick: () => void }) => {
    
    const baseClasses = "p-3 border-t cursor-pointer hover:bg-muted/80";

    if (type === 'booking') {
        const booking = activity as Booking;
        return (
            <div className={cn(baseClasses, "bg-blue-100/50 border-blue-200")} onClick={onClick}>
                <p className="font-bold">{booking.startTime} - {booking.endTime}, Booking number: {booking.bookingNumber}</p>
                <div className="text-sm text-muted-foreground mt-2 pl-4">
                    <p>{booking.pickupLocation}</p>
                    <p>{booking.dropoffLocation}</p>
                </div>
            </div>
        )
    }

     if (type === 'break') {
        const breakActivity = activity as Break;
        return (
            <div className={cn(baseClasses, "bg-yellow-100/50 border-yellow-200")} onClick={onClick}>
                <p className="font-bold">{breakActivity.startTime} - {breakActivity.endTime} (Break)</p>
                 <div className="text-sm text-muted-foreground mt-2 pl-4">
                    <p>Driver: {breakActivity.driverCallsign}</p>
                    <p>Duration: {breakActivity.duration}</p>
                </div>
            </div>
        )
    }
    
    const regularActivity = activity as Activity;
    return (
        <div className={cn(baseClasses)} onClick={onClick}>
            <p className="font-semibold">{regularActivity.startTime} - {regularActivity.endTime}</p>
        </div>
    )
}

export default function ActivityReportDialog({ isOpen, onClose, type, vehicle }: Props) {
  const [date, setDate] = useState<Date>(subDays(new Date(), 1));
  const { toast } = useToast();

  const reportTitle = type === 'vehicle' ? vehicle.licensePlate : vehicle.driverName;
  
  const handleActivityClick = (time: string) => {
    onClose();
    toast({
        title: 'Map Updated',
        description: `Showing route for activity at ${time}.`,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 flex flex-col h-[90vh]">
        <div className="p-4 bg-secondary/50">
            <div className="flex items-center justify-between mb-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                    <ChevronLeft className="mr-2 h-4 w-4"/>
                    Back
                </Button>
                <h2 className="text-lg font-bold">{reportTitle}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{vehicle.address}</p>
            <div className="flex items-center justify-between mt-2 text-sm">
                <div className="flex items-center gap-1">
                    <ArrowDown className="h-4 w-4" />
                    <span>{vehicle.speed}</span>
                </div>
                <span className="text-muted-foreground">{format(new Date(), "HH:mm")}</span>
            </div>
        </div>
        
        <div className="p-4 border-b">
             <div className="flex items-center justify-between">
                <Label htmlFor="trips-on" className="font-semibold">Activity on</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="trips-on"
                        variant={"outline"}
                        className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => d && setDate(d)}
                        initialFocus
                        disabled={(d) => d > new Date() || d < new Date("2000-01-01")}
                    />
                    </PopoverContent>
                </Popover>
             </div>
             <p className="text-xs text-muted-foreground mt-2">
                Report period: {format(subDays(date, 1), 'MMM d, yyyy')} 23:00 to {format(addDays(date, 1), 'MMM d, yyyy')} 01:00.
            </p>
        </div>


        <ScrollArea className="flex-1">
            <div className="text-sm p-2 space-y-1">
                <ActivityItem activity={activityReportData[0]} type="activity" onClick={() => handleActivityClick("12:00")} />
                <ActivityItem activity={activityReportData[1]} type="activity" onClick={() => handleActivityClick("13:00")} />
                <ActivityItem activity={breakExample} type="break" onClick={() => handleActivityClick(breakExample.startTime)} />
                <ActivityItem activity={activityReportData[2]} type="activity" onClick={() => handleActivityClick("15:00")} />
                <ActivityItem activity={bookingExample} type="booking" onClick={() => handleActivityClick(bookingExample.startTime)} />
                <ActivityItem activity={activityReportData[4]} type="activity" onClick={() => handleActivityClick("16:00")} />
                <ActivityItem activity={activityReportData[5]} type="activity" onClick={() => handleActivityClick("17:00")} />
            </div>
        </ScrollArea>
        
      </DialogContent>
    </Dialog>
  );
}
