import { create } from 'zustand';

type MapState = {
  isAutoRefreshOn: boolean;
  showCallsigns: boolean;
  showTraffic: boolean; // This is a placeholder as leaflet does not have a traffic layer
  shouldFindNearest: boolean;
  isTracking: boolean;
  showRoutes: boolean;
  showIncidents: boolean;
};

type MapActions = {
  toggleAutoRefresh: () => void;
  toggleShowCallsigns: () => void;
  toggleShowTraffic: () => void;
  findNearestVehicle: () => void;
  setShouldFindNearest: (should: boolean) => void;
  toggleTracking: () => void;
  toggleShowRoutes: () => void;
  toggleShowIncidents: () => void;
};

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  isAutoRefreshOn: false,
  showCallsigns: true,
  showTraffic: false,
  shouldFindNearest: false,
  isTracking: false,
  showRoutes: false,
  showIncidents: false,

  toggleAutoRefresh: () => set(state => ({ isAutoRefreshOn: !state.isAutoRefreshOn })),
  toggleShowCallsigns: () => set(state => ({ showCallsigns: !state.showCallsigns })),
  toggleShowTraffic: () => set(state => ({ showTraffic: !state.showTraffic })),
  findNearestVehicle: () => set({ shouldFindNearest: true }),
  setShouldFindNearest: (should: boolean) => set({ shouldFindNearest: should }),
  toggleTracking: () => set(state => ({ isTracking: !state.isTracking })),
  toggleShowRoutes: () => set(state => ({ showRoutes: !state.showRoutes })),
  toggleShowIncidents: () => set(state => ({ showIncidents: !state.showIncidents })),
}));
