import { create } from 'zustand';
import { UserProfile, DriverProfile } from '@rideflow/shared';
import { fetchApi } from '../lib/api';

interface AuthState {
  user: UserProfile | null;
  driverProfile: DriverProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: UserProfile | null, driverProfile?: DriverProfile | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  driverProfile: null,
  isLoading: true,
  error: null,

  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await fetchApi<{ user: UserProfile; driverProfile: DriverProfile | null }>('/auth/me');
      set({ user: data.user, driverProfile: data.driverProfile, isLoading: false });
    } catch {
      set({ user: null, driverProfile: null, isLoading: false });
    }
  },

  setUser: (user, driverProfile = null) => {
    set({ user, driverProfile, isLoading: false });
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    set({ user: null, driverProfile: null });
    window.location.href = '/login';
  },
}));
