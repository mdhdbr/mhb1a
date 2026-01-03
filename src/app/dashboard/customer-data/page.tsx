
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
import { useClientStore } from '@/stores/client-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import type { Client } from '@/stores/client-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const getRatingVariant = (rating: Client['rating']): "default" | "secondary" | "destructive" | "outline" => {
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

const getRatingClass = (rating: Client['rating']) => {
    switch(rating) {
        case 'Platinum': return 'bg-purple-600 text-white border-purple-700';
        case 'Gold': return 'bg-yellow-500 text-black border-yellow-600';
        case 'Silver': return 'bg-gray-400 text-white border-gray-500';
        case 'Bronze': return 'bg-orange-700 text-white border-orange-800';
        case 'Blue': return 'bg-blue-500 text-white border-blue-600';
        default: return 'border-gray-300';
    }
};


export default function ClientDataPage() {
  const { clients, setClients } = useClientStore();
  const [filter, setFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSync = () => {
    setIsSyncing(true);
    toast({ title: 'Syncing Contacts...', description: 'Fetching latest client data.' });
    
    // Simulate an API call
    setTimeout(() => {
      // Simulate data change: e.g., toggle status of the first client
      const updatedClients = clients.map((c, index) => {
          if (index === 0) {
              return { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' };
          }
          return c;
      });
      setClients(updatedClients);
      
      setIsSyncing(false);
      toast({ title: 'Sync Complete!', description: 'Client contacts and statuses have been updated.' });
    }, 1500);
  };

  const filteredClients = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    
    return clients.filter(client => {
      if (!filter) return true;
      
      return (
        client.name.toLowerCase().includes(lowercasedFilter) ||
        client.rating.toLowerCase().includes(lowercasedFilter) ||
        client.status.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [filter, clients]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Client Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <p className="text-sm text-muted-foreground flex-1">This table displays client information and their credit rating.</p>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Filter clients..."
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
                <TableHead>Client Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                  return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <Badge variant={getRatingVariant(client.rating)} className={cn('font-bold', getRatingClass(client.rating))}>
                            {client.rating}
                          </Badge>
                        </TableCell>
                         <TableCell>
                          <Badge variant={client.status === 'Active' ? 'default' : 'outline'}>
                            {client.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                  );
                })}
                 {filteredClients.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No clients found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
