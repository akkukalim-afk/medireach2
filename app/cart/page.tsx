'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building2,
  Clock,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalAmount, requiresPrescription, selectedPharmacyId, setSelectedPharmacyId } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState('Flat 402, Prestige Shantiniketan, Sector A, Yelahanka New Town, Bengaluru (560064)');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [prescriptionFile, setPrescriptionFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{
    isAvailable: boolean;
    missingItems: any[];
    fallbackPharmacies: any[];
  } | null>(null);

  // Check Trigger A: Selected store stock availability
  useEffect(() => {
    async function verifyStock() {
      if (items.length === 0) return;
      try {
        const pId = selectedPharmacyId || items[0]?.pharmacyId;
        const res = await fetch('/api/cart/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pharmacyId: pId,
            items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
          }),
        });
        const data = await res.json();
        setAvailability(data);
      } catch {
        // silent
      }
    }

    verifyStock();
  }, [items, selectedPharmacyId]);

  const handleSwitchCartPharmacy = (pharmacy: any) => {
    setSelectedPharmacyId(pharmacy.pharmacyId);
    setAvailability((prev) => prev ? { ...prev, isAvailable: true, missingItems: [] } : null);
  };

  const deliveryFee = totalAmount > 500 ? 0 : 30;
  const discountAmount = totalAmount > 800 ? 50 : 0;
  const netAmount = totalAmount - discountAmount + deliveryFee;

  // Simulate file upload or use sample prescription
  const handleUseSampleRx = () => {
    setPrescriptionFile({
      fileUrl: '/uploads/sample_prescription.jpg',
      fileName: 'Dr_Anand_MBBS_Rx_Prescription.jpg',
      fileType: 'image/jpeg',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile({
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type || 'image/jpeg',
      });
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in or select a demo persona from the top bar to place an order.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (requiresPrescription && !prescriptionFile) {
      setError('Please upload a prescription or click "Attach Sample Prescription" for this order.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Default to Apollo or first pharmacy if not explicitly chosen
      const pharmacyId = selectedPharmacyId || 'cmw6torbu00ocrejf00000000'; // fallback to first store

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId: items[0]?.pharmacyId || 'cmw6torbu00ocrejf00000000',
          items: items.map((i) => ({
            medicineId: i.medicineId,
            quantity: i.quantity,
          })),
          deliveryAddress: address,
          customerPhone: phone,
          prescriptionFile,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        router.push(`/orders/${data.orderId}`);
      } else {
        setError(data.error || 'Failed to place order.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your MediReach cart is empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Search over 50 medicines across local pharmacies in Yelahanka. Add required items to see live stock and fast delivery options.
        </p>
        <Link
          href="/medicines"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          <span>Explore Medicine Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/medicines" className="hover:text-emerald-600 transition flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Continue Shopping
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Checkout</span>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Review Cart & Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Trigger A Fallback Alert Banner: Out-of-Stock at selected store */}
      {availability && !availability.isAvailable && availability.missingItems?.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4 animate-scale-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Trigger A: Store Stockout Detected
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {availability.missingItems.map((m: any) => m.name).join(', ')} is out of stock at your selected store.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Fallback Engine queried nearby Yelahanka pharmacies. The following stores have all your requested items in stock right now:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {availability.fallbackPharmacies?.map((alt: any) => (
              <div
                key={alt.pharmacyId}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{alt.name}</h4>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      ★ {alt.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>🚗 {alt.distanceKm} km</span>
                    <span>⏱️ ~{alt.etaMinutes}m ETA</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1">
                    ✓ All Items in Stock
                  </div>
                </div>

                <button
                  onClick={() => handleSwitchCartPharmacy(alt)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Switch Cart Store</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items & Prescription Upload (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 text-base">Items in Cart ({items.length})</h2>
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.medicineId} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      {item.requiresPrescription && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Rx
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{item.genericName}</p>
                    <div className="text-xs font-bold text-slate-800">{formatPrice(item.price)} each</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-l-xl transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-r-xl transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.medicineId)}
                      className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Upload Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Prescription Upload</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {requiresPrescription
                    ? '⚠️ Your cart contains prescription medicines. A valid doctor prescription is mandatory.'
                    : 'Optional: attach a prescription for your pharmacist.'}
                </p>
              </div>

              {requiresPrescription && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Mandatory
                </span>
              )}
            </div>

            {prescriptionFile ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{prescriptionFile.fileName}</h4>
                    <p className="text-xs text-emerald-700 font-semibold">Prescription Attached Successfully</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrescriptionFile(null)}
                  className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-500 transition">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Upload Doctor Prescription (JPG, PNG, PDF up to 10MB)
                  </p>
                  <label className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer">
                    Browse File
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* 1-Click Sample Prescription for Fast Evaluation */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Quick Testing Shortcut:</span>
                  <button
                    onClick={handleUseSampleRx}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Attach Sample Prescription (Dr. Anand Rx)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Address & Bill Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Delivery Details</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Delivery Address (Bengaluru)</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Order Bill Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(totalAmount)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Cart Savings Discount</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Standard Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(deliveryFee)}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Fallback Rerouting Protection</span>
                <span className="text-emerald-600 font-semibold">Included (₹0)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
              <span className="text-xl font-black text-emerald-600">{formatPrice(netAmount)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <span>→</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Cash on Delivery / UPI accepted upon doorstep arrival.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

