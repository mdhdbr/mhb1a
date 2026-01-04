
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { useDriverStore } from '@/stores/driver-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import type { DriverData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCustomerStore } from '@/stores/customer-store'; // Note: This seems to be unused, was likely from a copy-paste.

const getRatingVariant = (rating: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Blue'): "default" | "secondary" | "destructive" | "outline" => {
    switch (rating) {
        case 'Platinum':
        case 'Gold':
            return 'default';
        case 'Silver':
            return 'secondary';
        case 'Bronze':
            return 'outline';
        case 'Blue':
        default:
            return 'outline';
    }
};

const getRatingClass = (rating: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Blue') => {
    switch(rating) {
        case 'Platinum': return 'bg-purple-600 text-white border-purple-700';
        case 'Gold': return 'bg-yellow-500 text-black border-yellow-600';
        case 'Silver': return 'bg-gray-400 text-white border-gray-500';
        case 'Bronze': return 'bg-orange-700 text-white border-orange-800';
        case 'Blue': return 'bg-blue-500 text-white border-blue-600';
        default: return 'border-gray-300';
    }
};


export default function PilotsPage() {
  const { driverGridData, setDutyStartTime, getFatigueLevel } = useDriverStore();
  const [filter, setFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSync = () => {
    setIsSyncing(true);
    toast({ title: 'Syncing Pilots...', description: 'Fetching latest driver data.' });
    
    // Simulate an API call
    setTimeout(() => {
      // In a real app this would refetch, but here we just show a message.
      setIsSyncing(false);
      toast({ title: 'Sync Complete!', description: 'Pilot data has been updated.' });
    }, 1500);
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return 'outline';
    switch (status.toLowerCase()) {
        case 'on duty': return 'default';
        case 'offline': return 'outline';
        default: return 'secondary';
    }
  }

  const getFatigueVariant = (level: 'Critical' | 'High' | 'Medium' | 'Low' | null): "destructive" | "secondary" | "default" => {
    if (!level) return 'default';
    switch (level) {
        case 'Critical':
        case 'High':
            return 'destructive';
        case 'Medium':
            return 'secondary';
        case 'Low':
        default:
            return 'default';
    }
}

  const formatFatigueLevel = (level: string | null) => {
    if (!level) return null;
    return (level.charAt(0) + level.slice(1).toLowerCase()) as 'Critical' | 'High' | 'Medium' | 'Low';
  };

  const filteredPilots = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    
    return driverGridData.filter(pilot => {
      if (!filter) return true;
      
      const fatigue = getFatigueLevel(pilot.dutyStartTime);
      return (
        pilot.name.toLowerCase().includes(lowercasedFilter) ||
        pilot.contactNumber.toLowerCase().includes(lowercasedFilter) ||
        pilot.status.toLowerCase().includes(lowercasedFilter) ||
        (fatigue && fatigue.toLowerCase().includes(lowercasedFilter))
      );
    });
  }, [filter, driverGridData, getFatigueLevel]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pilots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <p className="text-sm text-muted-foreground flex-1">This table displays pilot information, duty status, and fatigue levels.</p>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Filter pilots..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 h-11"
                  />
              </div>
              <Button onClick={handleSync} disabled={isSyncing} className="h-11">
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="sr-only">Sync Pilots</span>
              </Button>
            </div>
        </div>
         <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duty Hrs</TableHead>
                <TableHead>Fatigue Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPilots.map((pilot) => {
                  const fatigueLevel = formatFatigueLevel(getFatigueLevel(pilot.dutyStartTime));
                  const dutyHours = pilot.dutyStartTime 
                    ? `${Math.floor((Date.now() - pilot.dutyStartTime) / 3600000)}h ${Math.floor(((Date.now() - pilot.dutyStartTime) % 3600000) / 60000)}m`
                    : '-';
                  return (
                      <TableRow key={pilot.dlNo}>
                        <TableCell className="font-medium">{pilot.name}</TableCell>
                        <TableCell>{pilot.contactNumber}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(pilot.status)}>
                            {pilot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{dutyHours}</TableCell>
                        <TableCell>
                          {fatigueLevel ? (
                            <Badge variant={getFatigueVariant(fatigueLevel)}>{fatigueLevel}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                  );
                })}
                 {filteredPilots.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No pilots found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
