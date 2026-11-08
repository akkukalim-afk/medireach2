'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Bike,
  Phone,
  RotateCcw,
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Zap,
  Printer,
  FileText,
} from 'lucide-react';
import LeafletMap, { MapMarker } from '@/components/LeafletMap';
import { formatPrice } from '@/lib/utils';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [switchSuccess, setSwitchSuccess] = useState<string | null>(null);
  const [callModalStore, setCallModalStore] = useState<any | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [id]);

  const handleSimulateDelay = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerDelayDemo: true }),
      });
      if (res.ok) {
        await fetchOrderDetails();
      }
    } catch (err) {
      console.error('Error triggering delay demo:', err);
    }
  };

  const handleSwitchPharmacy = async (targetPharmacyId: string) => {
    setSwitching(targetPharmacyId);
    try {
      const res = await fetch(`/api/orders/${id}/switch-pharmacy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPharmacyId }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSwitchSuccess(resData.message || 'Switched successfully!');
        await fetchOrderDetails();
        setTimeout(() => setSwitchSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Error switching pharmacy:', err);
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded w-1/2" />
          <div className="h-36 bg-slate-100 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <Link href="/orders" className="text-emerald-600 font-bold hover:underline">
          View all orders
        </Link>
      </div>
    );
  }

  const { order, fallbackPharmacies } = data;

  const steps = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'ACCEPTED', label: 'Accepted by Store' },
    { key: 'PREPARING', label: 'Preparing Medicines' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  // Map markers for live map
  const mapMarkers: MapMarker[] = [
    {
      id: 'customer',
      lat: order.customerLat || 13.1000,
      lng: order.customerLng || 77.5950,
      title: 'Your Delivery Location',
      subtitle: order.deliveryAddress,
      type: 'user',
    },
    {
      id: order.pharmacy.id,
      lat: order.pharmacy.lat,
      lng: order.pharmacy.lng,
      title: order.pharmacy.name,
      subtitle: order.isDelayed ? 'Delayed Store' : 'Active Store',
      type: order.isDelayed ? 'current_pharmacy' : 'normal_pharmacy',
      distanceKm: 1.2,
      etaMinutes: 18,
    },
    ...(fallbackPharmacies || []).map((f: any) => ({
      id: f.pharmacyId,
      lat: f.lat,
      lng: f.lng,
      title: f.name,
      subtitle: `${f.distanceKm} km • ~${f.etaMinutes} mins • 100% Stock Match`,
      type: 'fallback_pharmacy' as const,
      distanceKm: f.distanceKm,
      etaMinutes: f.etaMinutes,
      score: f.score,
      onSelect: () => handleSwitchPharmacy(f.pharmacyId),
    })),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/orders" className="hover:text-emerald-600 transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> All Orders
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">#{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Status & Live Tracking
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInvoiceOpen(true)}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tax Invoice</span>
          </button>

          {/* Action button to simulate delay on demand */}
          {!order.isDelayed && order.status !== 'DELIVERED' && (
            <button
              onClick={handleSimulateDelay}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-amber-300"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-600" />
              <span>Simulate Delay</span>
            </button>
          )}
        </div>
      </div>

      {switchSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{switchSuccess}</span>
        </div>
      )}

      {/* CRITICAL FEATURE: FALLBACK ENGINE ALERT BANNER & MAP */}
      {order.isDelayed && (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5 fill-current" />
                <span>FALLBACK ENGINE ACTIVATED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Running Late? These nearby pharmacies have your medicines in stock right now.
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {order.pharmacy.name} is experiencing unexpected rush. Our engine queried verified pharmacies in Yelahanka with unexpired stock and ranked them by distance and prep time. You can transfer your order with 1 click.
              </p>
            </div>

            <div className="bg-white border border-amber-200 px-4 py-2.5 rounded-2xl text-center shrink-0 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Original Store
              </span>
              <span className="text-xs font-extrabold text-amber-900">{order.pharmacy.name.split('–')[0]}</span>
              <span className="text-[10px] text-red-600 block font-semibold mt-0.5">
                Delayed by ~15 mins
              </span>
            </div>
          </div>

          {/* Interactive Fallback Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alternative Pharmacies within 5 km of Yelahanka New Town</span>
              </span>
              <span className="text-[11px] text-slate-500">Click any green marker to switch</span>
            </div>

            <LeafletMap
              markers={mapMarkers}
              center={[order.customerLat || 13.1000, order.customerLng || 77.5950]}
              zoom={14}
              height="340px"
            />
          </div>

          {/* Ranked Fallback Stores Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              Recommended Alternative Stores (Ranked by Match Score)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(fallbackPharmacies || []).map((alt: any) => (
                <div
                  key={alt.pharmacyId}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xs hover:border-emerald-500 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{alt.name}</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        ★ {alt.rating}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">{alt.address}</p>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                        🚗 {alt.distanceKm} km
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                        ⏱️ ~{alt.etaMinutes} mins
                      </span>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-2 text-[11px] text-emerald-800 font-semibold space-y-0.5">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All {alt.availableItems.length} items in stock</span>
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Rank Score: {Math.round(alt.score * 100)}% match
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleSwitchPharmacy(alt.pharmacyId)}
                      disabled={switching === alt.pharmacyId}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {switching === alt.pharmacyId ? (
                        <span>Switching Store...</span>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Switch Order to this Store</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setCallModalStore(alt)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>Call Pharmacy ({alt.phone.split(' ')[2] || alt.phone})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Order Pipeline & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Status Tracker & Items (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress Pipeline */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  Estimated Delivery Window
                </span>
                <div className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>
                    {new Date(order.promisedEta).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.isDelayed
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>

            {/* Stepper Pipeline */}
            <div className="relative pt-2">
              <div className="absolute top-5 left-4 right-4 h-1 bg-slate-100 -z-0" />
              <div
                className="absolute top-5 left-4 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                style={{
                  width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 95)}%`,
                }}
              />

              <div className="relative z-10 flex items-start justify-between">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center max-w-[80px]">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-semibold mt-2 leading-tight ${
                          isCurrent
                            ? 'text-emerald-700 font-extrabold'
                            : isDone
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Audit Log */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Real-Time Dispatch Updates
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.statusHistory?.map((hist: any) => (
                  <div key={hist.id} className="text-xs flex items-start gap-2.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{hist.notes}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(hist.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ordered Medicines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Prescribed Items ({order.items.length})</h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-sm">{item.medicine.name}</div>
                    <div className="text-slate-500">{item.medicine.genericName} • {item.medicine.packSize}</div>
                    <div className="text-slate-400">Qty: {item.quantity}</div>
                  </div>

                  <div className="text-right font-extrabold text-slate-900 text-sm">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Pharmacy & Delivery Partner Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pharmacy Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfilling Store</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                ★ {order.pharmacy.rating}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">{order.pharmacy.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{order.pharmacy.address}</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.pharmacy.phone}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Lic: {order.pharmacy.licenseNumber}
              </span>
            </div>
          </div>

          {/* Delivery Partner Assigned */}
          {order.deliveryAssignment && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Rider
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {order.deliveryAssignment.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {order.deliveryAssignment.partner?.name || 'Kiran Nayak'}
                  </h4>
                  <p className="text-xs text-slate-500">MediReach Yelahanka Express Fleet</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {order.deliveryAssignment.partner?.phone || '+91 98453 44556'}
                </span>
                <span className="text-emerald-600 font-bold">Rider en-route</span>
              </div>
            </div>
          )}

          {/* Prescription Status if Uploaded */}
          {order.prescription && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescription Review</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    order.prescription.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.prescription.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.prescription.status}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-800">{order.prescription.fileName}</p>
                {order.prescription.pharmacistNotes && (
                  <p className="text-slate-500 italic">
                    Pharmacist note: &quot;{order.prescription.pharmacistNotes}&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Destination Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Deliver To</span>
            <p className="font-semibold text-slate-800 leading-relaxed">{order.deliveryAddress}</p>
            <p className="text-slate-500 font-medium">Contact: {order.customerPhone}</p>
          </div>
        </div>
      </div>

      {/* Simulated Call Modal */}
      {callModalStore && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">{callModalStore.name}</h3>
              <p className="text-xs text-slate-500">Pharmacist direct hotline</p>
              <div className="text-lg font-black text-emerald-700 pt-2">{callModalStore.phone}</div>
            </div>
            <button
              onClick={() => setCallModalStore(null)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* GST Medical Tax Invoice Modal */}
      {invoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-200">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    ✚
                  </div>
                  <span className="font-black text-slate-900 text-base">
                    Medi<span className="text-emerald-600">Reach</span> Healthcare
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Tax Invoice & Delivery Challan (Drugs & Cosmetics Act, 1940)</p>
              </div>

              <div className="text-right text-xs">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  ORIGINAL FOR RECIPIENT
                </span>
                <div className="font-mono text-slate-700 mt-1 font-bold">INV-{order.orderNumber}</div>
                <div className="text-[11px] text-slate-400">Date: {new Date(order.placedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Seller & Buyer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispensing Pharmacy</span>
                <strong className="text-slate-900 block">{order.pharmacy.name}</strong>
                <p className="text-slate-500 text-[11px] leading-snug">{order.pharmacy.address}</p>
                <div className="text-[10px] text-slate-600 pt-1">
                  DL No: <strong>{order.pharmacy.licenseNumber}</strong> | GSTIN: <strong>29AAACM9041P1Z5</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient / Consignee</span>
                <strong className="text-slate-900 block">{order.customer?.name || 'Rahul Sharma'}</strong>
                <p className="text-slate-500 text-[11px] leading-snug">{order.deliveryAddress}</p>
                <div className="text-[10px] text-slate-600 pt-1">
                  Phone: <strong>{order.customerPhone}</strong>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2">HSN</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.medicine.name}</div>
                        <div className="text-[10px] text-slate-400">{item.medicine.genericName} • {item.medicine.packSize}</div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px]">3004</td>
                      <td className="py-2.5 px-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-2 text-right">{formatPrice(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (6%) + SGST (6%)</span>
                <span>Included in MRP</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied</span>
                  <span>- {formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount Paid / Payable</span>
                <span className="text-emerald-700">{formatPrice(order.netAmount)}</span>
              </div>
            </div>

            {/* Footer Sign-off & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-[10px] text-slate-400">
                Electronically generated on MediReach Network • Registered Pharmacist Verified
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setInvoiceOpen(false)}
                  className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

