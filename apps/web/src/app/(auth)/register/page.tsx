'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/authStore';
import { fetchApi } from '../../../lib/api';
import { Car, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi<{ id: string; name: string; email: string; role: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone, role }),
      });

      setUser(data as any);

      if (role === 'driver') {
        router.push('/driver/apply');
      } else {
        router.push('/booking');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Car className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Create your Account</h1>
          <p className="text-xs text-charcoal-500">Sign up to book rides or start driving</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-charcoal-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('rider')}
            className={`py-2 text-xs font-bold rounded-xl transition-colors ${
              role === 'rider' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            I want to Ride
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2 text-xs font-bold rounded-xl transition-colors ${
              role === 'driver' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            I want to Drive
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-charcoal-700">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3" />
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-700">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3" />
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-700">Phone Number (Optional)</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-charcoal-700">Password (min 8 characters)</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </form>

        <div className="text-center text-xs text-charcoal-500 pt-2 border-t border-charcoal-100">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
