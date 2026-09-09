'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { fetchApi } from '../../../lib/api';
import { Car, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('rider@rideflow.test');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi<{ id: string; name: string; email: string; role: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUser(data as any);

      if (data.role === 'driver') {
        router.push('/driver/dashboard');
      } else if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/booking');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (role: 'rider' | 'driver' | 'admin') => {
    if (role === 'rider') {
      setEmail('rider@rideflow.test');
      setPassword('password123');
    } else if (role === 'driver') {
      setEmail('driver@rideflow.test');
      setPassword('password123');
    } else {
      setEmail('admin@rideflow.test');
      setPassword('AdminRideFlow2026!');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Car className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Sign in to RideFlow</h1>
          <p className="text-xs text-charcoal-500">Access your rides, driver dashboard, or account settings</p>
        </div>

        {/* Demo Account Shortcuts Banner */}
        <div className="p-3.5 bg-charcoal-50 rounded-2xl border border-charcoal-200/80 space-y-2">
          <div className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Instant Demo Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('rider')}
              className="py-1.5 px-2 bg-white rounded-lg border border-charcoal-200 hover:border-brand-500 text-[11px] font-bold text-charcoal-700"
            >
              Demo Rider
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('driver')}
              className="py-1.5 px-2 bg-white rounded-lg border border-charcoal-200 hover:border-brand-500 text-[11px] font-bold text-charcoal-700"
            >
              Demo Driver
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="py-1.5 px-2 bg-white rounded-lg border border-charcoal-200 hover:border-brand-500 text-[11px] font-bold text-charcoal-700"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-charcoal-700">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-charcoal-700">Password</label>
              <Link href="/reset-password" className="text-xs text-brand-600 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-charcoal-100">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
