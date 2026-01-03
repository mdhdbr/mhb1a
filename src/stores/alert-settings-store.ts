
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AlertTimeThreshold = 'late_accept' | 'soft_allocated' | 'late_pickup' | 'late_dropoff' | 'waiting_time' | 'schedule_shifted';
export type AlertRule = AlertTimeThreshold | 'driver_offline' | 'callout' | 'landline_callout' | 'passenger_notified' | 'passenger_not_notified' | 'integration_warning' | 'integration_info' | 'trip_cancelled' | 'location_changed' | 'terminal_gate_changed' | 'schedule_not_validated' | 'flight_delayed_early' | 'flight_cancelled' | 'airport_changed' | 'terminal_changed' | 'flight_not_validated' | 'job_changes';

type RuleConfig = {
  enabled: boolean;
  threshold?: number; // Time in minutes for relevant alerts
};

type AlertSettingsState = {
  rules: Record<AlertRule, RuleConfig>;
};

type AlertSettingsActions = {
  setRuleEnabled: (rule: AlertRule, enabled: boolean) => void;
  setRuleThreshold: (rule: AlertTimeThreshold, threshold: number) => void;
};

const initialRules: Record<AlertRule, RuleConfig> = {
    // Job Workflow
    late_accept: { enabled: true, threshold: 2 },
    job_changes: { enabled: true },
    soft_allocated: { enabled: true, threshold: 15 },
    driver_offline: { enabled: true },

    // On-the-road
    late_pickup: { enabled: true, threshold: 10 },
    late_dropoff: { enabled: true, threshold: 15 },
    waiting_time: { enabled: true, threshold: 5 },

    // Passenger/Comm
    callout: { enabled: true },
    landline_callout: { enabled: true },
    passenger_notified: { enabled: true },
    passenger_not_notified: { enabled: true },

    // Logistics & PAX
    schedule_shifted: { enabled: true, threshold: 5 },
    trip_cancelled: { enabled: true },
    location_changed: { enabled: true },
    terminal_gate_changed: { enabled: true },
    schedule_not_validated: { enabled: true },

    // Airport
    flight_delayed_early: { enabled: true },
    flight_cancelled: { enabled: true },
    airport_changed: { enabled: true },
    terminal_changed: { enabled: true },
    flight_not_validated: { enabled: true },
    
    // Integration
    integration_info: { enabled: true },
    integration_warning: { enabled: true },
};


export const useAlertSettingsStore = create<AlertSettingsState & AlertSettingsActions>()(
  persist(
    (set, get) => ({
      rules: initialRules,
      setRuleEnabled: (rule, enabled) => {
        set((state) => ({
          rules: {
            ...state.rules,
            [rule]: { ...state.rules[rule], enabled },
          },
        }));
      },
      setRuleThreshold: (rule, threshold) => {
        set((state) => {
          if (state.rules[rule].threshold !== undefined) {
            return {
              rules: {
                ...state.rules,
                [rule]: { ...state.rules[rule], threshold },
              },
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'alert-settings-storage', // name of the item in storage (must be unique)
    }
  )
);
