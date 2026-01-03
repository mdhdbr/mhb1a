import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  valueClassName?: string;
};

export default function SummaryCard({ title, value, icon, description, valueClassName }: SummaryCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold font-headline", valueClassName)}>{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
