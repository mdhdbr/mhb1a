
'use client';

import { useMemo, useEffect, useState } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartData } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { useDriverStore } from '@/stores/driver-store';

const chartConfig = {
  value: {
    label: 'Drivers',
    color: "hsl(var(--chart-2))",
  },
  LOW: {
    label: 'Low',
    color: "hsl(var(--chart-2))",
  },
  MEDIUM: {
    label: 'Medium',
    color: "hsl(var(--chart-3))",
  },
  HIGH: {
    label: 'High',
    color: "hsl(var(--chart-4))",
  },
  CRITICAL: {
    label: 'Critical',
    color: "hsl(var(--chart-1))",
  },
};


export default function DynamicDriverFatigueChart() {
  const [isClient, setIsClient] = useState(false);
  // Read live fatigue summary directly from the centralized driver store
  const { fatigueSummary, isLoading } = useDriverStore(state => ({
      fatigueSummary: state.fatigueSummary,
      isLoading: state.driverGridData.length === 0 // Consider it loading if no drivers are present
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fatigueData: ChartData = useMemo(() => {
    if (!fatigueSummary) return [];
    
    return Object.entries(fatigueSummary).map(([name, value]) => ({
      name,
      value,
    })).filter(item => item.value > 0); // Only include categories that have drivers
  }, [fatigueSummary]);

  const totalDrivers = useMemo(() => fatigueData.reduce((acc, curr) => acc + curr.value, 0), [fatigueData]);
  
  if (!isClient || isLoading) {
    return (
        <Card className="flex flex-col h-full shadow-sm">
             <CardHeader className="items-center pb-0">
                <CardTitle className="font-headline">Driver Fatigue Levels</CardTitle>
                <CardDescription>Distribution of drivers by fatigue status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-headline">Driver Fatigue Levels</CardTitle>
        <CardDescription>Distribution of drivers by fatigue status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalDrivers > 0 ? (
            <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
            >
            <PieChart>
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    formatter={(value, name, item) => {
                      const itemPayload = item.payload as ChartData[number];
                      const colorKey = itemPayload.name.toUpperCase() as keyof typeof chartConfig;
                      const color = chartConfig[colorKey]?.color || '#ccc';
                      return (
                          <div className="flex items-center">
                              <div className="w-2.5 h-2.5 rounded-full mr-2" style={{backgroundColor: color}}></div>
                              <span>{itemPayload.name}: {value} driver(s)</span>
                          </div>
                      )
                    }}
                    hideLabel 
                />}
                />
                <Pie
                data={fatigueData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                strokeWidth={5}
                >
                {fatigueData.map((entry) => {
                  const colorKey = entry.name.toUpperCase() as keyof typeof chartConfig;
                  return (
                    <Cell key={`cell-${entry.name}`} fill={chartConfig[colorKey]?.color || '#ccc'} />
                  )
                })}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
            </ChartContainer>
        ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No fatigue data available.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
