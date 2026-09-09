'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { fetchApi } from '../../../lib/api';
import { Car, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DriverApplyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Camry');
  const [vehicleYear, setVehicleYear] = useState(2022);
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('Silver');
  const [vehicleCategory, setVehicleCategory] = useState<'economy' | 'comfort' | 'xl'>('economy');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/driver/apply');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await fetchApi('/drivers/register', {
        method: 'POST',
        body: JSON.stringify({
          vehicleMake,
          vehicleModel,
          vehicleYear: Number(vehicleYear),
          licensePlate,
          vehicleColor,
          vehicleCategory,
          driverLicenseNumber,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Driver Onboarding & Verification</span>
          </div>
          <h1 className="text-2xl font-black text-charcoal-900">Become a RideFlow Driver</h1>
          <p className="text-xs text-charcoal-600 mt-1">
            Submit your vehicle information and driver details for administrative approval.
          </p>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-950 text-base">Application Submitted for Review</h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Our safety administration team typically verifies driver documents within 24 hours. Once approved, you
              will be able to go online and accept ride offers.
            </p>
            <button
              onClick={() => router.push('/driver/dashboard')}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              View Driver Dashboard Status
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Vehicle Make</label>
                <input
                  type="text"
                  required
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Vehicle Model</label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Year</label>
                <input
                  type="number"
                  min={2000}
                  max={2030}
                  required
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">License Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7XYZ892"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Color</label>
                <input
                  type="text"
                  required
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Category</label>
                <select
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                >
                  <option value="economy">Economy (Sedan / Hatchback)</option>
                  <option value="comfort">Comfort (Premium Extra Legroom)</option>
                  <option value="xl">XL (SUV / Minivan 6+)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Driver License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-1234567-X"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-sm rounded-2xl shadow-md transition-colors"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Driver Profile for Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
