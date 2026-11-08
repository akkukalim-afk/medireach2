'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  ShoppingBag,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleToggleApproval = async (pharmacyId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/pharmacies/${pharmacyId}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      if (res.ok) fetchMetrics();
    } catch (err) {
      console.error('Failed to toggle approval', err);
    }
  };

  const metrics = data?.metrics || {
    totalPharmacies: 0,
    pendingPharmacies: 0,
    totalOrders: 0,
    delayedOrders: 0,
    totalCustomers: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PLATFORM CONTROL CENTER
            </span>
            <span className="text-xs text-slate-400">Yelahanka, Bengaluru Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            MediReach Platform Administration
          </h1>
          <p className="text-xs text-slate-500">
            Real-time compliance monitoring, pharmacy onboarding, and delayed delivery dispatch oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Fallback Engine Healthy</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Pharmacies</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.totalPharmacies}</div>
          <span className="text-[11px] text-slate-500">8 licensed in Yelahanka</span>
        </div>

        <div className="bg-red-50/70 rounded-2xl p-5 border border-red-200 shadow-xs">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-bold uppercase tracking-wider">Delayed Deliveries</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-900 mt-2">{metrics.delayedOrders}</div>
          <span className="text-[11px] text-red-700 font-semibold">Fallback active on demo order</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Platform Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.totalOrders}</div>
          <span className="text-[11px] text-slate-500">Across all categories</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.totalCustomers}</div>
          <span className="text-[11px] text-slate-500">Patients & Customers</span>
        </div>
      </div>

      {/* Pharmacy Onboarding & Verification Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Verified Partner Pharmacies</h2>
            <p className="text-xs text-slate-500">
              License validation and store status controls
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Pharmacy Store</th>
                <th className="py-3 px-3">Owner Contact</th>
                <th className="py-3 px-3">License Number</th>
                <th className="py-3 px-3">Location Coordinates</th>
                <th className="py-3 px-3">Inventory / Orders</th>
                <th className="py-3 px-3">Onboarding Status</th>
                <th className="py-3 px-3 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data?.pharmacies?.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{p.address}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-slate-800 font-semibold">{p.owner.name}</div>
                    <div className="text-[11px] text-slate-400">{p.phone}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                    {p.licenseNumber}
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-slate-500">
                    {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-800">{p._count.batches} items</span>
                    <span className="text-[10px] text-slate-400 block">{p._count.orders} orders</span>
                  </td>
                  <td className="py-3.5 px-3">
                    {p.isApproved ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        APPROVED & ACTIVE
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        PENDING AUDIT
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleApproval(p.id, p.isApproved)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        p.isApproved
                          ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {p.isApproved ? 'Suspend' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

