'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, ServerCrash } from 'lucide-react';

export default function GlobalFind() {
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [searchResult, setSearchResult] = useState<'found' | 'not-found' | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = (type: 'vehicle' | 'job') => {
    const query = type === 'vehicle' ? vehicleSearch : jobSearch;

    setSearchResult(null);

    if (!query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'Please enter a search term.',
      });
      return;
    }

    const isFound = !query.toLowerCase().includes('notfound');

    if (isFound) {
      setSearchResult('found');
      toast({
        title: 'Result Found!',
        description: `Navigating to map for "${query}".`,
      });
      // Navigate to the map page. The popover will close automatically.
      router.push(`/dashboard/fleet-tracking?search=${query}`);
    } else {
      setSearchResult('not-found');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium leading-none font-headline">Find</h4>
        <p className="text-sm text-muted-foreground">
          Locate a vehicle or job.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Find Vehicle</h3>
        <p className="text-sm text-muted-foreground">
          Search by plate number or driver.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={vehicleSearch}
            onChange={(e) => {
              setVehicleSearch(e.target.value);
              setSearchResult(null);
            }}
          />
        </div>
        <Button className="w-full" onClick={() => handleSearch('vehicle')}>
          Find Vehicle
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">Find by Job ID</h3>
        <p className="text-sm text-muted-foreground">
          Enter a Job ID to locate the assigned vehicle.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter Job ID..."
            className="pl-10"
            value={jobSearch}
            onChange={(e) => {
              setJobSearch(e.target.value);
              setSearchResult(null);
            }}
          />
        </div>
        <Button className="w-full" onClick={() => handleSearch('job')}>
          Find Job
        </Button>
      </div>

      {searchResult === 'not-found' && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-dashed border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <ServerCrash className="h-5 w-5" />
          <p>No results found for your query.</p>
        </div>
      )}
    </div>
  );
}
