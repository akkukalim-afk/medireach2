'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Clock, CheckCircle2, AlertTriangle, Zap, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function OrdersHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Demo Callout */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 fill-current shrink-0" />
          <span>
            <strong>Evaluation Demo Scenario:</strong> Order #MR-YEL-2026-9041 is delayed by 15 mins at Apollo Pharmacy. Click to see the Fallback Engine in action!
          </span>
        </div>
        <Link
          href="/orders/demo"
          className="bg-white text-amber-900 font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xs hover:bg-amber-50 transition"
        >
          View Live Fallback →
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Order History</h1>
        <p className="text-xs text-slate-500">
          Track real-time delivery status, view pharmacist verification notes, and inspect fallback transfers.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse space-y-3">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-6 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No orders placed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our Yelahanka pharmacies catalog and place your first order.
          </p>
          <Link
            href="/medicines"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
          >
            Browse Medicines
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-3xl p-6 border transition shadow-xs hover:shadow-md space-y-4 ${
                order.isDelayed
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">#{order.orderNumber}</span>
                    {order.isDelayed && (
                      <span className="bg-red-100 text-red-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>DELAYED (FALLBACK ACTIVE)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Placed on {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              {/* Pharmacy & Items */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>{order.pharmacy?.name}</span>
                  </div>
                  <p className="text-slate-500">
                    {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'} •{' '}
                    {order.items?.map((i: any) => i.medicine?.name).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Amount</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {formatPrice(order.netAmount)}
                    </span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

