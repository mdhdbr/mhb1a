

'use client';

import SummaryCard from '@/components/summary-card';
import DynamicFleetCompositionChart from '@/components/dynamic-fleet-composition-chart';
import DynamicDriverFatigueChart from '@/components/dynamic-driver-fatigue-chart';
import { Truck, MessageCircle, Car, UserCheck, AlertTriangle } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Logo from '@/components/icons/logo';
import Link from 'next/link';
import { useVehicleJobStore } from '@/stores/job-store';
import { useAlertStore } from '@/stores/alert-store';
import { useUserStore } from '@/stores/user-store';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { vehicles } = useVehicleJobStore();
  const { alerts } = useAlertStore();
  const { users } = useUserStore(); // Get users for unread count

  // Unread count logic remains, but simplified source. This is a mock for now.
  const unreadCount = useMemo(() => {
    return 3; 
  }, []);

  const liveSummaryData = useMemo(() => {
    const activeTrips = vehicles.filter(v => v.job.id && !['Completed', 'Idle', 'Empty'].includes(v.job.status)).length;
    const idleDrivers = vehicles.filter(v => v.status === 'Idle' || (v.job.status && ['Empty', 'Completed', 'Idle'].includes(v.job.status))).length;

    return {
      totalVehicles: vehicles.length,
      activeTrips,
      idleDrivers,
    };
  }, [vehicles]);

  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(alert => alert.severity === 'critical').length;
  }, [alerts]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Link href="/dashboard/fleet">
            <SummaryCard 
            title="Total Vehicles"
            value={liveSummaryData.totalVehicles}
            icon={<Truck className="h-5 w-5 text-muted-foreground" />}
            description="Across all fleets"
            />
        </Link>
        
        <Link href="/dashboard/sms">
            <SummaryCard 
            title="Unread Messages"
            value={unreadCount}
            icon={<MessageCircle className="h-5 w-5 text-muted-foreground" />}
            description="Total active conversations"
            valueClassName="text-blue-500"
            />
        </Link>
        
        <Link href="/dashboard/inprogress">
            <SummaryCard 
            title="Active Trips"
            value={liveSummaryData.activeTrips}
            icon={<Car className="h-5 w-5 text-muted-foreground" />}
            description="Currently in progress"
            />
        </Link>
        <SummaryCard 
          title="Idle Drivers"
          value={liveSummaryData.idleDrivers}
          icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
          description="Awaiting job assignment"
          valueClassName="text-green-600"
        />

        <Link href="/dashboard/alerts">
            <SummaryCard 
              title="Critical Alerts"
              value={criticalAlertsCount}
              icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
              description="Require immediate attention"
              valueClassName="text-destructive"
            />
        </Link>

      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <DynamicFleetCompositionChart />
        <DynamicDriverFatigueChart />
      </div>
    </div>
  );
}
