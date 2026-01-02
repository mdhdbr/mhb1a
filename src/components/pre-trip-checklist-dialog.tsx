
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Flame,
  PlusSquare,
  CircleDot,
  Box,
  Ban,
  Car,
  Wrench,
  AlertTriangle,
  Fuel,
  Gauge,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

type ChecklistItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const checklistItems: ChecklistItem[] = [
  { id: 'fire-extinguisher', label: 'Fire extinguisher present and accessible', icon: <Flame className="text-red-500" /> },
  { id: 'first-aid', label: 'First aid kit available and stocked', icon: <PlusSquare className="text-green-500" /> },
  { id: 'tyre-pressure', label: 'Tyre pressure and condition checked', icon: <CircleDot className="text-blue-500" /> },
  { id: 'load-secured', label: 'Load secured properly (if applicable)', icon: <Box className="text-orange-500" /> },
  { id: 'alcohol-test', label: 'Alcohol test passed (mock)', icon: <Ban className="text-gray-500" /> },
  { id: 'interior-cleaned', label: 'Vehicle interior cleaned', icon: <Car className="text-purple-500" /> },
  { id: 'toolkit', label: 'Emergency toolkit present', icon: <Wrench className="text-gray-700" /> },
  { id: 'warning-triangle', label: 'Warning triangle & visibility jacket', icon: <AlertTriangle className="text-yellow-500" /> },
  { id: 'fuel-level', label: 'Fuel level adequate for trip', icon: <Fuel className="text-gray-800" /> },
  { id: 'dashboard-lights', label: 'Dashboard warning lights checked', icon: <Gauge className="text-blue-400" /> },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export default function PreTripChecklistDialog({ isOpen, onClose, onComplete }: Props) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleCheckedChange = (itemId: string, isChecked: boolean) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const completedCount = checkedItems.size;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;
  const isAllChecked = completedCount === totalCount;

  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCheckedItems(new Set());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="text-primary" />
            Pre-Trip Safety Checklist
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 px-6 pb-4">
            {checklistItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg p-3 cursor-pointer transition-colors border",
                  checkedItems.has(item.id) 
                    ? "bg-primary/10 border-primary/50" 
                    : "bg-secondary/50 hover:bg-secondary"
                )}
                onClick={() => handleCheckedChange(item.id, !checkedItems.has(item.id))}
              >
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={(checked) => handleCheckedChange(item.id, !!checked)}
                  className="h-5 w-5"
                />
                <div className="w-6 h-6 flex items-center justify-center shrink-0">{item.icon}</div>
                <label htmlFor={item.id} className="flex-1 text-sm font-medium cursor-pointer">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 pb-6 pt-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <DialogFooter className="bg-secondary/50 p-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onComplete}
            disabled={!isAllChecked}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Checklist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
