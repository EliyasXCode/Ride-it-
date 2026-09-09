'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { fetchApi } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { User, Clock, Star, MapPin, Receipt, Shield, LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user, logout, fetchUser } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);

  useEffect(() => {
    fetchUser();
    fetchApi<{ rides: any[] }>('/rides/history/all')
      .then((data) => setHistory(data.rides || []))
      .catch(() => {});

    fetchApi<{ places: any[] }>('/places/saved')
      .then((data) => setSavedPlaces(data.places || []))
      .catch(() => {});
  }, [fetchUser]);

  const handleDownloadReceipt = (ride: any) => {
    const content = `
========================================
           RIDEFLOW RECEIPT
========================================
Receipt ID:  RCP-${ride._id?.slice(-8) || '000000'}
Date:        ${new Date(ride.createdAt).toLocaleString()}
Rider:       ${user?.name || 'Valued Rider'}
----------------------------------------
Pickup:      ${ride.pickup.address}
Dropoff:     ${ride.dropoff.address}
Distance:    ${ride.distanceKm} km
Duration:    ${ride.durationMinutes} min
Category:    ${ride.vehicleCategory.toUpperCase()}
Payment:     ${ride.paymentMethod.toUpperCase()} (${ride.paymentStatus.toUpperCase()})
----------------------------------------
TOTAL FARE:  ₹${Math.round(ride.fareMinor / 100).toLocaleString('en-IN')} (INR)
========================================
Thank you for riding with RideFlow!
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rideflow-receipt-${ride._id?.slice(-6) || 'receipt'}.txt`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-charcoal-900">{user?.name || 'Alex Rider'}</h1>
              <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {user?.role || 'rider'}
              </span>
            </div>
            <div className="text-xs text-charcoal-500 mt-1">{user?.email}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user?.rating || 4.96} rating</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Trip History */}
      <div className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm space-y-4">
        <h3 className="font-black text-charcoal-900 text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" />
          <span>Recent Trips</span>
        </h3>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400">
            No past trips recorded yet. Book your first ride on the booking screen!
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100 text-xs">
            {history.map((ride) => (
              <div key={ride._id || ride.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">{formatDate(ride.createdAt)}</span>
                    <span className="capitalize text-[10px] px-2 py-0.5 rounded font-semibold bg-charcoal-100 text-charcoal-700">
                      {ride.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-charcoal-600">
                    <span className="font-semibold">From:</span> {ride.pickup.address}
                  </div>
                  <div className="text-charcoal-600">
                    <span className="font-semibold">To:</span> {ride.dropoff.address}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-charcoal-900 text-sm">
                      {formatCurrency(ride.fareMinor, ride.currency)}
                    </div>
                    <div className="text-[10px] text-charcoal-400 uppercase font-semibold">
                      {ride.vehicleCategory}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadReceipt(ride)}
                    className="p-2 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700 flex items-center gap-1 text-[11px] font-semibold"
                    title="Download Receipt"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
