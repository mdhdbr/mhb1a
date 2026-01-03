
'use client';

import { useState } from 'react';
import { LatLng } from 'leaflet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, MapPin, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

type Props = {
  x: number;
  y: number;
  latlng: LatLng;
  onClose: () => void;
};

export default function WhoWasHereDialog({ x, y, latlng, onClose }: Props) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [radius, setRadius] = useState<string>('0.5');

  const handleGenerateReport = () => {
    if (!dateRange?.from || !dateRange?.to) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a valid date range.',
        });
        return;
    }
    
    toast({
      title: 'Generating Report...',
      description: `Searching for activity within ${radius} miles between ${format(dateRange.from, 'LLL dd, y')} and ${format(dateRange.to, 'LLL dd, y')}.`,
    });
    
    // In a real app, this would trigger a PDF generation process.
    setTimeout(() => {
         toast({
            title: 'Report Ready',
            description: 'Who Was Here report has been exported to PDF.',
            action: <Button size="sm"><Download className="mr-2 h-4 w-4" /> Download</Button>
        });
    }, 2000)

    onClose();
  };

  return (
    <DropdownMenu open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DropdownMenuContent
        className="w-80 fixed"
        style={{ top: y, left: x }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Who Was Here Report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <div>
                    <p className="font-semibold text-foreground">Selected Location</p>
                    <p>{`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`}</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <Label>Radius</Label>
                <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0.5">0.5 miles</SelectItem>
                        <SelectItem value="1.0">1.0 mile</SelectItem>
                        <SelectItem value="1.5">1.5 miles</SelectItem>
                        <SelectItem value="2.0">2.0 miles</SelectItem>
                    </SelectContent>
                </Select>
            </div>

        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleGenerateReport}>
          <Download className="mr-2 h-4 w-4" />
          <span>Generate Report (PDF)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
