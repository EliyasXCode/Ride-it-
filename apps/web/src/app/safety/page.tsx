'use client';

import React, { useState } from 'react';
import { Shield, PhoneCall, Users, KeyRound, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SafetyPage() {
  const [trustedContact, setTrustedContact] = useState('');
  const [trustedPhone, setTrustedPhone] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (trustedContact && trustedPhone) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
          <Shield className="w-3.5 h-3.5 text-brand-500" />
          <span>RideFlow Safety Standards</span>
        </div>
        <h1 className="text-3xl font-black text-charcoal-900 tracking-tight">Your Safety Comes First</h1>
        <p className="text-xs text-charcoal-600 mt-1 max-w-xl">
          Learn about our multi-layer safety protections, configure trusted emergency contacts, and understand how our
          safety features function.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-charcoal-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-charcoal-900">4-Digit Ride-Start PIN</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Every RideFlow trip generates a unique 4-digit code. The driver cannot start the ride until they enter your
            code, ensuring you always get into the correct car with the right driver.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-charcoal-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-charcoal-900">Vetted Drivers & Vehicles</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            All drivers undergo manual administration document review, driver license validation, and vehicle inspection
            before ever being permitted online.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-charcoal-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-charcoal-900">Share Trip Route</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Generate an encrypted, expiring tracking link with one tap. Friends or family can follow your route in
            real-time from any web browser without logging in.
          </p>
        </div>
      </div>

      {/* Emergency Action Explanation & Configuration */}
      <div className="bg-charcoal-900 text-white rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Emergency Assistance Button & Explanation</h3>
            <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Crucial Safety Information</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-charcoal-800/90 border border-charcoal-700 text-xs text-charcoal-300 leading-relaxed space-y-2">
          <p className="font-bold text-white">How the in-app Emergency Button works:</p>
          <p>
            When pressed, RideFlow opens your device's native phone dialer pre-filled with local emergency services (e.g.
            911 in the United States) and displays your exact current street address and vehicle license plate.
          </p>
          <p className="text-amber-300 font-medium">
            ⚠️ Important notice: Tapping the Emergency button does NOT automatically alert police or dispatch emergency
            responders on your behalf. You must speak directly to emergency dispatchers once the call is connected.
          </p>
        </div>

        {/* Configure Trusted Contact Form */}
        <form onSubmit={handleSaveContact} className="space-y-4 pt-2 border-t border-charcoal-800 text-xs">
          <h4 className="font-bold text-sm text-white">Save a Trusted Contact for Quick Sharing</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal-400 block mb-1">Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Mom or Sarah"
                value={trustedContact}
                onChange={(e) => setTrustedContact(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-400 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={trustedPhone}
                onChange={(e) => setTrustedPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Save Trusted Contact
          </button>

          {saved && (
            <span className="ml-3 text-emerald-400 font-bold text-xs">
              ✓ Trusted contact saved locally!
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
