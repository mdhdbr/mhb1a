
import { create } from 'zustand';

type LocationState = { address: string; lat: number; lng: number };

type PendingJob = {
  bookingType: 'passenger' | 'shipper';
  vehicleType: string;
  pickup: LocationState;
  dropoff: LocationState;
  distance: string | null;
  fare: string;
  notes: string;
};

type ManualDispatchState = {
  pendingJob: PendingJob | null;
};

type ManualDispatchActions = {
  setPendingJob: (job: PendingJob) => void;
  clearPendingJob: () => void;
};

export const useManualDispatchStore = create<ManualDispatchState & ManualDispatchActions>((set) => ({
  pendingJob: null,
  setPendingJob: (job) => set({ pendingJob: job }),
  clearPendingJob: () => set({ pendingJob: null }),
}));
