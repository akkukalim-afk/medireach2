'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bike, MapPin, Phone, Building2, CheckCircle2, Navigation, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/delivery/assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error fetching delivery assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAction = async (assignmentId: string, action: 'PICK_UP' | 'DELIVER') => {
    try {
      const res = await fetch('/api/delivery/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, action }),
      });
      if (res.ok) {
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to update assignment', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              DELIVERY FLEET PORTAL
            </span>
            <span className="text-xs text-slate-400">Yelahanka Express Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rider Dashboard – {user?.name || 'Kiran Nayak'}
          </h1>
          <p className="text-xs text-slate-500">
            Active Trips: {assignments.filter((a) => a.status !== 'DELIVERED').length} | Completed: {assignments.filter((a) => a.status === 'DELIVERED').length}
          </p>
        </div>

        <div className="bg-blue-50 text-blue-900 border border-blue-200 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <Bike className="w-5 h-5 text-blue-600" />
          <span>Status: Available & On Duty</span>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Assigned Medicine Deliveries</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse space-y-3">
                <div className="h-5 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Bike className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No active delivery assignments</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You will be notified as soon as a Yelahanka pharmacy finishes packaging an order.
            </p>
          </div>
        ) : (
          assignments.map((a) => {
            const ord = a.order;
            const isPickedUp = a.status === 'PICKED_UP';
            const isDelivered = a.status === 'DELIVERED';

            return (
              <div
                key={a.id}
                className={`bg-white rounded-3xl p-6 border transition shadow-xs hover:shadow-md space-y-4 ${
                  isDelivered ? 'border-slate-200 opacity-75' : 'border-blue-300 ring-2 ring-blue-500/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">Order #{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPickedUp
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Assigned on {new Date(a.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Collect Amount (COD / UPI)</span>
                    <span className="text-base font-black text-slate-900">{formatPrice(ord.netAmount)}</span>
                  </div>
                </div>

                {/* Pickup and Delivery Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Step 1: Pickup from Pharmacy */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        1. Pickup Location (Pharmacy)
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(ord.pharmacy.name + ', ' + ord.pharmacy.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Navigation className="w-3 h-3" /> Map Directions
                      </a>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>{ord.pharmacy.name}</span>
                    </div>
                    <p className="text-slate-600">{ord.pharmacy.address}</p>
                    <p className="text-slate-500 font-medium">Store Phone: {ord.pharmacy.phone}</p>
                  </div>

                  {/* Step 2: Drop to Customer */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        2. Drop Location (Customer)
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(ord.deliveryAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Navigation className="w-3 h-3" /> Map Directions
                      </a>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{ord.customer?.name || 'Customer'}</span>
                    </div>
                    <p className="text-slate-600">{ord.deliveryAddress}</p>
                    <p className="text-slate-500 font-medium">Customer Phone: {ord.customerPhone}</p>
                  </div>
                </div>

                {/* Action Buttons for Rider */}
                {!isDelivered && (
                  <div className="pt-2 flex items-center gap-3">
                    {!isPickedUp ? (
                      <button
                        onClick={() => handleAction(a.id, 'PICK_UP')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Confirm Medicines Picked Up from Store</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(a.id, 'DELIVER')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Doorstep Delivery to Customer</span>
                      </button>
                    )}

                    <Link
                      href={`/orders/${ord.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
                    >
                      View Live Order Tracker →
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

