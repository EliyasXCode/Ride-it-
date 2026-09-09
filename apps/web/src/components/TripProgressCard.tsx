'use client';

import React, { useState } from 'react';
import { Ride } from '@rideflow/shared';
import { formatCurrency } from '../lib/formatters';
import { Shield, Share2, Phone, MessageSquare, AlertTriangle, Star, CheckCircle, Navigation, X } from 'lucide-react';
import { fetchApi } from '../lib/api';

interface TripProgressCardProps {
  ride: Ride;
  onCancelled: () => void;
  onRated: () => void;
}

export const TripProgressCard: React.FC<TripProgressCardProps> = ({ ride, onCancelled, onRated }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed plans');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    const rideId = ride.id || (ride as any)._id;
    try {
      await fetchApi(`/rides/${rideId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ rideId, reason: cancelReason }),
      });
      setShowCancelModal(false);
      onCancelled();
    } catch (e: any) {
      setCancelError(e.message || 'Failed to cancel ride');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShare = () => {
    if (!ride.shareToken) return;
    const shareUrl = `${window.location.origin}/share/${ride.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  const handleRate = async () => {
    setIsSubmittingRating(true);
    const rideId = ride.id || (ride as any)._id;
    try {
      await fetchApi(`/rides/${rideId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rideId, score: ratingScore, feedback: ratingFeedback }),
      });
      setHasRated(true);
      onRated();
    } catch (e: any) {
      alert(e.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-charcoal-200/80 shadow-xl overflow-hidden">
      {/* Header Banner according to Ride Status */}
      <div className="p-5 bg-charcoal-900 text-white flex items-center justify-between">
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-emerald-400">Trip Status</div>
          <div className="text-lg font-extrabold capitalize mt-0.5">
            {ride.status === 'searching' && 'Finding your driver...'}
            {ride.status === 'assigned' && 'Driver matched & heading to you'}
            {ride.status === 'arriving' && 'Driver is arriving now'}
            {ride.status === 'arrived' && 'Driver has arrived at pickup'}
            {ride.status === 'in_progress' && 'Trip in progress to destination'}
            {ride.status === 'completed' && 'Trip Completed'}
            {ride.status === 'cancelled' && 'Trip Cancelled'}
            {ride.status === 'no_drivers' && 'No Drivers Available Nearby'}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-charcoal-400">Total Fare</div>
          <div className="text-lg font-bold text-emerald-400">{formatCurrency(ride.fareMinor, ride.currency)}</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* RIDE-START PIN BADGE (Essential requirement for Rider) */}
        {['assigned', 'arriving', 'arrived'].includes(ride.status) && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Ride-Start PIN</div>
                <div className="text-xs text-emerald-700">Give this 4-digit code to your driver</div>
              </div>
            </div>
            <div className="text-2xl font-mono font-black tracking-widest text-emerald-950 bg-white px-4 py-1.5 rounded-xl border border-emerald-300 shadow-sm">
              {ride.startPin}
            </div>
          </div>
        )}

        {/* Searching Radar State */}
        {ride.status === 'searching' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
              <div className="relative w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg">
                <Navigation className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-charcoal-900 text-base">Contacting nearby drivers...</h4>
              <p className="text-xs text-charcoal-500 max-w-xs mt-1">
                We're dispatching your ride request to the highest rated available drivers in your area.
              </p>
            </div>
          </div>
        )}

        {/* Driver Card Info */}
        {['assigned', 'arriving', 'arrived', 'in_progress', 'completed'].includes(ride.status) && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-charcoal-50 border border-charcoal-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-charcoal-900 text-white flex items-center justify-center font-bold text-lg">
                {ride.driverName ? ride.driverName.charAt(0) : 'D'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-charcoal-900">{ride.driverName || 'Elena Rostova'}</h4>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {ride.driverRating || '4.98'}
                  </span>
                </div>
                <div className="text-xs text-charcoal-500 mt-0.5">
                  {ride.driverVehicle
                    ? `${ride.driverVehicle.color} ${ride.driverVehicle.make} ${ride.driverVehicle.model}`
                    : 'Pearl White Tesla Model Y'}
                </div>
                <div className="inline-block mt-1 font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-charcoal-200 text-charcoal-800">
                  {ride.driverVehicle ? ride.driverVehicle.licensePlate : '9ELN441'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-charcoal-200 bg-white text-charcoal-700 hover:bg-charcoal-100 shadow-sm"
                title="Share trip tracking link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Exact Route Distance & Map Coordinates Breakdown */}
        <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Exact Route Metric</span>
            <div className="flex items-center gap-2 text-xs font-extrabold text-charcoal-900">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {ride.distanceKm} km ({(ride.distanceKm * 0.621371).toFixed(1)} mi)
              </span>
              <span>•</span>
              <span className="text-charcoal-700 bg-white px-2 py-0.5 rounded border border-charcoal-200">
                ~{ride.durationMinutes} min drive
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-charcoal-200/60 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-3 h-3 rounded-full bg-brand-500 ring-2 ring-brand-200 mt-1 flex-shrink-0" />
              <div>
                <div className="font-bold text-charcoal-800">{ride.pickup.address}</div>
                <div className="text-[10px] font-mono text-charcoal-400">
                  Lat: {ride.pickup.lat.toFixed(5)}, Lng: {ride.pickup.lng.toFixed(5)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-3 h-3 rounded-sm bg-charcoal-900 ring-2 ring-charcoal-200 mt-1 flex-shrink-0" />
              <div>
                <div className="font-bold text-charcoal-800">{ride.dropoff.address}</div>
                <div className="text-[10px] font-mono text-charcoal-400">
                  Lat: {ride.dropoff.lat.toFixed(5)}, Lng: {ride.dropoff.lng.toFixed(5)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${ride.pickup.lat},${ride.pickup.lng}&destination=${ride.dropoff.lat},${ride.dropoff.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-charcoal-200 hover:bg-charcoal-100 text-charcoal-700 text-center text-[11px] font-bold shadow-xs"
            >
              Open Route in Google Maps ↗
            </a>
            <a
              href={`https://www.openstreetmap.org/directions?from=${ride.pickup.lat}%2C${ride.pickup.lng}&to=${ride.dropoff.lat}%2C${ride.dropoff.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-charcoal-200 hover:bg-charcoal-100 text-charcoal-700 text-center text-[11px] font-bold shadow-xs"
            >
              Open in OpenStreetMap ↗
            </a>
          </div>
        </div>

        {shareCopied && (
          <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
            ✓ Public trip tracking link copied to clipboard!
          </div>
        )}

        {/* Completed Ride Rating Modal */}
        {ride.status === 'completed' && !hasRated && (
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <h4 className="font-bold text-charcoal-900 text-base">How was your trip?</h4>
              <p className="text-xs text-charcoal-500">Rate your driver to help keep RideFlow safe and reliable.</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingScore(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-charcoal-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Leave compliments or feedback (optional)..."
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={handleRate}
              disabled={isSubmittingRating}
              className="w-full py-2.5 text-xs font-bold text-white bg-charcoal-900 hover:bg-charcoal-800 rounded-xl"
            >
              {isSubmittingRating ? 'Submitting...' : 'Submit Rating & View Receipt'}
            </button>
          </div>
        )}

        {hasRated && (
          <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold">
            ✓ Thank you! Your rating has been recorded.
          </div>
        )}

        {/* Cancellation or Reset Action */}
        {!['completed', 'cancelled', 'no_drivers'].includes(ride.status) ? (
          <div className="pt-2">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Cancel Ride
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={onCancelled}
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-charcoal-900 hover:bg-charcoal-800 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Book a New Ride</span>
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Cancel Ride</span>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-charcoal-400 hover:text-charcoal-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600">
              Are you sure you want to cancel? If cancelled after 2 minutes of driver assignment, a small driver compensation fee
              of ₹50 applies.
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-charcoal-200 bg-charcoal-50"
            >
              <option value="Changed plans">Changed plans</option>
              <option value="Driver took too long">Driver took too long</option>
              <option value="Pickup location incorrect">Pickup location incorrect</option>
              <option value="Booked by mistake">Booked by mistake</option>
            </select>

            {cancelError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {cancelError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700"
              >
                Keep Ride
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
