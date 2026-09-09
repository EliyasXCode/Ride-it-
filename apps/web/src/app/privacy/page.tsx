import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold">
        ⚠️ TEMPLATE NOTICE: This privacy document is a customization template provided for demonstration purposes.
        Before launching in production, replace with your legal counsel's approved privacy disclosures.
      </div>

      <h1 className="text-3xl font-black text-charcoal-900">Privacy Policy (Template)</h1>
      <p className="text-xs text-charcoal-500">Effective Date: January 1, 2026</p>

      <div className="prose prose-sm text-charcoal-600 text-xs leading-relaxed space-y-4">
        <h3 className="font-bold text-charcoal-900 text-sm">1. Information We Collect</h3>
        <p>
          RideFlow collects account credentials, phone numbers, pickup and destination addresses, and telemetry
          necessary to coordinate dispatch between riders and drivers. Continuous geolocation data is collected only while
          the driver is toggled online and during active trips.
        </p>

        <h3 className="font-bold text-charcoal-900 text-sm">2. Use of Information</h3>
        <p>
          Collected data is used strictly to match riders with drivers, calculate accurate fares, prevent fraudulent
          bookings, verify driver identities, and ensure safety via the 4-digit ride verification PIN.
        </p>

        <h3 className="font-bold text-charcoal-900 text-sm">3. Data Retention and Safety</h3>
        <p>
          Trip routes and financial ledger entries are retained in accordance with statutory accounting requirements.
          Live GPS updates are pruned on a rolling schedule.
        </p>
      </div>
    </div>
  );
}
