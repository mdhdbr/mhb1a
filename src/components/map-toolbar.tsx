
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/stores/map-store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RefreshCw, LocateFixed, SlidersHorizontal, Route, Users, AlertTriangle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import TrackingFilters from './tracking-filters';
import { Input } from './ui/input';

export default function MapToolbar() {
  const { toast } = useToast();
  const {
    isAutoRefreshOn,
    toggleAutoRefresh,
    showCallsigns,
    toggleShowCallsigns,
    isTracking,
    toggleTracking,
    findNearestVehicle,
    showRoutes,
    toggleShowRoutes,
    showIncidents,
    toggleShowIncidents,
  } = useMapStore();

  const handleRefresh = () => {
    toast({
        title: 'Refreshing Data...',
        description: 'Fetching latest vehicle locations.',
    });
    // In a real app, this would trigger a data refetch.
  }

  return (
    <div className="flex items-center gap-2 border bg-background/80 p-1 rounded-md shadow-sm">
        <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Find Vehicle/Job..."
                className="pl-10 h-9"
            />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Popover>
            <PopoverTrigger asChild>
                 <Button variant="ghost" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
                <TrackingFilters />
            </PopoverContent>
        </Popover>
       
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isAutoRefreshOn && 'animate-spin')} />
          Refresh
        </Button>
        <div className="flex items-center space-x-2">
          <Checkbox id="auto-refresh" checked={isAutoRefreshOn} onCheckedChange={toggleAutoRefresh} />
          <Label htmlFor="auto-refresh">Auto</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="follow-vehicle" checked={isTracking} onCheckedChange={toggleTracking} />
          <Label htmlFor="follow-vehicle">Follow</Label>
        </div>
         <Separator orientation="vertical" className="h-6" />
         <div className="flex items-center space-x-2">
          <Checkbox id="show-callsigns" checked={showCallsigns} onCheckedChange={toggleShowCallsigns} />
          <Label htmlFor="show-callsigns" className="flex items-center gap-2"><Users className="h-4 w-4"/>Callsigns</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="show-routes" checked={showRoutes} onCheckedChange={toggleShowRoutes} />
          <Label htmlFor="show-routes" className="flex items-center gap-2"><Route className="h-4 w-4"/>Routes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="show-incidents" checked={showIncidents} onCheckedChange={toggleShowIncidents} />
          <Label htmlFor="show-incidents" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>Incidents</Label>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="sm" onClick={findNearestVehicle}>
          <LocateFixed className="mr-2 h-4 w-4" />
          Find Nearest
        </Button>
    </div>
  );
}
