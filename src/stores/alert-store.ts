
'use client';

import { create } from 'zustand';
import type { Timestamp } from 'firebase/firestore';

export type AlertIconType = 'hourglass' | 'warning' | 'sos' | 'info' | 'acceptance' | 'callout' | 'landline' | 'integration' | 'flight' | 'pickup' | 'dropoff' | 'waiting';

export type Alert = {
  alertId: string;
  type: string; // e.g., 'late_pickup', 'driver_offline'
  severity: 'critical' | 'warning' | 'info';
  jobId?: string;
  driverId?: string;
  vehicleId?: string;
  status: 'active' | 'resolved';
  message: string;
  hint?: string;
  icon?: string; // e.g., 'sos', 'warning'
  triggeredAt: Timestamp;
  resolvedAt?: Timestamp | null;
  source: 'system' | 'driver' | 'integration';
  metadata?: Record<string, any>;
};


type AlertState = {
  alerts: Alert[];
};

type AlertActions = {
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
};

const priorityOrder: Record<string, number> = { "critical": 1, "warning": 2, "info": 3 };

export const useAlertStore = create<AlertState & AlertActions>((set, get) => ({
  alerts: [],
  setAlerts: (alerts) => {
    const sortedAlerts = [...alerts].sort((a, b) => {
        const priorityA = priorityOrder[a.severity] || 4;
        const priorityB = priorityOrder[b.severity] || 4;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // Sort by time descending for same priority
        return (b.triggeredAt?.seconds || 0) - (a.triggeredAt?.seconds || 0);
    });
    set({ alerts: sortedAlerts });
  },
  addAlert: (alert) => {
    const currentAlerts = get().alerts;
    const newAlerts = [...currentAlerts, alert];
    const sortedAlerts = newAlerts.sort((a, b) => {
        const priorityA = priorityOrder[a.severity] || 4;
        const priorityB = priorityOrder[b.severity] || 4;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // Sort by time descending for same priority
        return (b.triggeredAt?.seconds || 0) - (a.triggeredAt?.seconds || 0);
    });
    set({ alerts: sortedAlerts });
  },
}));
