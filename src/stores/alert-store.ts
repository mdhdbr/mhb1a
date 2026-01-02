
'use client';

import { create } from 'zustand';

// Defines the set of valid string identifiers for alert icons.
export type AlertIconType = "hourglass" | "warning" | "sos" | "info" | "acceptance";

export type Alert = {
  id: string; 
  type: string;
  description: string;
  time: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  icon: AlertIconType; // The icon is now represented by its string type.
  hint?: string;
};

type AlertState = {
  systemAlerts: Alert[];
  userAlerts: Alert[];
  fatigueAlerts: Alert[];
  alerts: Alert[];
};

type AlertActions = {
  addAlert: (alert: Omit<Alert, 'id' | 'time'> & { id?: string, time?: string }) => void;
  // Internal actions to be called by initializers
  _setSystemAlerts: (generatedAlerts: Alert[]) => void;
  _setFatigueAlerts: (fatigueAlerts: Alert[]) => void;
};

// This function will be used by the selector to compute the final alerts array
const computeAlerts = (state: AlertState) => {
    const combined = [...state.userAlerts, ...state.systemAlerts, ...state.fatigueAlerts];
    const priorityOrder = { "Critical": 1, "High": 2, "Medium": 3, "Low": 4 };
    
    // De-duplicate, keeping the one that is not from the system if a conflict exists.
    const uniqueAlerts = Array.from(new Map(combined.map(a => [a.id, a])).values());

    return uniqueAlerts.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 5;
        const priorityB = priorityOrder[b.priority] || 5;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // A more stable sort using ID if priorities are equal
        return b.id.localeCompare(a.id);
    });
};


export const useAlertStore = create<AlertState & AlertActions>((set, get) => ({
  systemAlerts: [],
  userAlerts: [],
  fatigueAlerts: [],
  alerts: [],

  addAlert: (alert) => {
    // This is for manually adding alerts, like the SOS one.
    const newAlert: Alert = { 
        ...alert, 
        id: alert.id || `user-alert-${Date.now()}`,
        time: alert.time || 'Just now',
    };
    set((state) => {
        const userAlerts = [newAlert, ...state.userAlerts.filter(a => a.id !== newAlert.id)];
        const newState = { ...state, userAlerts };
        return { userAlerts, alerts: computeAlerts(newState) };
    });
  },

  _setSystemAlerts: (generatedAlerts) => {
    // This action safely merges system-generated alerts.
    // We preserve existing timestamps to prevent "Just now" flicker.
    const existingAlerts = new Map(get().systemAlerts.map(a => [a.id, a]));
    const finalGeneratedAlerts = generatedAlerts.map(alert => {
        const existing = existingAlerts.get(alert.id);
        return existing ? { ...alert, time: existing.time } : alert;
    });

    set(state => {
        const newState = { ...state, systemAlerts: finalGeneratedAlerts };
        return { systemAlerts: finalGeneratedAlerts, alerts: computeAlerts(newState) };
    });
  },
  _setFatigueAlerts: (fatigueAlerts) => {
     set(state => {
        const newState = { ...state, fatigueAlerts };
        return { fatigueAlerts, alerts: computeAlerts(newState) };
    });
  }
}));
