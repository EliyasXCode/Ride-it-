'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { Car, Shield, Navigation, Clock } from 'lucide-react';

export default function SharedTripPage() {
  const params = useParams();
  const token = params.token as string;
  const [trip, setTrip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchApi(`/rides/shared/${token}`)
      .then((data) => setTrip(data))
      .catch((err) => setError(err.message || 'Shared trip link not found or expired.'));
  }, [token]);

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-3xl border border-charcoal-200 shadow-xl text-center space-y-3">
        <Shield className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-bold text-charcoal-900">Trip Link Unavailable</h2>
        <p className="text-xs text-charcoal-500">{error}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center text-xs text-charcoal-500">
        Loading live shared trip details...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-charcoal-200/80 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-charcoal-900">
          <Shield className="w-5 h-5 text-brand-500" />
          <span>RideFlow SafeShare</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
          Live Tracking
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <div className="text-charcoal-400 font-medium">Status</div>
          <div className="text-base font-black text-charcoal-900 capitalize mt-0.5">
            {trip.status.replace('_', ' ')}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-charcoal-50 space-y-2">
          <div>
            <span className="text-charcoal-400 font-medium">From: </span>
            <span className="font-bold text-charcoal-800">{trip.pickup}</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-medium">To: </span>
            <span className="font-bold text-charcoal-800">{trip.dropoff}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-700" />
            <span className="font-bold">{trip.driverName}</span>
          </div>
          <span className="font-semibold uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300">
            {trip.vehicleCategory}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-center text-charcoal-400">
        This link was shared privately by the rider for safety monitoring. It displays minimal personal information and
        automatically expires once the trip concludes.
      </p>
    </div>
  );
}
