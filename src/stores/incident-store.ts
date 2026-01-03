
import { create } from 'zustand';
import type { IncidentReportData } from '@/lib/types';

type IncidentState = {
  incidents: IncidentReportData[];
};

type IncidentActions = {
  addIncident: (incident: IncidentReportData) => void;
  removeIncident: (incidentId: string) => void;
};

export const useIncidentStore = create<IncidentState & IncidentActions>((set) => ({
  incidents: [],
  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
    })),
  removeIncident: (incidentId) =>
    set((state) => ({
      incidents: state.incidents.filter(
        (incident) => incident.id !== incidentId
      ),
    })),
}));
