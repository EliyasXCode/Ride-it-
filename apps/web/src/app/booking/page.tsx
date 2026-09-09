'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRideStore } from '../../stores/rideStore';
import { useAuthStore } from '../../stores/authStore';
import { fetchApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { InteractiveMap } from '../../components/InteractiveMap';
import { VehicleSelector } from '../../components/VehicleSelector';
import { TripProgressCard } from '../../components/TripProgressCard';
import { SOCKET_EVENTS, Ride, VehicleCategory } from '@rideflow/shared';
import { formatDistance, formatDuration } from '../../lib/formatters';
import { searchPlaces, PlaceSuggestion } from '../../lib/places';
import {
  MapPin,
  Navigation,
  ArrowRight,
  Shield,
  CreditCard,
  Banknote,
  Home,
  Briefcase,
  AlertCircle,
  Clock,
  Sparkles,
  Loader2,
  Plane,
  Train,
  X,
  Search,
} from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const {
    pickup,
    dropoff,
    setPickup,
    setDropoff,
    vehicleOptions,
    selectedCategory,
    setSelectedCategory,
    quoteToken,
    setEstimates,
    activeRide,
    setActiveRide,
    setDriverLiveLocation,
    distanceKm,
    durationMinutes,
    resetBooking,
  } = useRideStore();

  // Inputs start completely blank with placeholders
  const [pickupInput, setPickupInput] = useState(pickup?.address || '');
  const [dropoffInput, setDropoffInput] = useState(dropoff?.address || '');

  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_sandbox'>('cash');
  const [isEstimating, setIsEstimating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [locPermissionError, setLocPermissionError] = useState<string | null>(null);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Sync inputs if store changes externally (e.g. via map click)
  useEffect(() => {
    if (pickup?.address && pickup.address !== pickupInput) {
      setPickupInput(pickup.address);
    }
  }, [pickup]);

  useEffect(() => {
    if (dropoff?.address && dropoff.address !== dropoffInput) {
      setDropoffInput(dropoff.address);
    }
  }, [dropoff]);

  useEffect(() => {
    fetchUser().catch(() => {});
  }, [fetchUser]);

  // Sync active ride on page load
  useEffect(() => {
    fetchApi<{ activeRide: Ride | null }>('/rides/active')
      .then((data) => {
        if (data.activeRide) {
          setActiveRide(data.activeRide);
          if (data.activeRide.pickup) setPickup(data.activeRide.pickup);
          if (data.activeRide.dropoff) setDropoff(data.activeRide.dropoff);
        }
      })
      .catch(() => {});
  }, [setActiveRide, setPickup, setDropoff]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickupContainerRef.current &&
        !pickupContainerRef.current.contains(event.target as Node)
      ) {
        setShowPickupDropdown(false);
      }
      if (
        dropoffContainerRef.current &&
        !dropoffContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropoffDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Setup Socket.IO listeners
  useEffect(() => {
    const socket = getSocket();

    if (user) {
      socket.emit(SOCKET_EVENTS.JOIN_USER_ROOM, { userId: user.id });
    }

    if (activeRide) {
      socket.emit(SOCKET_EVENTS.JOIN_RIDE_ROOM, { rideId: activeRide.id });
    }

    socket.on(SOCKET_EVENTS.RIDE_STATUS_UPDATED, (data: { rideId: string; status: any; ride: Ride }) => {
      setActiveRide(data.ride);
    });

    socket.on(
      SOCKET_EVENTS.DRIVER_LOCATION_UPDATED,
      (data: { rideId: string; lat: number; lng: number; heading?: number }) => {
        setDriverLiveLocation({ lat: data.lat, lng: data.lng, heading: data.heading });
      }
    );

    return () => {
      socket.off(SOCKET_EVENTS.RIDE_STATUS_UPDATED);
      socket.off(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED);
    };
  }, [user, activeRide, setActiveRide, setDriverLiveLocation]);

  // =========================================================================
  // LIVE AUTOCOMPLETE SEARCH
  // =========================================================================
  useEffect(() => {
    if (!pickupInput.trim() || pickupInput.length < 2 || pickupInput === pickup?.address) {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const results = await searchPlaces(
          pickupInput,
          pickup ? { lat: pickup.lat, lng: pickup.lng } : undefined
        );
        setPickupSuggestions(results);
        setShowPickupDropdown(results.length > 0);
      } catch {
        setPickupSuggestions([]);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pickupInput, pickup?.address]);

  useEffect(() => {
    if (!dropoffInput.trim() || dropoffInput.length < 2 || dropoffInput === dropoff?.address) {
      setDropoffSuggestions([]);
      setShowDropoffDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDropoff(true);
      try {
        const results = await searchPlaces(
          dropoffInput,
          pickup ? { lat: pickup.lat, lng: pickup.lng } : undefined
        );
        setDropoffSuggestions(results);
        setShowDropoffDropdown(results.length > 0);
      } catch {
        setDropoffSuggestions([]);
      } finally {
        setIsSearchingDropoff(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [dropoffInput, dropoff?.address, pickup]);

  // Selection handlers for autocomplete
  const handleSelectPickup = (place: PlaceSuggestion) => {
    setPickup({ address: place.address, lat: place.lat, lng: place.lng });
    setPickupInput(place.name || place.address);
    setShowPickupDropdown(false);
    setBookingError(null);
  };

  const handleSelectDropoff = (place: PlaceSuggestion) => {
    setDropoff({ address: place.address, lat: place.lat, lng: place.lng });
    setDropoffInput(place.name || place.address);
    setShowDropoffDropdown(false);
    setBookingError(null);
  };

  // Handle current location GPS on demand
  const handleUseCurrentLocation = () => {
    setLocPermissionError(null);
    if (!navigator.geolocation) {
      setLocPermissionError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let address = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            address = parts.slice(0, 3).join(', ');
          }
        } catch {}

        setPickup({ address, lat, lng });
        setPickupInput(address);
        setShowPickupDropdown(false);
      },
      () => {
        setLocPermissionError('Location access was denied. Please type your location in the box.');
      },
      { timeout: 8000 }
    );
  };

  // Quick select saved places
  const handleQuickPlace = (type: 'home' | 'work' | 'airport' | 'station') => {
    let place = {
      address: 'Dr. Babasaheb Ambedkar International Airport, Nagpur',
      lat: 21.0922,
      lng: 79.0474,
    };

    if (type === 'home') {
      place = {
        address: 'Dharampeth, Nagpur',
        lat: 21.145,
        lng: 79.06,
      };
    } else if (type === 'work') {
      place = {
        address: 'Nagpur IT Park, Gayatri Nagar',
        lat: 21.112,
        lng: 79.052,
      };
    } else if (type === 'station') {
      place = {
        address: 'Nagpur Junction Railway Station',
        lat: 21.1528,
        lng: 79.0888,
      };
    }

    setDropoff(place);
    setDropoffInput(place.address);
    setShowDropoffDropdown(false);
  };

  // Calculate fare estimates
  const handleCalculateFare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pickupInput.trim() || !dropoffInput.trim()) {
      setBookingError('Please enter both pickup and destination locations.');
      return;
    }

    setIsEstimating(true);
    setBookingError(null);

    try {
      // Ensure we have coordinates for pickup
      let activePickup = pickup;
      if (!activePickup || activePickup.address !== pickupInput) {
        const found = await searchPlaces(pickupInput);
        if (found.length > 0) {
          activePickup = { address: found[0].address, lat: found[0].lat, lng: found[0].lng };
          setPickup(activePickup);
        } else {
          activePickup = { address: pickupInput, lat: 21.1458, lng: 79.0882 };
          setPickup(activePickup);
        }
      }

      // Ensure we have coordinates for dropoff
      let activeDropoff = dropoff;
      if (!activeDropoff || activeDropoff.address !== dropoffInput) {
        const found = await searchPlaces(dropoffInput);
        if (found.length > 0) {
          activeDropoff = { address: found[0].address, lat: found[0].lat, lng: found[0].lng };
          setDropoff(activeDropoff);
        } else {
          activeDropoff = { address: dropoffInput, lat: 21.0922, lng: 79.0474 };
          setDropoff(activeDropoff);
        }
      }

      const res = await fetchApi<{
        quoteToken: string;
        distanceKm: number;
        durationMinutes: number;
        polyline: string;
        vehicleOptions: any[];
      }>('/fares/estimate', {
        method: 'POST',
        body: JSON.stringify({
          pickup: activePickup,
          dropoff: activeDropoff,
          promoCode: promoCode || undefined,
        }),
      });

      setEstimates({
        vehicleOptions: res.vehicleOptions,
        quoteToken: res.quoteToken,
        distanceKm: res.distanceKm,
        durationMinutes: res.durationMinutes,
        routePolyline: res.polyline,
      });
    } catch (err: any) {
      setBookingError(err.message || 'Failed to calculate route and fare estimate.');
    } finally {
      setIsEstimating(false);
    }
  };

  // Automatically trigger fare calculation when both pickup & dropoff are selected
  useEffect(() => {
    if (pickup && dropoff) {
      handleCalculateFare();
    }
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!user) {
      router.push('/login?redirect=/booking');
      return;
    }

    if (!quoteToken || !pickup || !dropoff) {
      setBookingError('Please calculate a fare quote first.');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const res = await fetchApi<{ ride: Ride; rideId?: string }>('/rides/book', {
        method: 'POST',
        body: JSON.stringify({
          pickup,
          dropoff,
          vehicleCategory: selectedCategory,
          category: selectedCategory,
          paymentMethod,
          quoteToken,
          idempotencyKey: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        }),
      });

      const bookedRide = res.ride || (res as any).data?.ride;
      if (bookedRide) {
        setActiveRide(bookedRide);
        const socket = getSocket();
        const rideId = bookedRide.id || (bookedRide as any)._id;
        socket.emit(SOCKET_EVENTS.JOIN_RIDE_ROOM, { rideId });
      }
    } catch (err: any) {
      setBookingError(err.message || 'Could not complete ride booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden bg-charcoal-50">
      {/* LEFT / MOBILE BOOKING PANEL */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-white border-r border-charcoal-200/80 flex flex-col lg:h-full z-10 shadow-lg lg:overflow-y-auto">
        <div className="p-6 space-y-6 flex-1">
          {/* Active Ride Lifecycle View */}
          {activeRide ? (
            <TripProgressCard
              ride={activeRide}
              onCancelled={() => {
                resetBooking();
                setActiveRide(null);
                setPickupInput('');
                setDropoffInput('');
              }}
              onRated={() => {
                resetBooking();
                setActiveRide(null);
                setPickupInput('');
                setDropoffInput('');
              }}
            />
          ) : (
            /* Booking Flow View */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">Request a Ride</h2>
                <p className="text-xs text-charcoal-500 mt-1">
                  Choose your route, review guaranteed prices, and connect with verified drivers.
                </p>
              </div>

              {/* Location Input Group connected by Route Line */}
              <form onSubmit={handleCalculateFare} className="space-y-4">
                <div className="relative rounded-2xl border-2 border-charcoal-200/80 bg-charcoal-50/50 p-4 space-y-3 shadow-inner">
                  {/* Vertical Route Indicator */}
                  <div className="absolute left-[26px] top-[34px] bottom-[34px] w-0.5 bg-charcoal-300 pointer-events-none" />

                  {/* 1. PICKUP FIELD WITH AUTOCOMPLETE DROPDOWN */}
                  <div ref={pickupContainerRef} className="relative flex items-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-brand-500 ring-4 ring-brand-100 flex-shrink-0 z-10" />
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      value={pickupInput}
                      onChange={(e) => {
                        setPickupInput(e.target.value);
                        setBookingError(null);
                      }}
                      onFocus={() => {
                        if (pickupSuggestions.length > 0) setShowPickupDropdown(true);
                      }}
                      className="w-full text-xs font-semibold pl-4 pr-16 py-2.5 bg-white rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-charcoal-900 ml-3"
                    />

                    <div className="absolute right-2 flex items-center gap-1">
                      {isSearchingPickup && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-charcoal-400 mr-1" />
                      )}

                      {pickupInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setPickupInput('');
                            setPickup(null);
                            setPickupSuggestions([]);
                            setShowPickupDropdown(false);
                          }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-md"
                          title="Clear pickup"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        title="Use current GPS location"
                        className="p-1.5 text-charcoal-400 hover:text-brand-600 rounded-lg hover:bg-charcoal-100"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Suggestions Dropdown for Pickup */}
                    {showPickupDropdown && pickupSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-charcoal-200 py-1 z-50 max-h-60 overflow-y-auto divide-y divide-charcoal-100">
                        {pickupSuggestions.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPickup(place)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/60 transition-colors flex items-start gap-2.5 group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-charcoal-100 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                              <MapPin className="w-3.5 h-3.5 text-charcoal-600 group-hover:text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-charcoal-900 truncate">
                                {place.name}
                              </div>
                              <div className="text-[11px] text-charcoal-500 truncate">
                                {place.subtitle || place.address}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. DROPOFF FIELD WITH AUTOCOMPLETE DROPDOWN */}
                  <div ref={dropoffContainerRef} className="relative flex items-center">
                    <div className="w-3.5 h-3.5 rounded-sm bg-charcoal-900 ring-4 ring-charcoal-100 flex-shrink-0 z-10" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      value={dropoffInput}
                      onChange={(e) => {
                        setDropoffInput(e.target.value);
                        setBookingError(null);
                      }}
                      onFocus={() => {
                        if (dropoffSuggestions.length > 0) setShowDropoffDropdown(true);
                      }}
                      className="w-full text-xs font-semibold pl-4 pr-10 py-2.5 bg-white rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-charcoal-900 ml-3"
                    />

                    <div className="absolute right-2 flex items-center gap-1">
                      {isSearchingDropoff && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-charcoal-400 mr-1" />
                      )}

                      {dropoffInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setDropoffInput('');
                            setDropoff(null);
                            setDropoffSuggestions([]);
                            setShowDropoffDropdown(false);
                          }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-md"
                          title="Clear destination"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Suggestions Dropdown for Dropoff */}
                    {showDropoffDropdown && dropoffSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-charcoal-200 py-1 z-50 max-h-60 overflow-y-auto divide-y divide-charcoal-100">
                        {dropoffSuggestions.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectDropoff(place)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/60 transition-colors flex items-start gap-2.5 group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-charcoal-100 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                              <MapPin className="w-3.5 h-3.5 text-charcoal-600 group-hover:text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-charcoal-900 truncate">
                                {place.name}
                              </div>
                              <div className="text-[11px] text-charcoal-500 truncate">
                                {place.subtitle || place.address}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {locPermissionError && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{locPermissionError}</span>
                  </div>
                )}

                {/* Saved Places Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-charcoal-600">
                  <span className="text-[11px] uppercase font-bold text-charcoal-400">Quick:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPlace('home')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-charcoal-200 bg-white hover:bg-charcoal-50 transition-colors"
                  >
                    <Home className="w-3 h-3 text-emerald-600" />
                    <span>Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlace('work')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-charcoal-200 bg-white hover:bg-charcoal-50 transition-colors"
                  >
                    <Briefcase className="w-3 h-3 text-indigo-600" />
                    <span>Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlace('airport')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-charcoal-200 bg-white hover:bg-charcoal-50 transition-colors"
                  >
                    <Plane className="w-3 h-3 text-blue-600" />
                    <span>Airport</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlace('station')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-charcoal-200 bg-white hover:bg-charcoal-50 transition-colors"
                  >
                    <Train className="w-3 h-3 text-amber-600" />
                    <span>Station</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. RIDEFLOW5)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isEstimating}
                    className="px-4 py-2.5 text-xs font-bold bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    {isEstimating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Get Fare</span>
                  </button>
                </div>
              </form>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {bookingError}
                </div>
              )}

              {/* Vehicle Options List */}
              {vehicleOptions.length > 0 && (
                <div className="space-y-4 pt-2">
                  {/* Route Summary Stats */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-50 border border-charcoal-100 text-xs text-charcoal-600">
                    <span className="font-semibold text-charcoal-900">Calculated Route</span>
                    <div className="flex items-center gap-3">
                      <span>{formatDistance(distanceKm)}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-700">
                        {formatDuration(durationMinutes)} trip
                      </span>
                    </div>
                  </div>

                  <VehicleSelector
                    options={vehicleOptions}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                  />

                  {/* Payment Method Selector */}
                  <div className="p-3.5 rounded-2xl border border-charcoal-200/80 bg-charcoal-50/50 space-y-2">
                    <div className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">
                      Payment Method
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                          paymentMethod === 'cash'
                            ? 'border-brand-500 bg-emerald-50 text-emerald-900'
                            : 'border-charcoal-200 bg-white text-charcoal-700 hover:bg-charcoal-50'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Cash to Driver</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card_sandbox')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                          paymentMethod === 'card_sandbox'
                            ? 'border-brand-500 bg-emerald-50 text-emerald-900'
                            : 'border-charcoal-200 bg-white text-charcoal-700 hover:bg-charcoal-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span>Card Sandbox</span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Booking CTA */}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    className="w-full py-4 px-6 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] transition-transform"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Matching nearest driver...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm {selectedCategory.toUpperCase()} Ride</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT / MAIN INTERACTIVE MAP AREA */}
      <div className="flex-1 min-h-[500px] h-[550px] lg:h-full relative">
        <InteractiveMap
          interactive={!activeRide && !isBooking}
          onLocationSelect={(type, loc) => {
            if (activeRide) return;
            if (type === 'pickup') {
              setPickup(loc);
              setPickupInput(loc.address);
              setShowPickupDropdown(false);
            } else {
              setDropoff(loc);
              setDropoffInput(loc.address);
              setShowDropoffDropdown(false);
            }
          }}
        />
      </div>
    </div>
  );
}
