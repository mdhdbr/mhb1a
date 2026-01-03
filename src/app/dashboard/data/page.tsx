
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, FileUp, Trash2, Plus, Search, Pencil } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { exportJsonToExcel } from '@/lib/backup';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DriverDataDialog from '@/components/driver-data-dialog';
import type { DriverData, Rate } from '@/lib/types';
import { useDriverStore } from '@/stores/driver-store';


type UserProfile = {
  id: string;
  role?: 'admin' | 'agent' | 'driver' | 'user';
};

export default function DataPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverData | null>(null);
  const { driverGridData, addDriver, removeDrivers, updateDriver } = useDriverStore();
  const [filter, setFilter] = useState('');

  const pricingCollectionQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'pricing') : null),
    [firestore]
  );
  const { data: pricingRates, isLoading: isLoadingRates } = useCollection<Rate>(pricingCollectionQuery);

  const vehicleTypes = useMemo(() => {
    if (!pricingRates) return [];
    return Array.from(new Set(pricingRates.map(r => r.vehicleType)));
  }, [pricingRates]);


  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';

  const filteredData = useMemo(() => {
    if (!filter) return driverGridData;
    const lowercasedFilter = filter.toLowerCase();
    return driverGridData.filter(driver => 
      Object.values(driver).some(value => 
        String(value).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [driverGridData, filter]);
  
  const handleExport = () => {
    if (selectedRows.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Please select at least one row to export.",
      });
      return;
    }

    const dataToExport = filteredData.filter(driver => selectedRows.includes(driver.dlNo));
    
    try {
      const success = exportJsonToExcel(dataToExport, 'Driver_Data');
      if (success) {
        toast({
          title: "Export Successful",
          description: "Selected driver data has been exported to an Excel file.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: "No data was selected to export.",
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export data. Please check the console for errors.",
      });
    }
  };

  const handleDelete = () => {
    removeDrivers(selectedRows);
    toast({
        title: "Data Deleted",
        description: `${selectedRows.length} row(s) have been deleted.`,
    });
    setSelectedRows([]);
  }
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Selected",
        description: `${file.name} is ready for import.`,
      });
      // Here you would add the logic to parse and process the Excel file.
    }
  };

  const handleOpenAddDialog = () => {
    setEditingDriver(null);
    setIsDriverDialogOpen(true);
  };
  
  const handleOpenEditDialog = (driver: DriverData) => {
    setEditingDriver(driver);
    setIsDriverDialogOpen(true);
  };

  const handleEditSelected = () => {
    if (selectedRows.length !== 1) return;
    const driverToEdit = driverGridData.find(d => d.dlNo === selectedRows[0]);
    if (driverToEdit) {
        handleOpenEditDialog(driverToEdit);
    }
  };
  
  const handleDialogClose = () => {
    setIsDriverDialogOpen(false);
    setEditingDriver(null);
  }

  const handleSaveDriver = (driverData: DriverData) => {
    if (editingDriver) {
      // It's an update
      updateDriver(driverData.dlNo, driverData);
    } else {
      // It's a new driver
      addDriver(driverData);
    }
  };


  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(filteredData.map(d => d.dlNo));
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleSelectRow = (dlNo: string, checked: boolean) => {
    setSelectedRows(prev => 
      checked ? [...prev, dlNo] : prev.filter(id => id !== dlNo)
    );
  };
  
  const areAllSelected = filteredData && selectedRows.length === filteredData.length;
  const isIndeterminate = selectedRows.length > 0 && !areAllSelected;

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Data Management</CardTitle>
        <div className="flex gap-2">
          {isProfileLoading ? (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </>
          ) : (
            <>
              <Button onClick={handleEditSelected} disabled={!isAdmin || selectedRows.length !== 1}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button onClick={handleOpenAddDialog} disabled={!isAdmin}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
              <Button asChild variant="outline" disabled={!isAdmin}>
                <Label htmlFor="import-file">
                    <FileUp className="mr-2 h-4 w-4" /> Import
                </Label>
              </Button>
              <Input
                type="file"
                id="import-file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleImport}
                disabled={!isAdmin}
              />
              <Button variant="outline" disabled={!isAdmin || selectedRows.length === 0} onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={!isAdmin || selectedRows.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the selected {selectedRows.length} row(s). This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Yes</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
                Primary data table for all driver and vehicle compliance information.
            </p>
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter data..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[50px]">
                    <Checkbox
                        checked={filteredData && filteredData.length > 0 && (areAllSelected || (isIndeterminate && 'indeterminate'))}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                        disabled={!filteredData || filteredData.length === 0}
                    />
                 </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>DL No</TableHead>
                <TableHead>DL Expiry</TableHead>
                <TableHead>Vehicle Reg Num</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Insurance Expiry</TableHead>
                <TableHead>FC Expiry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData &&
                filteredData.map((driver) => (
                  <TableRow key={driver.dlNo} data-state={selectedRows.includes(driver.dlNo) && "selected"} className="hover:bg-muted/50" onDoubleClick={() => handleOpenEditDialog(driver)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={selectedRows.includes(driver.dlNo)}
                            onCheckedChange={(checked) => handleSelectRow(driver.dlNo, !!checked)}
                            aria-label={`Select row for ${driver.name}`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.contactNumber}</TableCell>
                    <TableCell>{driver.dlNo}</TableCell>
                    <TableCell>{driver.dlExpiry}</TableCell>
                    <TableCell>{driver.vehicleRegNum}</TableCell>
                    <TableCell>{driver.vehicleType}</TableCell>
                    <TableCell>{driver.insuranceExpiry}</TableCell>
                    <TableCell>{driver.fcExpiry}</TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center h-24">No results found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <DriverDataDialog 
        isOpen={isDriverDialogOpen} 
        onClose={handleDialogClose}
        onSave={handleSaveDriver}
        vehicleTypes={vehicleTypes}
        initialData={editingDriver}
    />
    </>
  );
}
