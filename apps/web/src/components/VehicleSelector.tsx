'use client';

import React from 'react';
import { VehicleOption, VehicleCategory } from '@rideflow/shared';
import { formatCurrency, formatDuration } from '../lib/formatters';
import { Users, Clock, Info, ShieldCheck, Zap } from 'lucide-react';

interface VehicleSelectorProps {
  options: VehicleOption[];
  selectedCategory: VehicleCategory;
  onSelect: (category: VehicleCategory) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ options, selectedCategory, onSelect }) => {
  const [expandedInfo, setExpandedInfo] = React.useState<VehicleCategory | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
        <span>Available Options</span>
        <span>Guaranteed Price</span>
      </div>

      <div className="grid gap-2.5">
        {options.map((option) => {
          const isSelected = selectedCategory === option.category;

          return (
            <div
              key={option.category}
              onClick={() => onSelect(option.category)}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/40 shadow-md shadow-brand-500/10'
                  : 'border-charcoal-200/80 bg-white hover:border-charcoal-300 hover:bg-charcoal-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      option.category === 'economy'
                        ? 'bg-slate-100 text-slate-700'
                        : option.category === 'comfort'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {option.category === 'economy' && '🚗'}
                    {option.category === 'comfort' && '✨'}
                    {option.category === 'xl' && '🚐'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-900 text-base">{option.displayName}</h4>
                      <span className="flex items-center gap-0.5 text-xs text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        {option.capacity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-emerald-700">
                        <Clock className="w-3 h-3" />
                        {option.etaMinutes} min away
                      </span>
                      <span>•</span>
                      <span>{option.description}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-charcoal-900">
                    {formatCurrency(option.fare.totalMinor, option.fare.currency)}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedInfo(expandedInfo === option.category ? null : option.category);
                    }}
                    className="text-xs text-charcoal-400 hover:text-charcoal-700 flex items-center gap-1 justify-end mt-0.5"
                  >
                    <Info className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Fare Breakdown */}
              {expandedInfo === option.category && (
                <div className="mt-3 pt-3 border-t border-charcoal-100 text-xs text-charcoal-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span>{formatCurrency(option.fare.baseFareMinor, option.fare.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Fare ({option.fare.distanceKm} km)</span>
                    <span>{formatCurrency(option.fare.distanceFareMinor, option.fare.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Fare ({option.fare.durationMinutes} min)</span>
                    <span>{formatCurrency(option.fare.timeFareMinor, option.fare.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Booking Fee & Taxes</span>
                    <span>{formatCurrency(option.fare.bookingFeeMinor + option.fare.taxMinor, option.fare.currency)}</span>
                  </div>
                  {option.fare.discountMinor > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotion Discount</span>
                      <span>-{formatCurrency(option.fare.discountMinor, option.fare.currency)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
