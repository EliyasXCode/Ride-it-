import React from 'react';
import Link from 'next/link';
import { Users, Briefcase, Zap, Shield, ArrowRight } from 'lucide-react';

export default function VehiclesPage() {
  const categories = [
    {
      category: 'RideFlow Economy',
      emoji: '🚗',
      tag: 'Most Popular',
      capacity: 'Up to 4 riders',
      luggage: '2 large bags',
      description: 'Affordable, compact sedans and hatchbacks for everyday urban commuting.',
      examples: 'Toyota Camry, Honda Civic, Hyundai Elantra',
      base: '$2.50 base • $1.20/km • $0.25/min',
    },
    {
      category: 'RideFlow Comfort',
      emoji: '✨',
      tag: 'Extra Legroom',
      capacity: 'Up to 4 riders',
      luggage: '3 large bags',
      description: 'Newer vehicles with spacious seating and top-rated drivers for an elevated ride.',
      examples: 'Tesla Model Y, Toyota Highlander, Lexus ES',
      base: '$3.50 base • $1.60/km • $0.35/min',
    },
    {
      category: 'RideFlow XL',
      emoji: '🚐',
      tag: 'Groups & Luggage',
      capacity: 'Up to 6 riders',
      luggage: '5 large bags',
      description: 'Spacious SUVs and minivans for large families, group travel, and airport trips.',
      examples: 'Chevrolet Suburban, Ford Expedition, Honda Odyssey',
      base: '$5.00 base • $2.20/km • $0.50/min',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Service Classes</span>
        <h1 className="text-4xl font-black text-charcoal-900 tracking-tight">Our Vehicle Fleet</h1>
        <p className="text-xs text-charcoal-500">
          Find the right option for your budget, group size, and travel comfort.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.category}
            className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {c.tag}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-charcoal-900 text-lg">{c.category}</h3>
                <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">{c.description}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-charcoal-100 text-xs text-charcoal-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-charcoal-400" />
                  <span>{c.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-charcoal-400" />
                  <span>{c.luggage}</span>
                </div>
              </div>

              <div className="p-3 bg-charcoal-50 rounded-2xl text-[11px] text-charcoal-600 space-y-1">
                <div className="font-semibold text-charcoal-800">Sample Vehicles:</div>
                <div className="italic">{c.examples}</div>
                <div className="pt-1 text-emerald-700 font-bold">{c.base}</div>
              </div>
            </div>

            <Link
              href="/booking"
              className="w-full py-3 text-center bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Book {c.category}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
