
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from './ui/separator';

export default function TrackingFilters() {
    const [sortBy, setSortBy] = useState<'status' | 'callsign'>('status');

    return (
         <div className="space-y-4">
            <div>
                <h4 className="font-medium leading-none">Filters</h4>
                <p className="text-sm text-muted-foreground">
                    Refine the vehicles shown on the map.
                </p>
            </div>
            <div className="space-y-3">
                <Select><SelectTrigger><SelectValue placeholder="Depots" /></SelectTrigger><SelectContent><SelectItem value="all">All Depots</SelectItem></SelectContent></Select>
                <Select><SelectTrigger><SelectValue placeholder="Vehicle type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem></SelectContent></Select>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Statuses" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="empty">Empty</SelectItem>
                        <SelectItem value="on_job">On Job</SelectItem>
                        <SelectItem value="on_break">On Break</SelectItem>
                    </SelectContent>
                </Select>
                <Input placeholder="Vehicle Description" />
                
                <Separator />
                
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="callsign">Callsign</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center justify-end pt-2">
                  <Button>Apply Filters</Button>
                </div>
              </div>
        </div>
    )
}
