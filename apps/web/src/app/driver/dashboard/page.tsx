'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { fetchApi } from '../../../lib/api';
import { getSocket } from '../../../lib/socket';
import { SOCKET_EVENTS, Ride, DriverProfile } from '@rideflow/shared';
import { formatCurrency, formatDistance, formatDuration } from '../../../lib/formatters';
import {
  Car,
  Power,
  Navigation,
  Shield,
  Star,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  KeyRound,
  FileCheck,
} from 'lucide-react';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, driverProfile, fetchUser } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<any | null>(null);
  const [offerCountdown, setOfferCountdown] = useState<number>(15);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState({ totalEarningsMinor: 0, completedRidesCount: 0 });
  const [trackingWarning, setTrackingWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Fetch driver active ride and earnings
  useEffect(() => {
    if (user?.role !== 'driver') return;

    fetchApi<{ activeRide: Ride | null }>('/rides/active')
      .then((data) => {
        if (data.activeRide) setActiveRide(data.activeRide);
      })
      .catch(() => {});

    fetchApi<{ totalEarningsMinor: number; completedRidesCount: number }>('/drivers/earnings')
      .then((data) => setEarnings(data))
      .catch(() => {});
  }, [user]);

  // Setup Socket listeners for driver room
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    socket.emit(SOCKET_EVENTS.JOIN_USER_ROOM, { userId: user.id });

    if (activeRide) {
      socket.emit(SOCKET_EVENTS.JOIN_RIDE_ROOM, { rideId: activeRide.id });
    }

    // Incoming offer event
    socket.on(SOCKET_EVENTS.RIDE_OFFER_DISPATCHED, (data: any) => {
      setIncomingOffer(data);
      setOfferCountdown(15);
    });

    socket.on(SOCKET_EVENTS.RIDE_STATUS_UPDATED, (data: { rideId: string; ride: Ride }) => {
      setActiveRide(data.ride);
    });

    return () => {
      socket.off(SOCKET_EVENTS.RIDE_OFFER_DISPATCHED);
      socket.off(SOCKET_EVENTS.RIDE_STATUS_UPDATED);
    };
  }, [user, activeRide]);

  // Offer countdown timer
  useEffect(() => {
    if (!incomingOffer) return;
    const timer = setInterval(() => {
      setOfferCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIncomingOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOffer]);

  // Driver GPS streaming with consent and stale tracking notice
  useEffect(() => {
    if (!isOnline || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setTrackingWarning(null);
        const socket = getSocket();
        socket.emit(SOCKET_EVENTS.DRIVER_UPDATE_LOCATION, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading || 0,
          rideId: activeRide?.id,
        });
      },
      (err) => {
        setTrackingWarning('Location tracking paused: Browser backgrounded or permission denied.');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, activeRide]);

  // Toggle online status
  const handleToggleOnline = async () => {
    try {
      const nextStatus = !isOnline ? 'online' : 'offline';
      await fetchApi('/drivers/status', {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus }),
      });
      setIsOnline(!isOnline);
    } catch (err: any) {
      alert(err.message || 'Could not change status');
    }
  };

  // Respond to incoming offer
  const handleRespondOffer = (accept: boolean) => {
    if (!incomingOffer) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.DRIVER_RESPOND_OFFER, {
      rideId: incomingOffer.rideId,
      accept,
    });
    setIncomingOffer(null);
  };

  // Mark arrived
  const handleMarkArrived = async () => {
    if (!activeRide) return;
    try {
      await fetchApi(`/drivers/rides/${activeRide.id}/arrived`, { method: 'POST' });
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // Verify PIN to start ride
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide || !pinInput) return;
    setPinError(null);

    try {
      await fetchApi(`/drivers/rides/${activeRide.id}/verify-pin`, {
        method: 'POST',
        body: JSON.stringify({ pin: pinInput }),
      });
      setPinInput('');
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN');
    }
  };

  // Complete ride
  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      await fetchApi(`/drivers/rides/${activeRide.id}/complete`, { method: 'POST' });
      // Refresh earnings
      const data = await fetchApi<{ totalEarningsMinor: number; completedRidesCount: number }>('/drivers/earnings');
      setEarnings(data);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-charcoal-900">{user?.name || 'Elena Rostova'}</h1>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {user?.rating || 4.98}
              </span>
            </div>
            <div className="text-xs text-charcoal-500 mt-1">
              Tesla Model Y • 9ELN441 • Comfort Category
            </div>
          </div>
        </div>

        {/* Online Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleOnline}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-charcoal-200 hover:bg-charcoal-300 text-charcoal-800'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Online (Accepting Rides)' : 'Offline'}</span>
          </button>
        </div>
      </div>

      {trackingWarning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{trackingWarning}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
          <div className="text-xs font-bold text-charcoal-400 uppercase">Calculated Earnings</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(earnings.totalEarningsMinor)}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1">80% driver revenue split</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
          <div className="text-xs font-bold text-charcoal-400 uppercase">Completed Rides</div>
          <div className="text-2xl font-black text-charcoal-900 mt-1">{earnings.completedRidesCount}</div>
          <div className="text-[11px] text-charcoal-500 mt-1">100% acceptance record</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
          <div className="text-xs font-bold text-charcoal-400 uppercase">Account Status</div>
          <div className="flex items-center gap-1.5 text-base font-bold text-emerald-700 mt-1">
            <FileCheck className="w-4 h-4" />
            <span>Approved & Active</span>
          </div>
          <div className="text-[11px] text-charcoal-500 mt-1">Verified vehicle & license</div>
        </div>
      </div>

      {/* INCOMING RIDE OFFER MODAL */}
      {incomingOffer && (
        <div className="bg-charcoal-950 text-white rounded-3xl p-6 border-2 border-brand-500 shadow-2xl space-y-5 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              ⚡ New Ride Offer Incoming
            </span>
            <span className="flex items-center gap-1 text-sm font-mono font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
              <Clock className="w-3.5 h-3.5" />
              {offerCountdown}s left
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-charcoal-400">Pickup Location</div>
              <div className="text-sm font-bold">{incomingOffer.pickup.address}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-charcoal-400">Dropoff Location</div>
              <div className="text-sm font-bold">{incomingOffer.dropoff.address}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-charcoal-800">
            <div>
              <div className="text-xs text-charcoal-400">Your Share (80%)</div>
              <div className="text-2xl font-black text-emerald-400">
                {formatCurrency(Math.round(incomingOffer.fareMinor * 0.8))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRespondOffer(false)}
                className="px-5 py-2.5 rounded-xl border border-charcoal-700 hover:bg-charcoal-800 text-xs font-bold"
              >
                Decline
              </button>
              <button
                onClick={() => handleRespondOffer(true)}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg"
              >
                Accept Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE TRIP MANAGEMENT CARD */}
      {activeRide && (
        <div className="bg-white rounded-3xl p-6 border-2 border-charcoal-200/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
            <div>
              <div className="text-xs uppercase font-bold text-emerald-700">Active Ride #{activeRide.id.slice(-6)}</div>
              <div className="text-xl font-black capitalize text-charcoal-900 mt-0.5">
                Current Status: {activeRide.status.replace('_', ' ')}
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                activeRide.status === 'assigned' ? activeRide.pickup.address : activeRide.dropoff.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-100 text-charcoal-800 text-xs font-bold hover:bg-charcoal-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps Navigation</span>
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-100">
              <div className="text-charcoal-400 font-medium">PICKUP</div>
              <div className="text-sm font-bold text-charcoal-900 mt-1">{activeRide.pickup.address}</div>
            </div>
            <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-100">
              <div className="text-charcoal-400 font-medium">DESTINATION</div>
              <div className="text-sm font-bold text-charcoal-900 mt-1">{activeRide.dropoff.address}</div>
            </div>
          </div>

          {/* Action Step 1: Arrived at Pickup */}
          {activeRide.status === 'assigned' && (
            <button
              onClick={handleMarkArrived}
              className="w-full py-4 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-sm shadow-md"
            >
              Confirm Arrived at Pickup
            </button>
          )}

          {/* Action Step 2: Verify 4-digit PIN to Start Trip */}
          {activeRide.status === 'arrived' && (
            <form onSubmit={handleVerifyPin} className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <span>Enter Rider's 4-Digit PIN to Start Trip</span>
              </div>
              <p className="text-xs text-emerald-800">
                Ask the rider for their 4-digit verification PIN displayed on their screen.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4821"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-36 text-center text-xl font-mono font-bold tracking-widest px-3 py-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Verify PIN & Start Trip
                </button>
              </div>

              {pinError && <div className="text-xs font-semibold text-rose-600">{pinError}</div>}
            </form>
          )}

          {/* Action Step 3: Complete Trip */}
          {activeRide.status === 'in_progress' && (
            <button
              onClick={handleCompleteRide}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
            >
              Complete Trip & Collect Fare ({formatCurrency(activeRide.fareMinor, activeRide.currency)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
