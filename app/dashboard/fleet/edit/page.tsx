'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicleJobStore } from "@/stores/job-store";
import { ArrowLeft, Save } from 'lucide-react';
import type { Vehicle } from "@/lib/types";

export default function EditVehiclePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('id');
  const { vehicles, updateVehicle } = useVehicleJobStore();
  
  const [vehicle, setVehicle] = useState<Partial<Vehicle>>({
    licensePlate: '',
    vehicleType: '',
    make: '',
    model: '',
    capacity: '',
    status: 'Idle'
  });

  useEffect(() => {
    if (vehicleId) {
      const existingVehicle = vehicles.find(v => v.id === vehicleId);
      if (existingVehicle) {
        setVehicle(existingVehicle);
      }
    }
  }, [vehicleId, vehicles]);

  const handleSave = () => {
    if (vehicleId && vehicle) {
      updateVehicle(vehicleId, vehicle as Vehicle);
      router.push('/dashboard/fleet');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/fleet');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="font-headline">
            {vehicleId ? 'Edit Vehicle' : 'Add Vehicle'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input
              id="licensePlate"
              value={vehicle.licensePlate || ''}
              onChange={(e) => setVehicle({ ...vehicle, licensePlate: e.target.value })}
              placeholder="Enter license plate"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select
              value={vehicle.vehicleType || ''}
              onValueChange={(value) => setVehicle({ ...vehicle, vehicleType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Car">Car</SelectItem>
                <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                <SelectItem value="Bus">Bus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              value={vehicle.make || ''}
              onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
              placeholder="Enter make"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={vehicle.model || ''}
              onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              placeholder="Enter model"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              value={vehicle.capacity || ''}
              onChange={(e) => setVehicle({ ...vehicle, capacity: e.target.value })}
              placeholder="Enter capacity"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={vehicle.status || ''}
              onValueChange={(value) => setVehicle({ ...vehicle, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Idle">Idle</SelectItem>
                <SelectItem value="On Duty">On Duty</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="On Break">On Break</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}