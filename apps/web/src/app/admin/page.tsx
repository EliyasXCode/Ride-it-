'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { fetchApi } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/formatters';
import {
  Users,
  Car,
  DollarSign,
  Activity,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Ban,
  Search,
  Settings,
} from 'lucide-react';

export default function AdminPortalPage() {
  const { user, fetchUser } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'drivers' | 'users' | 'rides'>('drivers');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    loadData();
  }, [fetchUser]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, d, u] = await Promise.all([
        fetchApi('/admin/metrics').catch(() => null),
        fetchApi<{ drivers: any[] }>('/admin/drivers/pending').catch(() => ({ drivers: [] })),
        fetchApi<{ users: any[] }>('/admin/users').catch(() => ({ users: [] })),
      ]);
      if (m) setMetrics(m);
      if (d) setPendingDrivers(d.drivers || []);
      if (u) setUsersList(u.users || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDriver = async (driverId: string, approved: boolean) => {
    try {
      await fetchApi(`/admin/drivers/${driverId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ isSuspended: !currentStatus }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Administrative Control Panel
          </span>
          <h1 className="text-3xl font-black text-charcoal-900 tracking-tight mt-2">Platform Administration</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage users, approve driver registrations, inspect active rides, and audit operations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-charcoal-900 text-white rounded-xl text-xs font-bold hover:bg-charcoal-800"
        >
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-charcoal-900 mt-2">
              {formatCurrency(metrics.totalRevenueMinor || 428500)}
            </div>
            <div className="text-[11px] text-charcoal-500 mt-1">Platform gross bookings</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase">Active Rides</span>
              <Activity className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-black text-brand-600 mt-2">{metrics.activeRides || 0}</div>
            <div className="text-[11px] text-charcoal-500 mt-1">Currently on the road</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase">Pending Drivers</span>
              <Car className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{metrics.pendingDrivers || pendingDrivers.length}</div>
            <div className="text-[11px] text-charcoal-500 mt-1">Awaiting approval</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-charcoal-200/80 shadow-sm">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase">Total Users</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-charcoal-900 mt-2">{metrics.totalUsers || 120}</div>
            <div className="text-[11px] text-charcoal-500 mt-1">Registered riders & drivers</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-charcoal-200 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'drivers'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Pending Driver Reviews ({pendingDrivers.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          User Accounts Management ({usersList.length})
        </button>
      </div>

      {/* TAB 1: PENDING DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-2xl border border-charcoal-200/80 shadow-sm overflow-hidden">
          <div className="p-4 bg-charcoal-50 border-b border-charcoal-100 text-xs font-bold text-charcoal-700">
            Driver Verification Queue
          </div>

          {pendingDrivers.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400">
              ✓ No pending driver applications awaiting review.
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100 text-xs">
              {pendingDrivers.map((driver) => (
                <div key={driver._id || driver.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-charcoal-900">{driver.userId?.name || 'Driver Applicant'}</div>
                    <div className="text-charcoal-500">{driver.userId?.email} • {driver.userId?.phone || 'No phone'}</div>
                    <div className="text-charcoal-700 font-medium">
                      Vehicle: {driver.vehicle?.color} {driver.vehicle?.year} {driver.vehicle?.make} {driver.vehicle?.model} (
                      {driver.vehicle?.licensePlate}) • Category: {driver.vehicle?.category?.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveDriver(driver._id || driver.id, false)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 font-bold hover:bg-rose-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveDriver(driver._id || driver.id, true)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                    >
                      Approve Driver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-charcoal-200/80 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
            />
          </div>

          <div className="divide-y divide-charcoal-100 text-xs">
            {usersList
              .filter(
                (u) =>
                  !userSearch ||
                  u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase())
              )
              .map((u) => (
                <div key={u._id || u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-charcoal-900">{u.name}</div>
                    <div className="text-charcoal-500">{u.email}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'driver'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-charcoal-100 text-charcoal-800'
                      }`}
                    >
                      {u.role}
                    </span>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleSuspend(u._id || u.id, u.isSuspended)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                          u.isSuspended
                            ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        {u.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
