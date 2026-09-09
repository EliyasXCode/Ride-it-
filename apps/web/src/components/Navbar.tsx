'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../stores/authStore';
import { Car, Shield, LifeBuoy, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-charcoal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-charcoal-900">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Car className="w-5 h-5" />
          </div>
          <span>Ride<span className="text-brand-500">Flow</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal-600">
          <Link href="/booking" className="hover:text-charcoal-900 transition-colors">
            Book a Ride
          </Link>
          <Link href="/how-it-works" className="hover:text-charcoal-900 transition-colors">
            How It Works
          </Link>
          <Link href="/vehicles" className="hover:text-charcoal-900 transition-colors">
            Vehicles
          </Link>
          <Link href="/driver/apply" className="hover:text-charcoal-900 transition-colors">
            Drive with Us
          </Link>
          <Link href="/safety" className="hover:text-charcoal-900 transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-500" />
            Safety
          </Link>
          <Link href="/help" className="hover:text-charcoal-900 transition-colors flex items-center gap-1.5">
            <LifeBuoy className="w-4 h-4 text-charcoal-400" />
            Help
          </Link>
        </nav>

        {/* Auth CTA / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'driver' && (
                <Link
                  href="/driver/dashboard"
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hover:bg-emerald-100"
                >
                  Driver Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200 hover:bg-purple-100"
                >
                  Admin Portal
                </Link>
              )}
              <Link
                href="/account"
                className="flex items-center gap-2 text-sm text-charcoal-800 hover:text-charcoal-950 px-3 py-1.5 rounded-lg hover:bg-charcoal-50"
              >
                <div className="w-7 h-7 rounded-full bg-charcoal-200 flex items-center justify-center text-charcoal-700 font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => logout()}
                aria-label="Log out"
                className="p-2 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-charcoal-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-charcoal-700 hover:text-charcoal-900 px-4 py-2 rounded-lg hover:bg-charcoal-50"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-charcoal-900 hover:bg-charcoal-800 px-4 py-2 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-charcoal-600 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-charcoal-100 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/booking"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-charcoal-900"
          >
            Book a Ride
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-charcoal-700"
          >
            How It Works
          </Link>
          <Link
            href="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-charcoal-700"
          >
            Vehicles
          </Link>
          <Link
            href="/driver/apply"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-charcoal-700"
          >
            Drive with Us
          </Link>
          <Link
            href="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-charcoal-700"
          >
            Safety
          </Link>
          <Link
            href="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-charcoal-700"
          >
            Help & Support
          </Link>
          <div className="pt-4 border-t border-charcoal-100 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-sm font-semibold text-charcoal-900 mb-1">Signed in as {user.name}</div>
                {user.role === 'driver' && (
                  <Link
                    href="/driver/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    Driver Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-sm font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 text-center text-sm font-semibold rounded-lg bg-charcoal-100 text-charcoal-800"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-charcoal-800 border border-charcoal-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-charcoal-900 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
