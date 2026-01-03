
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
import { useCustomerStore } from '@/stores/customer-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import type { Customer } from '@/stores/customer-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const getRatingVariant = (rating: Customer['rating']): "default" | "secondary" | "destructive" | "outline" => {
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

const getRatingClass = (rating: Customer['rating']) => {
    switch(rating) {
        case 'Platinum': return 'bg-purple-600 text-white border-purple-700';
        case 'Gold': return 'bg-yellow-500 text-black border-yellow-600';
        case 'Silver': return 'bg-gray-400 text-white border-gray-500';
        case 'Bronze': return 'bg-orange-700 text-white border-orange-800';
        case 'Blue': return 'bg-blue-500 text-white border-blue-600';
        default: return 'border-gray-300';
    }
};


export default function CustomerDataPage() {
  const { customers, setCustomers } = useCustomerStore();
  const [filter, setFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSync = () => {
    setIsSyncing(true);
    toast({ title: 'Syncing Contacts...', description: 'Fetching latest customer data.' });
    
    // Simulate an API call
    setTimeout(() => {
      // Simulate data change: e.g., toggle status of the first customer
      const updatedCustomers = customers.map((c, index) => {
          if (index === 0) {
              return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' };
          }
          return c;
      });
      setCustomers(updatedCustomers);
      
      setIsSyncing(false);
      toast({ title: 'Sync Complete!', description: 'Customer contacts and statuses have been updated.' });
    }, 1500);
  };

  const filteredCustomers = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    
    return customers.filter(customer => {
      if (!filter) return true;
      
      return (
        customer.name.toLowerCase().includes(lowercasedFilter) ||
        customer.rating.toLowerCase().includes(lowercasedFilter) ||
        customer.status.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [filter, customers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Customer Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <p className="text-sm text-muted-foreground flex-1">This table displays customer information and their credit rating.</p>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Filter customers..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 h-11"
                  />
              </div>
              <Button onClick={handleSync} disabled={isSyncing} className="h-11">
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="sr-only">Sync Contacts</span>
              </Button>
            </div>
        </div>
         <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                  return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <Badge variant={getRatingVariant(customer.rating)} className={cn('font-bold', getRatingClass(customer.rating))}>
                            {customer.rating}
                          </Badge>
                        </TableCell>
                         <TableCell>
                          <Badge variant={customer.status === 'Active' ? 'default' : 'outline'}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                  );
                })}
                 {filteredCustomers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No customers found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
