
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Truck, Trash2, PlusCircle, Save, Wrench, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Rate = {
    id: string; // Changed to string for Firestore document IDs
    vehicleType: string;
    category: 'passenger' | 'shipper' | 'equipment';
    percentPer: number;
    rate: number;
    vatPercent: number;
    vatAmount: number;
    damages: number;
    handling: number;
    waiting: number;
    halting: number;
};

type RateFilters = { [K in keyof Rate]?: Set<string | number> };

const FilterableHeader = ({ title, column, allRates, filters, setFilters }: {
    title: string;
    column: keyof Rate;
    allRates: Rate[];
    filters: RateFilters;
    setFilters: React.Dispatch<React.SetStateAction<RateFilters>>;
}) => {
    const [search, setSearch] = useState('');
    const uniqueValues = useMemo(() => Array.from(new Set(allRates.map(rate => rate[column]))), [allRates, column]);
    const currentFilter = filters[column] || new Set();

    const filteredUniqueValues = useMemo(() => {
        if (!search) return uniqueValues;
        const lowercasedSearch = search.toLowerCase();
        return uniqueValues.filter(val => String(val).toLowerCase().includes(lowercasedSearch));
    }, [uniqueValues, search]);

    const handleCheckedChange = (value: string | number, checked: boolean) => {
        setFilters(prev => {
            const newFilterSet = new Set(prev[column]);
            if (checked) {
                newFilterSet.add(value);
            } else {
                newFilterSet.delete(value);
            }
            return { ...prev, [column]: newFilterSet };
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setFilters(prev => ({
            ...prev,
            [column]: checked ? new Set(filteredUniqueValues.map(String)) : new Set(),
        }));
    };

    const isAllFilteredSelected = filteredUniqueValues.length > 0 && filteredUniqueValues.every(val => currentFilter.has(String(val)));

    return (
        <TableHead>
            <div className="flex items-center gap-1">
                <span>{title}</span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Filter className={cn("h-3 w-3", currentFilter.size > 0 && "text-primary")} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-60" align="start">
                        <div className="p-2">
                             <Input
                                placeholder="Search values..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        <div className="p-2 space-y-2 border-t">
                           <div className="flex items-center space-x-2 px-2">
                                <Checkbox
                                    id={`select-all-${String(column)}`}
                                    checked={isAllFilteredSelected}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                                <Label htmlFor={`select-all-${String(column)}`} className="font-semibold">Select All</Label>
                            </div>
                           <Separator />
                        </div>
                        <ScrollArea className="h-60">
                            <div className="p-2 space-y-2">
                                {filteredUniqueValues.map(value => (
                                    <div key={String(value)} className="flex items-center space-x-2 px-2">
                                        <Checkbox
                                            id={`${String(column)}-${String(value)}`}
                                            checked={currentFilter.has(String(value))}
                                            onCheckedChange={(checked) => handleCheckedChange(String(value), !!checked)}
                                        />
                                        <Label htmlFor={`${String(column)}-${String(value)}`}>{String(value)}</Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </div>
        </TableHead>
    );
};


const RateCardTable = ({ title, description, icon, allRates, setAllRates, filteredRates, setFilters, rateUnit, category, isLoading }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    allRates: Rate[];
    setAllRates: React.Dispatch<React.SetStateAction<Rate[]>>;
    filteredRates: Rate[];
    setFilters: React.Dispatch<React.SetStateAction<RateFilters>>;
    rateUnit: string;
    category: 'passenger' | 'shipper' | 'equipment';
    isLoading: boolean;
}) => {
    const handleRateChange = (id: string, field: keyof Omit<Rate, 'id' | 'vehicleType' | 'category'>, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setAllRates(prevRates =>
            prevRates.map(rate => {
                if (rate.id === id) {
                    const newRate = { ...rate, [field]: numericValue };
                    // Recalculate vatAmount if vatPercent or rate is changed, unless we are editing vatAmount directly
                    if (field === 'vatPercent' || field === 'rate') {
                        newRate.vatAmount = newRate.rate * (newRate.vatPercent / 100);
                    }
                    return newRate;
                }
                return rate;
            })
        );
    };

    const handleTypeChange = (id: string, value: string) => {
        setAllRates(prevRates =>
            prevRates.map(rate =>
                rate.id === id ? { ...rate, vehicleType: value } : rate
            )
        );
    };

    const addRow = () => {
        const newId = `new-${Date.now()}`;
        const newRate: Rate = {
            id: newId, vehicleType: 'NEW VEHICLE', category, percentPer: 5, rate: 0, vatPercent: 15, vatAmount: 0, damages: 1, handling: 1, waiting: 1, halting: 1
        };
        setAllRates(prevRates => [...prevRates, newRate]);
    };

    const deleteRow = (id: string) => {
        setAllRates(prevRates => prevRates.filter(rate => rate.id !== id));
    };

    const columns: { title: string; column: keyof Rate, isFilterable: boolean }[] = [
        { title: "Vehicle Type", column: "vehicleType", isFilterable: true },
        { title: "% Per", column: "percentPer", isFilterable: false },
        { title: `Rate (${rateUnit})`, column: "rate", isFilterable: false },
        { title: "VAT %", column: "vatPercent", isFilterable: false },
        { title: "VAT Amount", column: "vatAmount", isFilterable: false },
        { title: "Damages", column: "damages", isFilterable: false },
        { title: "Handling", column: "handling", isFilterable: false },
        { title: "Waiting", column: "waiting", isFilterable: false },
        { title: "Halting", column: "halting", isFilterable: false },
    ];
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <CardTitle className="font-headline text-xl">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(col =>
                                    col.isFilterable ? (
                                        <FilterableHeader
                                            key={col.column}
                                            title={col.title}
                                            column={col.column}
                                            allRates={allRates}
                                            filters={{}}
                                            setFilters={setFilters}
                                        />
                                    ) : (
                                        <TableHead key={col.column}>{col.title}</TableHead>
                                    )
                                )}
                                <TableHead>Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={columns.length + 2}>
                                            <Skeleton className="h-11 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                filteredRates.map(rate => {
                                const perVal = rate.rate * (rate.percentPer / 100);
                                const total = rate.rate + perVal + rate.vatAmount + rate.damages + rate.handling + rate.waiting + rate.halting;
                                return (
                                    <TableRow key={rate.id}>
                                        <TableCell>
                                            <Input value={rate.vehicleType} onChange={(e) => handleTypeChange(rate.id, e.target.value)} className="font-semibold min-w-[200px]" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.percentPer} onChange={(e) => handleRateChange(rate.id, 'percentPer', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.rate.toFixed(2)} onChange={(e) => handleRateChange(rate.id, 'rate', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.vatPercent} onChange={(e) => handleRateChange(rate.id, 'vatPercent', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.vatAmount.toFixed(2)} onChange={(e) => handleRateChange(rate.id, 'vatAmount', e.target.value)} className="w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.damages} onChange={(e) => handleRateChange(rate.id, 'damages', e.target.value)} className="w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.handling} onChange={(e) => handleRateChange(rate.id, 'handling', e.target.value)} className="w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.waiting} onChange={(e) => handleRateChange(rate.id, 'waiting', e.target.value)} className="w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={rate.halting} onChange={(e) => handleRateChange(rate.id, 'halting', e.target.value)} className="w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Input value={total.toFixed(2)} disabled className="font-bold w-28 bg-muted/50" />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => deleteRow(rate.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            }))}
                             { !isLoading && filteredRates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 2} className="text-center h-24">
                                        No rates found for this category.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Button variant="outline" size="sm" onClick={addRow} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Vehicle Type
                </Button>
            </CardContent>
        </Card>
    );
};

export default function PricingPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const pricingCollectionQuery = useMemoFirebase(
        () => (firestore ? collection(firestore, 'pricing') : null),
        [firestore]
    );
    const { data: allRatesFromDb, isLoading, error } = useCollection<Rate>(pricingCollectionQuery);

    const [passengerRates, setPassengerRates] = useState<Rate[]>([]);
    const [shipperRates, setShipperRates] = useState<Rate[]>([]);
    const [equipmentRates, setEquipmentRates] = useState<Rate[]>([]);
    
    useEffect(() => {
        if (allRatesFromDb) {
            setPassengerRates(allRatesFromDb.filter(r => r.category === 'passenger'));
            setShipperRates(allRatesFromDb.filter(r => r.category === 'shipper'));
            setEquipmentRates(allRatesFromDb.filter(r => r.category === 'equipment'));
        }
    }, [allRatesFromDb]);

    const [passengerFilters, setPassengerFilters] = useState<RateFilters>({});
    const [shipperFilters, setShipperFilters] = useState<RateFilters>({});
    const [equipmentFilters, setEquipmentFilters] = useState<RateFilters>({});

    const applyFilters = (rates: Rate[], filters: RateFilters): Rate[] => {
        if (Object.keys(filters).length === 0) return rates;
        return rates.filter(rate => {
            return Object.entries(filters).every(([key, selectedValues]) => {
                if (selectedValues.size === 0) return true;
                const rateKey = key as keyof Rate;
                return selectedValues.has(String(rate[rateKey]));
            });
        });
    };

    const filteredPassengerRates = useMemo(() => applyFilters(passengerRates, passengerFilters), [passengerRates, passengerFilters]);
    const filteredShipperRates = useMemo(() => applyFilters(shipperRates, shipperFilters), [shipperRates, shipperFilters]);
    const filteredEquipmentRates = useMemo(() => applyFilters(equipmentRates, equipmentFilters), [equipmentRates, equipmentFilters]);

    const handleSaveChanges = async () => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "Firestore not available." });
            return;
        }
        setIsSaving(true);
        
        try {
            const batch = writeBatch(firestore);
            const allLocalRates = [...passengerRates, ...shipperRates, ...equipmentRates];
            const originalDbIds = new Set(allRatesFromDb?.map(r => r.id));
            const currentLocalIds = new Set(allLocalRates.map(r => r.id));

            // Determine which documents to delete from Firestore
            originalDbIds.forEach(originalId => {
                if (!currentLocalIds.has(originalId)) {
                    const docRef = doc(firestore, 'pricing', originalId);
                    batch.delete(docRef);
                }
            });
            
            // Set (create or update) documents in Firestore
            allLocalRates.forEach(rate => {
                // If the ID starts with 'new-', it's a new document. Let Firestore generate the ID.
                const docRef = rate.id.startsWith('new-')
                    ? doc(collection(firestore, 'pricing')) // Creates a new doc reference
                    : doc(firestore, 'pricing', rate.id); // Uses the existing doc reference

                // If it's a new document, we don't include the temporary ID in the data.
                const { id, ...rateData } = rate;
                
                batch.set(docRef, rateData);
            });
            
            await batch.commit();

            toast({
                title: 'Changes Saved',
                description: 'The vehicle rate card has been successfully updated.',
            });
        } catch (error) {
            console.error("Error saving pricing data:", error);
            toast({
                variant: "destructive",
                title: 'Save Failed',
                description: 'Could not save pricing data. See console for details.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (error) {
        return <div className="text-red-500 p-4 bg-destructive/10 border border-destructive rounded-md">Error loading pricing data: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Vehicle Rate Card</h1>
                    <p className="text-muted-foreground mt-1">Official pricing for all vehicle segments. Editable in Admin Mode.</p>
                </div>
                <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <RateCardTable
                title="Passenger Vehicles"
                description="Rates for all passenger transport types."
                icon={<Car className="h-6 w-6 text-primary" />}
                allRates={passengerRates}
                setAllRates={setPassengerRates}
                filteredRates={filteredPassengerRates}
                setFilters={setPassengerFilters}
                rateUnit="SAR/KM"
                category="passenger"
                isLoading={isLoading}
            />

            <RateCardTable
                title="Shipper"
                description="Rates for all freight transport."
                icon={<Truck className="h-6 w-6 text-primary" />}
                allRates={shipperRates}
                setAllRates={setShipperRates}
                filteredRates={filteredShipperRates}
                setFilters={setShipperFilters}
                rateUnit="SAR/KM"
                category="shipper"
                isLoading={isLoading}
            />
            
            <RateCardTable
                title="Equipment"
                description="Rates for all heavy equipment."
                icon={<Wrench className="h-6 w-6 text-primary" />}
                allRates={equipmentRates}
                setAllRates={setEquipmentRates}
                filteredRates={filteredEquipmentRates}
                setFilters={setEquipmentFilters}
                rateUnit="SAR/HRS"
                category="equipment"
                isLoading={isLoading}
            />
        </div>
    );
}
