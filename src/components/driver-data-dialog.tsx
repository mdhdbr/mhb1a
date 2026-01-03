

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DriverData } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: DriverData) => void;
  vehicleTypes: string[];
  initialData?: DriverData | null;
};

const initialFormState: DriverData = {
    name: '',
    contactNumber: '',
    dlNo: '',
    dlExpiry: '',
    allowedVehicles: '',
    vehicleRegNum: '',
    vehicleType: '',
    make: '',
    model: '',
    capacity: '',
    insuranceExpiry: '',
    lastFC: '',
    fcExpiry: '',
    permit: '',
    puccExpiry: '',
};

const formFields: { id: keyof DriverData, label: string, type: 'text' | 'tel' | 'date' | 'select', required: boolean }[] = [
    { id: 'name', label: 'Name', type: 'text', required: true },
    { id: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
    { id: 'dlNo', label: 'DL No', type: 'text', required: true },
    { id: 'dlExpiry', label: 'DL Expiry', type: 'date', required: false },
    { id: 'allowedVehicles', label: 'Allowed Vehicles', type: 'text', required: false },
    { id: 'vehicleRegNum', label: 'Vehicle Reg Num', type: 'text', required: false },
    { id: 'vehicleType', label: 'Vehicle Type', type: 'select', required: false },
    { id: 'make', label: 'Make', type: 'text', required: false },
    { id: 'model', label: 'Model', type: 'text', required: false },
    { id: 'capacity', label: 'Capacity', type: 'text', required: false },
    { id: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date', required: false },
    { id: 'lastFC', label: 'Last FC', type: 'date', required: false },
    { id: 'fcExpiry', label: 'FC Expiry', type: 'date', required: false },
    { id: 'permit', label: 'Permit', type: 'text', required: false },
    { id: 'puccExpiry', label: 'PUCC Expiry', type: 'date', required: false },
];

export default function DriverDataDialog({ isOpen, onClose, onSave, vehicleTypes, initialData }: Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<DriverData>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode) {
      setFormData(initialData);
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isEditMode, isOpen]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof DriverData, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.contactNumber || !formData.dlNo) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name, Contact Number, and DL No. are required fields.',
      });
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
        onSave(formData);
        toast({
            title: `Driver ${isEditMode ? 'Updated' : 'Added'}`,
            description: `Successfully ${isEditMode ? 'updated' : 'added'} ${formData.name}.`,
        });
        setIsSaving(false);
        onClose();
    }, 500);
  };
  
  const handleClose = () => {
    setFormData(initialFormState);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Driver Data' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Update the details for ${initialData.name}.` : 'Enter the details for the new driver record.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
            <div className="grid gap-4 py-4 pr-4">
            {formFields.map(field => (
                <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={field.id} className="text-right">
                    {field.label}{field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {field.type === 'select' ? (
                       <Select
                         value={formData[field.id]}
                         onValueChange={(value) => handleSelectChange(field.id, value)}
                       >
                         <SelectTrigger className="col-span-3">
                           <SelectValue placeholder="Select a vehicle type" />
                         </SelectTrigger>
                         <SelectContent>
                           {(vehicleTypes || []).map(type => (
                             <SelectItem key={type} value={type}>{type}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    ) : (
                        <Input
                            id={field.id}
                            type={field.type}
                            value={formData[field.id]}
                            onChange={handleChange}
                            className="col-span-3"
                            disabled={isEditMode && field.id === 'dlNo'} // DL No. shouldn't be editable
                        />
                    )}
                </div>
            ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
