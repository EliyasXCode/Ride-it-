import { create } from 'zustand';
import { LocationAddress, VehicleOption, VehicleCategory, Ride } from '@rideflow/shared';

interface RideState {
  pickup: LocationAddress | null;
  dropoff: LocationAddress | null;
  routePolyline: string | null;
  distanceKm: number;
  durationMinutes: number;
  vehicleOptions: VehicleOption[];
  selectedCategory: VehicleCategory;
  quoteToken: string | null;
  activeRide: Ride | null;
  driverLiveLocation: { lat: number; lng: number; heading?: number } | null;
  isEstimating: boolean;
  isBooking: boolean;

  setPickup: (pickup: LocationAddress | null) => void;
  setDropoff: (dropoff: LocationAddress | null) => void;
  setEstimates: (data: {
    vehicleOptions: VehicleOption[];
    quoteToken: string;
    distanceKm: number;
    durationMinutes: number;
    routePolyline?: string;
  }) => void;
  setSelectedCategory: (category: VehicleCategory) => void;
  setActiveRide: (ride: Ride | null) => void;
  setDriverLiveLocation: (loc: { lat: number; lng: number; heading?: number } | null) => void;
  resetBooking: () => void;
}

export const useRideStore = create<RideState>((set) => ({
  pickup: null,
  dropoff: null,
  routePolyline: null,
  distanceKm: 0,
  durationMinutes: 0,
  vehicleOptions: [],
  selectedCategory: 'economy',
  quoteToken: null,
  activeRide: null,
  driverLiveLocation: null,
  isEstimating: false,
  isBooking: false,

  setPickup: (pickup) => set({ pickup }),
  setDropoff: (dropoff) => set({ dropoff }),
  setEstimates: (data) =>
    set({
      vehicleOptions: data.vehicleOptions,
      quoteToken: data.quoteToken,
      distanceKm: data.distanceKm,
      durationMinutes: data.durationMinutes,
      routePolyline: data.routePolyline || null,
    }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setActiveRide: (activeRide) => set({ activeRide }),
  setDriverLiveLocation: (driverLiveLocation) => set({ driverLiveLocation }),
  resetBooking: () =>
    set({
      pickup: null,
      dropoff: null,
      routePolyline: null,
      distanceKm: 0,
      durationMinutes: 0,
      vehicleOptions: [],
      quoteToken: null,
      activeRide: null,
      driverLiveLocation: null,
    }),
}));
