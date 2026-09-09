import React from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">The Rider Journey</span>
        <h1 className="text-4xl font-black text-charcoal-900 tracking-tight">How RideFlow Works</h1>
        <p className="text-xs text-charcoal-500">
          From tapping your pickup spot to stepping out at your destination, here is how RideFlow ensures a seamless
          journey.
        </p>
      </div>

      <div className="space-y-6">
        {[
          {
            step: '1. Upfront Guaranteed Fare Quotes',
            desc: 'Enter your pickup and destination to lock in an accurate fare quote based on authoritative Routes API distance and time calculations. Fares are locked for 10 minutes so you never face surprise rate hikes during checkout.',
            icon: DollarSign,
          },
          {
            step: '2. Precision Geospatial Driver Matching',
            desc: 'Our backend uses high-speed MongoDB 2dsphere geospatial search to identify the closest approved and available drivers. Drivers receive a 15-second exclusive offer window.',
            icon: MapPin,
          },
          {
            step: '3. Mandatory 4-Digit Ride-Start PIN',
            desc: 'Before any vehicle moves, your driver must enter your unique 4-digit PIN on their phone. This server-verified step ensures complete peace of mind.',
            icon: KeyRound,
          },
          {
            step: '4. Live Tracking & Seamless Payment',
            desc: 'Follow your driver’s arrival on our interactive map. At the end of the trip, pay cash or use our card sandbox, and download your itemized receipt.',
            icon: ShieldCheck,
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-base">{item.step}</h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-sm rounded-2xl shadow-xl transition-all hover:scale-105"
        >
          <span>Ready? Book a Ride Now</span>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </Link>
      </div>
    </div>
  );
}
