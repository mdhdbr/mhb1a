
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, PlusCircle, Trash2, Printer, Download, CheckCircle, Archive, Search, ArrowLeft, Filter, MessageSquare, Layers } from "lucide-react";
import Logo from '@/components/icons/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Rate, Vehicle } from '@/lib/types';
import { useVehicleJobStore } from '@/stores/job-store';
import { format as formatDate, parseISO } from 'date-fns';


type LineItem = {
  id: number;
  description: string;
  kms?: number | string;
  rate?: number | string;
  amount: number;
};

type InvoiceData = {
    invoiceId: string;
    billedTo: {
        name: string;
        address: string;
        email: string;
    };
    from: {
        name: string;
        address: string;
        email: string;
    };
    invoiceDate: string;
    dueDate: string;
    items: LineItem[];
    notes: string;
};

type JobForInvoice = {
    id: string;
    date: string;
    type: string;
    vehicleType: string;
    status: string;
    distance: string;
    fare: string;
    client: string;
};


const GeneratedInvoiceView = ({ invoiceData }: { invoiceData: InvoiceData }) => {
    
    const handleDownloadOrPrint = () => {
        const printContentEl = document.getElementById("invoice-content");
        if (printContentEl) {
            window.print();
        }
    };
    
    const subtotal = invoiceData.items.reduce((acc, item) => acc + item.amount, 0);
    const vatAmount = subtotal * 0.15;
    const total = subtotal + vatAmount;

    const handleSendEmail = () => {
        const to = invoiceData.billedTo.email;
        const subject = `Invoice ${invoiceData.invoiceId} from Pro Seed`;
        const body = `Dear ${invoiceData.billedTo.name},

Please find your invoice attached for recent services.

Total Amount Due: ${total.toFixed(2)} SAR
Due Date: ${invoiceData.dueDate}

Thank you for your business!

Best regards,
The Pro Seed Team`;
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };


    return (
        <Card className="print:shadow-none print:border-none my-6" id="invoice-content-wrapper">
             <div className="flex justify-end mb-4 print:hidden gap-2">
                <Button variant="outline" onClick={handleSendEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send
                </Button>
                <Button variant="outline" onClick={handleDownloadOrPrint}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
                <Button onClick={handleDownloadOrPrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>
             <div className="p-4 sm:p-6 md:p-8 border rounded-lg" id="invoice-content">
                <header className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-primary/10">
                            <Logo className="h-9 w-9 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground font-headline">Pro Seed</h1>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold text-primary tracking-wider uppercase">Invoice</h2>
                        <p className="font-semibold text-muted-foreground mt-1">{invoiceData.invoiceId}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm mb-10">
                     <div className="md:col-span-1 space-y-1">
                        <p className="text-muted-foreground mb-1">Billed To:</p>
                        <p className="font-bold">{invoiceData.billedTo.name}</p>
                        <p>{invoiceData.billedTo.address}</p>
                        <p>{invoiceData.billedTo.email}</p>
                    </div>
                     <div className="md:col-span-1 space-y-1">
                        <p className="text-muted-foreground mb-1">From:</p>
                        <p className="font-bold">{invoiceData.from.name}</p>
                        <p>{invoiceData.from.address}</p>
                        <p>{invoiceData.from.email}</p>
                    </div>
                     <div className="md:col-span-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-muted-foreground mb-1">Invoice Date:</p>
                            <p className="font-semibold">{invoiceData.invoiceDate}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground mb-1">Due Date:</p>
                            <p className="font-semibold">{invoiceData.dueDate}</p>
                        </div>
                    </div>
                </div>
                
                <div className="mb-12">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Description</TableHead>
                                <TableHead className="text-right">KMS</TableHead>
                                <TableHead className="text-right">Rate</TableHead>
                                <TableHead className="text-right">Amount (SAR)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceData.items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell className="text-right">{item.kms !== undefined ? item.kms : '-'}</TableCell>
                                <TableCell className="text-right">{item.rate !== undefined ? item.rate : '-'}</TableCell>
                                <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>VAT (15%)</span>
                            <span>{(subtotal * 0.15).toFixed(2)} SAR</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg text-foreground">
                            <span>Total</span>
                            <span>{total.toFixed(2)} SAR</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{invoiceData.notes}</p>
                </div>
            </div>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-content-wrapper, #invoice-content, #invoice-content * {
                        visibility: visible;
                    }
                    #invoice-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                }
            `}</style>
        </Card>
    );
};

const GenerateFromJob = ({ onGenerate }: { onGenerate: (data: InvoiceData) => void }) => {
    const { vehicles } = useVehicleJobStore();

    const completedJobs: JobForInvoice[] = useMemo(() => {
        return vehicles
            .filter(v => v.job && v.job.status === 'Completed' && v.job.id)
            .map(v => {
                const job = v.job;
                const driver = v.driver;
                const fare = (job.distance * 2.5) + (Math.random() * 50);

                return {
                    id: job.id!,
                    date: job.pickupDate ? job.pickupDate.split(' ')[0] : 'N/A',
                    type: job.service === 'Car' ? 'PASSENGER' : 'SHIPMENT',
                    vehicleType: v.vehicleType,
                    status: job.status,
                    distance: job.distance.toFixed(2),
                    fare: fare.toFixed(2),
                    client: job.account || 'N/A',
                };
            });
    }, [vehicles]);

    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
    const { toast } = useToast();
    const firestore = useFirestore();
    const pricingCollectionQuery = useMemoFirebase(
      () => (firestore ? collection(firestore, 'pricing') : null),
      [firestore]
    );
    const { data: pricingRates } = useCollection<Rate>(pricingCollectionQuery);


    const handleGenerateClick = () => {
        if (selectedJobIds.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Jobs Selected',
                description: 'Please select at least one Job ID to generate an invoice.',
            });
            return;
        }

        const selectedJobs = completedJobs.filter(j => selectedJobIds.includes(j.id));
        
        // Check if all jobs are for the same client
        const firstClient = selectedJobs[0].client;
        if (!selectedJobs.every(j => j.client === firstClient)) {
            toast({
                variant: 'destructive',
                title: 'Client Mismatch',
                description: 'All selected jobs must belong to the same client to be grouped in one invoice.',
            });
            return;
        }

        const allLineItems: LineItem[] = [];
        let itemCounter = 1;

        selectedJobs.forEach(job => {
            const rateInfo = pricingRates?.find(r => r.vehicleType.toLowerCase() === job.vehicleType.toLowerCase());
            const fuelSurchargePercent = rateInfo?.percentPer ?? 0;
            const baseFare = parseFloat(job.fare);
            const fuelSurchargeAmount = baseFare * (fuelSurchargePercent / 100);

            allLineItems.push({
                id: itemCounter++,
                description: `Transport for Job #${job.id} - ${job.vehicleType}`,
                kms: parseFloat(job.distance),
                rate: parseFloat((baseFare / parseFloat(job.distance)).toFixed(2)),
                amount: baseFare
            });
             allLineItems.push({
                id: itemCounter++,
                description: `Fuel Surcharge for Job #${job.id} (${fuelSurchargePercent}%)`,
                amount: fuelSurchargeAmount
            });
        });


        const newInvoiceData: InvoiceData = {
            invoiceId: `INV-GRP-${Date.now().toString().slice(-6)}`,
            billedTo: {
                name: firstClient,
                address: '789 Industrial Ave, Dammam, 31442, KSA',
                email: 'accounts@' + firstClient.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
            },
            from: {
                name: 'Pro Seed',
                address: '123 Logistics Way, Riyadh, 11564, KSA',
                email: 'billing@pro-seed.com',
            },
            invoiceDate: '2025-12-23',
            dueDate: '2026-01-22',
            items: allLineItems,
            notes: `This invoice covers the following jobs: ${selectedJobIds.join(', ')}.\nPlease make all payments to the account details provided separately.\nThank you for your business!`,
        };

        onGenerate(newInvoiceData);
        
        toast({
            title: 'Group Invoice Generated',
            description: `Showing invoice for ${selectedJobIds.length} jobs.`,
        });
    };
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Generate Invoice from Job(s)</CardTitle>
                    <CardDescription>Select one or more completed jobs from the table below to generate an invoice.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-grow w-full">
                            <Input
                                id="job-id-display"
                                value={selectedJobIds.length > 0 ? `${selectedJobIds.length} job(s) selected` : "No jobs selected"}
                                readOnly
                                className="h-11 text-base"
                            />
                        </div>
                        <Button onClick={handleGenerateClick} className="w-full sm:w-auto h-11 text-base" disabled={selectedJobIds.length === 0}>
                            <Layers className="mr-2 h-4 w-4" />
                            Generate Invoice
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <CompletedJobsTable
                completedJobs={completedJobs}
                selectedJobIds={selectedJobIds}
                setSelectedJobIds={setSelectedJobIds}
            />
        </div>
    );
};

type Filters = { [K in keyof JobForInvoice]?: Set<string> };

const FilterableHeader = ({ title, column, filters, setFilters, jobs }: { title: string, column: keyof JobForInvoice, filters: Filters, setFilters: React.Dispatch<React.SetStateAction<Filters>>, jobs: JobForInvoice[] }) => {
    const [search, setSearch] = useState('');
    const uniqueValues = useMemo(() => Array.from(new Set(jobs.map(job => job[column]))), [jobs, column]);
    const currentFilter = filters[column] || new Set();

    const filteredUniqueValues = useMemo(() => {
        if (!search) return uniqueValues;
        const lowercasedSearch = search.toLowerCase();
        return uniqueValues.filter(val => String(val).toLowerCase().includes(lowercasedSearch));
    }, [uniqueValues, search]);

    const handleCheckedChange = (value: string, checked: boolean) => {
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
            [column]: checked ? new Set(filteredUniqueValues) : new Set(),
        }));
    };

    const isAllFilteredSelected = filteredUniqueValues.length > 0 && filteredUniqueValues.every(val => currentFilter.has(val));

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
                                    id={`select-all-${column}`}
                                    checked={isAllFilteredSelected}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                                <Label htmlFor={`select-all-${column}`} className="font-semibold">Select All</Label>
                            </div>
                           <Separator />
                        </div>
                        <ScrollArea className="h-60">
                            <div className="p-2 space-y-2">
                                {filteredUniqueValues.map(value => (
                                    <div key={value} className="flex items-center space-x-2 px-2">
                                        <Checkbox
                                            id={`${column}-${value}`}
                                            checked={currentFilter.has(String(value))}
                                            onCheckedChange={(checked) => handleCheckedChange(String(value), !!checked)}
                                        />
                                        <Label htmlFor={`${column}-${value}`}>{String(value)}</Label>
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

const CompletedJobsTable = ({ completedJobs, selectedJobIds, setSelectedJobIds }: { completedJobs: JobForInvoice[], selectedJobIds: string[], setSelectedJobIds: (ids: string[]) => void }) => {
    
    const [filters, setFilters] = useState<Filters>({});

    const filteredJobs = useMemo(() => {
        return completedJobs.filter(job => {
            return Object.entries(filters).every(([key, selectedValues]) => {
                if (selectedValues.size === 0) return true;
                const jobKey = key as keyof JobForInvoice;
                return selectedValues.has(job[jobKey]);
            });
        });
    }, [filters, completedJobs]);
    
    const filterableColumns: { title: string; column: keyof JobForInvoice }[] = [
        { title: "Date", column: "date" },
        { title: "Job ID", column: "id" },
        { title: "Client", column: "client" },
        { title: "Type", column: "type" },
        { title: "Vehicle Type", column: "vehicleType" },
    ];

    const handleSelectRow = (id: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedJobIds([...selectedJobIds, id]);
        } else {
            setSelectedJobIds(selectedJobIds.filter(jobId => jobId !== id));
        }
    };
    
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedJobIds(filteredJobs.map(job => job.id));
        } else {
            setSelectedJobIds([]);
        }
    };
    
    const isAllSelected = filteredJobs.length > 0 && selectedJobIds.length === filteredJobs.length;

    return (
     <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle className="font-headline text-xl">Completed Jobs Ready for Invoicing</CardTitle>
                <CardDescription>This is a list of all completed jobs that can be invoiced.</CardDescription>
            </div>
            <Button variant="outline" className="mt-4 sm:mt-0 w-full sm:w-auto">
                <Archive className="mr-2 h-4 w-4" />
                Daily Close & Archive
            </Button>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[50px]">
                                 <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            {filterableColumns.map(col => (
                                <FilterableHeader 
                                    key={col.column}
                                    title={col.title}
                                    column={col.column}
                                    filters={filters}
                                    setFilters={setFilters}
                                    jobs={completedJobs}
                                />
                            ))}
                            <TableHead className="text-right">Distance (KM)</TableHead>
                             <TableHead className="text-right">Fare (SAR)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredJobs.map((job) => (
                            <TableRow 
                                key={job.id} 
                                data-state={selectedJobIds.includes(job.id) ? "selected" : "unselected"}
                                className="cursor-pointer"
                                onClick={() => handleSelectRow(job.id, !selectedJobIds.includes(job.id))}
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedJobIds.includes(job.id)}
                                        onCheckedChange={(checked) => handleSelectRow(job.id, !!checked)}
                                    />
                                </TableCell>
                                <TableCell>{job.date}</TableCell>
                                <TableCell className="font-medium text-primary hover:underline">{job.id}</TableCell>
                                <TableCell>{job.client}</TableCell>
                                <TableCell>{job.type}</TableCell>
                                <TableCell>{job.vehicleType}</TableCell>
                                <TableCell className="text-right">{job.distance}</TableCell>
                                <TableCell className="text-right font-bold">{job.fare}</TableCell>
                            </TableRow>
                        ))}
                         {filteredJobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">
                                    No results found for your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
    );
};

const ManualInvoiceCreator = () => {
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: 1, description: 'Service Fee', kms: '', rate: '', amount: 0 },
    ]);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [billedTo, setBilledTo] = useState('');
    const { toast } = useToast();

    const handleAddItem = () => {
        setLineItems(prev => [...prev, { id: Date.now(), description: '', kms: '', rate: '', amount: 0 }]);
    };

    const handleRemoveItem = (id: number) => {
        if (lineItems.length > 1) {
            setLineItems(prev => prev.filter(item => item.id !== id));
        } else {
            toast({ variant: 'destructive', title: "Cannot remove last item" });
        }
    };

    const handleItemChange = (id: number, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        setLineItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                const kms = parseFloat(String(updatedItem.kms));
                const rate = parseFloat(String(updatedItem.rate));
                if (!isNaN(kms) && !isNaN(rate)) {
                    updatedItem.amount = kms * rate;
                } else if (field === 'amount') {
                    updatedItem.amount = parseFloat(String(value)) || 0;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const totalAmount = useMemo(() => {
        return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    }, [lineItems]);

    const handleSend = (method: 'email' | 'whatsapp') => {
        if (method === 'email') {
            if (!recipientEmail) {
                toast({ variant: 'destructive', title: 'Email required' });
                return;
            }
            window.location.href = `mailto:${recipientEmail}?subject=Invoice from Pro Seed&body=Please find your invoice attached. Total: ${totalAmount.toFixed(2)} SAR`;
        } else {
            if (!recipientPhone) {
                toast({ variant: 'destructive', title: 'Phone number required' });
                return;
            }
            const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(`Hi ${billedTo}, here is your invoice from Pro Seed for a total of ${totalAmount.toFixed(2)} SAR.`)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Create Invoice Manually</CardTitle>
                <CardDescription>Fill in the details below to generate a new invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="to-email">To Email</Label>
                        <Input id="to-email" type="email" placeholder="client@example.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="to-phone">To Phone (WhatsApp)</Label>
                        <Input id="to-phone" type="tel" placeholder="+966..." value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billed-to">Billed To</Label>
                        <Input id="billed-to" placeholder="Company Name" value={billedTo} onChange={(e) => setBilledTo(e.target.value)} />
                    </div>
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Description</TableHead>
                                <TableHead>Kms</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lineItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell><Input placeholder="Service description" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" placeholder="0" value={item.kms} onChange={(e) => handleItemChange(item.id, 'kms', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" placeholder="0.00" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" placeholder="0.00" value={item.amount} onChange={(e) => handleItemChange(item.id, 'amount', Number(e.target.value))} /></TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Button variant="outline" onClick={handleAddItem}><PlusCircle className="mr-2 h-4 w-4" />Add Item</Button>

                <div className="flex justify-end pt-4">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total (SAR)</span>
                            <span>{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button variant="secondary" onClick={() => handleSend('whatsapp')}><MessageSquare className="mr-2 h-4 w-4" />Send via WhatsApp</Button>
                <Button onClick={() => handleSend('email')}><Mail className="mr-2 h-4 w-4" />Send via Email</Button>
            </CardFooter>
        </Card>
    );
};

export default function InvoicePage() {
    const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);

    const handleBackToInvoices = () => {
        setGeneratedInvoice(null);
    }
    
    if (generatedInvoice) {
        return (
            <div>
                 <Button variant="outline" onClick={handleBackToInvoices} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invoice List
                </Button>
                <GeneratedInvoiceView invoiceData={generatedInvoice} />
            </div>
        )
    }

    return (
        <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto h-12">
                <TabsTrigger value="generate" className="h-full text-base">
                    Generate from Job
                </TabsTrigger>
                <TabsTrigger value="manual" className="h-full text-base">
                    Create Manually
                </TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="mt-6 space-y-6">
                <GenerateFromJob onGenerate={setGeneratedInvoice} />
            </TabsContent>
            <TabsContent value="manual" className="mt-6">
                <ManualInvoiceCreator />
            </TabsContent>
        </Tabs>
    );
}

