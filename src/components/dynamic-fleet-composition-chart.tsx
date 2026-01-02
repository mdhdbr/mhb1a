
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from 'recharts';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useVehicleJobStore } from '@/stores/job-store';
import type { Rate, Vehicle } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from './ui/skeleton';

type ChartData = {
  name: string;
  total: number;
  hasJob: boolean;
};

const chartConfig = {
  total: {
    label: 'Vehicles',
  },
};

const VehicleTypeChart = ({ data }: { data: ChartData[] }) => {
  const containerHeight = useMemo(() => {
    // Each bar needs ~30px of space. Min height of 200px.
    const calculatedHeight = data.length * 30 + 60; // 60px for padding/axes
    return Math.max(200, calculatedHeight);
  }, [data.length]);
  
  if (data.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No vehicles in this category.</div>;
  }
  return (
    <ChartContainer config={chartConfig} style={{ height: `${containerHeight}px`, width: '100%' }}>
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 30 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.substring(0, 15)}
          className="text-xs"
        />
        <XAxis dataKey="total" type="number" hide />
        <ChartTooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={<ChartTooltipContent hideLabel formatter={(value, name, item) => `${item.payload.name}: ${value}`}/>}
        />
        <Bar dataKey="total" radius={4} barSize={16}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.hasJob ? 'hsl(var(--primary))' : 'hsl(var(--chart-2))'} />
          ))}
          <LabelList dataKey="total" position="right" offset={8} className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};


export default function DynamicFleetCompositionChart() {
  const [activeTab, setActiveTab] = useState<'passenger' | 'shipper' | 'equipment'>('passenger');
  const firestore = useFirestore();
  const { vehicles } = useVehicleJobStore();
  const pricingCollectionQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'pricing') : null),
    [firestore]
  );
  const { data: pricingRates, isLoading: isLoadingRates } = useCollection<Rate>(pricingCollectionQuery);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);


  const chartData = useMemo(() => {
    if (!pricingRates || !vehicles) {
      return { passenger: [], shipper: [], equipment: [] };
    }

    const categoryData: { passenger: ChartData[], shipper: ChartData[], equipment: ChartData[] } = {
      passenger: [],
      shipper: [],
      equipment: [],
    };
    
    const activeVehicleTypesWithJobs = new Set(
        vehicles.filter(v => v.job.id && !['Completed', 'Idle', 'Empty'].includes(v.job.status)).map(v => v.vehicleType.toUpperCase())
    );
    
    // Use pricingRates as the master list of all possible vehicle types.
    pricingRates.forEach(rate => {
        const category = rate.category;
        const vehicleTypeUpper = rate.vehicleType.toUpperCase();
        
        // Count vehicles of this type from the live vehicle store
        const count = vehicles.filter(v => v.vehicleType.toUpperCase() === vehicleTypeUpper).length;

        // Prevent duplicates in case pricing data has inconsistencies
        if (!categoryData[category].some(item => item.name === rate.vehicleType)) {
          categoryData[category].push({
            name: rate.vehicleType,
            total: count,
            hasJob: activeVehicleTypesWithJobs.has(vehicleTypeUpper),
          });
        }
    });

    Object.values(categoryData).forEach(arr => arr.sort((a, b) => b.total - a.total));

    return categoryData;
  }, [pricingRates, vehicles]);

  const getCategoryCount = (category: 'passenger' | 'shipper' | 'equipment') => {
    return chartData[category]?.reduce((acc, item) => acc + item.total, 0) ?? 0;
  };
  
  if (!isClient || isLoadingRates) {
      return (
           <Card className="shadow-sm h-full">
            <CardHeader>
                <CardTitle className="font-headline">Fleet Composition</CardTitle>
                <CardDescription>Total number of vehicles per type across the entire fleet.</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[40px] w-[300px] mb-4" />
                <Skeleton className="h-[250px] w-full" />
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="font-headline">Fleet Composition</CardTitle>
        <CardDescription>Total number of vehicles per type across the entire fleet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="passenger">Passenger ({getCategoryCount('passenger')})</TabsTrigger>
            <TabsTrigger value="shipper">Shipper ({getCategoryCount('shipper')})</TabsTrigger>
            <TabsTrigger value="equipment">Equipment ({getCategoryCount('equipment')})</TabsTrigger>
          </TabsList>
          <TabsContent value="passenger" className="pt-4">
            <VehicleTypeChart data={chartData.passenger} />
          </TabsContent>
          <TabsContent value="shipper" className="pt-4">
            <VehicleTypeChart data={chartData.shipper} />
          </TabsContent>
          <TabsContent value="equipment" className="pt-4">
            <VehicleTypeChart data={chartData.equipment} />
          </TabsContent>
        </Tabs>
         <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary" /> Vehicle type has active jobs</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-chart-2" /> Vehicle type is idle</div>
        </div>
      </CardContent>
    </Card>
  );
}
