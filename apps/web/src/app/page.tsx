'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRideStore } from '../stores/rideStore';
import { searchPlaces, PlaceSuggestion } from '../lib/places';
import { LocationAddress } from '@rideflow/shared';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  Car,
  CheckCircle,
  Users,
  Sparkles,
  Smartphone,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { setPickup, setDropoff } = useRideStore();
  
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  
  const [selectedPickup, setSelectedPickup] = useState<LocationAddress | null>(null);
  const [selectedDropoff, setSelectedDropoff] = useState<LocationAddress | null>(null);

  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<PlaceSuggestion[]>([]);
  
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickupContainerRef.current &&
        !pickupContainerRef.current.contains(event.target as Node)
      ) {
        setShowPickupDropdown(false);
      }
      if (
        dropoffContainerRef.current &&
        !dropoffContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropoffDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete for Pickup
  useEffect(() => {
    if (!pickupText.trim() || pickupText.length < 2 || pickupText === selectedPickup?.address) {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const results = await searchPlaces(pickupText);
        setPickupSuggestions(results);
        setShowPickupDropdown(results.length > 0);
      } catch {
        setPickupSuggestions([]);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pickupText, selectedPickup?.address]);

  // Autocomplete for Dropoff
  useEffect(() => {
    if (!dropoffText.trim() || dropoffText.length < 2 || dropoffText === selectedDropoff?.address) {
      setDropoffSuggestions([]);
      setShowDropoffDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDropoff(true);
      try {
        const results = await searchPlaces(
          dropoffText,
          selectedPickup ? { lat: selectedPickup.lat, lng: selectedPickup.lng } : undefined
        );
        setDropoffSuggestions(results);
        setShowDropoffDropdown(results.length > 0);
      } catch {
        setDropoffSuggestions([]);
      } finally {
        setIsSearchingDropoff(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [dropoffText, selectedDropoff?.address, selectedPickup]);

  const handleSelectPickup = (place: PlaceSuggestion) => {
    const loc = { address: place.address, lat: place.lat, lng: place.lng };
    setSelectedPickup(loc);
    setPickupText(place.name || place.address);
    setShowPickupDropdown(false);
  };

  const handleSelectDropoff = (place: PlaceSuggestion) => {
    const loc = { address: place.address, lat: place.lat, lng: place.lng };
    setSelectedDropoff(loc);
    setDropoffText(place.name || place.address);
    setShowDropoffDropdown(false);
  };

  const handleQuickBook = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalPickup = selectedPickup;
    if (!finalPickup && pickupText.trim()) {
      if (pickupSuggestions.length > 0) {
        finalPickup = {
          address: pickupSuggestions[0].address,
          lat: pickupSuggestions[0].lat,
          lng: pickupSuggestions[0].lng,
        };
      } else {
        const found = await searchPlaces(pickupText.trim());
        if (found.length > 0) {
          finalPickup = { address: found[0].address, lat: found[0].lat, lng: found[0].lng };
        } else {
          finalPickup = { address: pickupText.trim(), lat: 17.2995, lng: 74.3312 };
        }
      }
    }

    let finalDropoff = selectedDropoff;
    if (!finalDropoff && dropoffText.trim()) {
      if (dropoffSuggestions.length > 0) {
        finalDropoff = {
          address: dropoffSuggestions[0].address,
          lat: dropoffSuggestions[0].lat,
          lng: dropoffSuggestions[0].lng,
        };
      } else {
        const found = await searchPlaces(dropoffText.trim());
        if (found.length > 0) {
          finalDropoff = { address: found[0].address, lat: found[0].lat, lng: found[0].lng };
        } else {
          finalDropoff = { address: dropoffText.trim(), lat: 18.5204, lng: 73.8567 };
        }
      }
    }

    if (finalPickup) setPickup(finalPickup);
    if (finalDropoff) setDropoff(finalDropoff);
    router.push('/booking');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-20 border-b border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & Quick Booking Entry Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Next-Generation Ride Mobility</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.1]">
                Move effortlessly across your city with <span className="text-brand-500">RideFlow</span>.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 max-w-xl leading-relaxed">
                Reliable pickups in minutes, transparent upfront fares, and guaranteed safety with our unique 4-digit ride
                verification PIN.
              </p>

              {/* Functional Booking Entry Card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-charcoal-200/80 shadow-xl max-w-xl">
                <form onSubmit={handleQuickBook} className="space-y-4">
                  <div className="space-y-2.5">
                    {/* Pickup Field */}
                    <div ref={pickupContainerRef} className="relative flex items-center">
                      <div className="absolute left-3.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-100 z-10 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Enter pickup location (e.g. Kadegaon)"
                        value={pickupText}
                        onChange={(e) => {
                          setPickupText(e.target.value);
                          setSelectedPickup(null);
                        }}
                        onFocus={() => {
                          if (pickupSuggestions.length > 0) setShowPickupDropdown(true);
                        }}
                        className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-charcoal-200 bg-charcoal-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                      <div className="absolute right-3 flex items-center gap-1 z-10">
                        {isSearchingPickup && (
                          <Loader2 className="w-4 h-4 animate-spin text-charcoal-400" />
                        )}
                        {pickupText && (
                          <button
                            type="button"
                            onClick={() => {
                              setPickupText('');
                              setSelectedPickup(null);
                              setPickupSuggestions([]);
                              setShowPickupDropdown(false);
                            }}
                            className="p-0.5 text-charcoal-400 hover:text-charcoal-700 rounded-md"
                            title="Clear pickup"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown for Pickup Suggestions */}
                      {showPickupDropdown && pickupSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-charcoal-200 py-1 z-50 max-h-60 overflow-y-auto divide-y divide-charcoal-100">
                          {pickupSuggestions.map((place) => (
                            <button
                              key={place.id}
                              type="button"
                              onClick={() => handleSelectPickup(place)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/60 transition-colors flex items-start gap-2.5 group"
                            >
                              <div className="w-6 h-6 rounded-lg bg-charcoal-100 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                                <MapPin className="w-3.5 h-3.5 text-charcoal-600 group-hover:text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-charcoal-900 truncate">
                                  {place.name}
                                </div>
                                <div className="text-[11px] text-charcoal-500 truncate">
                                  {place.subtitle || place.address}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dropoff Field */}
                    <div ref={dropoffContainerRef} className="relative flex items-center">
                      <div className="absolute left-3.5 w-3 h-3 rounded-sm bg-charcoal-900 ring-4 ring-charcoal-100 z-10 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Where to? (e.g. Pune, Airport)"
                        value={dropoffText}
                        onChange={(e) => {
                          setDropoffText(e.target.value);
                          setSelectedDropoff(null);
                        }}
                        onFocus={() => {
                          if (dropoffSuggestions.length > 0) setShowDropoffDropdown(true);
                        }}
                        className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-charcoal-200 bg-charcoal-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      />
                      <div className="absolute right-3 flex items-center gap-1 z-10">
                        {isSearchingDropoff && (
                          <Loader2 className="w-4 h-4 animate-spin text-charcoal-400" />
                        )}
                        {dropoffText && (
                          <button
                            type="button"
                            onClick={() => {
                              setDropoffText('');
                              setSelectedDropoff(null);
                              setDropoffSuggestions([]);
                              setShowDropoffDropdown(false);
                            }}
                            className="p-0.5 text-charcoal-400 hover:text-charcoal-700 rounded-md"
                            title="Clear destination"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown for Dropoff Suggestions */}
                      {showDropoffDropdown && dropoffSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-charcoal-200 py-1 z-50 max-h-60 overflow-y-auto divide-y divide-charcoal-100">
                          {dropoffSuggestions.map((place) => (
                            <button
                              key={place.id}
                              type="button"
                              onClick={() => handleSelectDropoff(place)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/60 transition-colors flex items-start gap-2.5 group"
                            >
                              <div className="w-6 h-6 rounded-lg bg-charcoal-100 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                                <MapPin className="w-3.5 h-3.5 text-charcoal-600 group-hover:text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-charcoal-900 truncate">
                                  {place.name}
                                </div>
                                <div className="text-[11px] text-charcoal-500 truncate">
                                  {place.subtitle || place.address}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.01]"
                  >
                    <span>See Prices & Book Ride</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </form>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-charcoal-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  <span>4-Digit Safety PIN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>Average 3-min ETA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-500" />
                  <span>Cash or Card Sandbox</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-charcoal-900 text-white p-8 shadow-2xl border border-charcoal-800">
                <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <Car className="w-5 h-5 text-brand-400" />
                    <span>Live Ride Simulation</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                    Active System
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-400">Driver</span>
                    <span className="font-bold">Elena Rostova (4.98★)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-400">Vehicle</span>
                    <span className="font-bold">Tesla Model Y • 9ELN441</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-400">Ride-Start PIN</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">5291</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/60 mt-4">
                    <div className="text-[11px] text-charcoal-400">Estimated Route</div>
                    <div className="text-sm font-semibold mt-1">Dharampeth → Nagpur Airport</div>
                    <div className="text-xs text-emerald-400 font-bold mt-1">9.2 km • 19 min • $15.50</div>
                  </div>
                </div>

                <Link
                  href="/booking"
                  className="block text-center py-2.5 text-xs font-bold text-charcoal-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
                >
                  Experience Live Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-charcoal-50/60 border-b border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">How It Works</h2>
            <h3 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">Four simple steps to your destination</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Set Pickup & Dropoff',
                desc: 'Enter your locations or pick from saved favorites like Home and Work.',
                icon: MapPin,
              },
              {
                step: '02',
                title: 'Choose Vehicle & Fare',
                desc: 'Compare upfront locked fares across Economy, Comfort, and XL categories.',
                icon: Car,
              },
              {
                step: '03',
                title: 'Verify 4-Digit PIN',
                desc: 'Give your unique start PIN to the driver to securely initiate your trip.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Arrive & Rate',
                desc: 'Pay seamlessly with Cash or Card sandbox, review your receipt, and leave feedback.',
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-charcoal-200/80 shadow-sm relative">
                <div className="text-xs font-mono font-extrabold text-brand-600 mb-4">{item.step}</div>
                <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center text-charcoal-800 mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-charcoal-900 text-base mb-1">{item.title}</h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA Section */}
      <section className="py-16 bg-charcoal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Join the Fleet</span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight">Drive with RideFlow and earn on your schedule</h3>
              <p className="text-sm text-charcoal-400 leading-relaxed">
                Enjoy flexible hours, instant transparent earnings calculation, and a community that values your safety with
                verified riders and PIN verification.
              </p>
              <div className="pt-2 flex gap-4">
                <Link
                  href="/driver/apply"
                  className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md"
                >
                  Apply to Drive
                </Link>
                <Link
                  href="/driver/dashboard"
                  className="px-6 py-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold text-sm border border-charcoal-700"
                >
                  Driver Portal
                </Link>
              </div>
            </div>

            <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700 space-y-3">
              <div className="text-xs text-emerald-400 font-bold uppercase">Driver Requirements</div>
              <ul className="text-xs text-charcoal-300 space-y-2">
                <li className="flex items-center gap-2">✓ Valid Driver’s License and Clean Record</li>
                <li className="flex items-center gap-2">✓ 4-door vehicle model year 2000 or newer</li>
                <li className="flex items-center gap-2">✓ Fast document review and administrator approval</li>
                <li className="flex items-center gap-2">✓ 80% guaranteed fare split on completed trips</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-charcoal-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
              <Car className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-charcoal-800">RideFlow</span>
            <span>© 2026 RideFlow Technologies Inc.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-charcoal-900">
              Privacy Policy (Template)
            </Link>
            <Link href="/terms" className="hover:text-charcoal-900">
              Terms of Service (Template)
            </Link>
            <Link href="/safety" className="hover:text-charcoal-900">
              Safety Guidelines
            </Link>
            <Link href="/help" className="hover:text-charcoal-900">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
