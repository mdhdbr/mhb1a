
'use client';

import { create } from 'zustand';
import type { UserProfile } from '@/lib/types';

type UserState = {
  users: UserProfile[];
  isLoading: boolean;
  error: Error | null;
  setUsers: (users: UserProfile[]) => void;
  setError: (error: Error) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: true,
  error: null,
  setUsers: (users) => set({ users, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false, users: [] }),
  setLoading: (isLoading) => set({ isLoading }),
}));
