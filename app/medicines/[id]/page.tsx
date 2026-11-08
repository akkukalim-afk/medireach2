'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  ShieldCheck,
  Plus,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function MedicineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addItem } = useCart();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addedStoreId, setAddedStoreId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicine() {
      try {
        const res = await fetch(`/api/medicines/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching medicine details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMedicine();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded w-1/2" />
          <div className="h-24 bg-slate-100 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!data?.medicine) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Medicine not found</h2>
        <Link href="/medicines" className="text-emerald-600 font-bold hover:underline">
          Return to catalog
        </Link>
      </div>
    );
  }

  const { medicine, availableStores, genericAlternatives } = data;

  const handleSelectStoreAndAdd = (store: any) => {
    addItem({
      medicineId: medicine.id,
      name: medicine.name,
      genericName: medicine.genericName,
      brand: medicine.brand,
      price: store.bestPrice,
      quantity: 1,
      requiresPrescription: medicine.requiresPrescription,
      pharmacyId: store.pharmacy.id,
      pharmacyName: store.pharmacy.name,
    });

    setAddedStoreId(store.pharmacy.id);
    setTimeout(() => setAddedStoreId(null), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/medicines" className="hover:text-emerald-600 transition flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> All Medicines
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{medicine.name}</span>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image & Badges */}
        <div className="space-y-4">
          <div className="w-full h-56 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center text-7xl border border-emerald-100/50 shadow-inner">
            {medicine.category === 'PRESCRIPTION' && '💊'}
            {medicine.category === 'OTC' && '🩹'}
            {medicine.category === 'VITAMINS' && '🍊'}
            {medicine.category === 'PERSONAL_CARE' && '🧴'}
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Category:</span>
              <strong className="text-slate-800">{medicine.category.replace('_', ' ')}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Dosage Form:</span>
              <strong className="text-slate-800">{medicine.dosageForm}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Strength:</span>
              <strong className="text-slate-800">{medicine.strength}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pack Size:</span>
              <strong className="text-slate-800">{medicine.packSize}</strong>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Details & Stores */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {medicine.brand}
              </span>
              {medicine.requiresPrescription ? (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  Doctor Prescription (Rx) Required
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  Over-The-Counter (OTC)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {medicine.name}
            </h1>
            <p className="text-sm font-semibold text-emerald-700">
              Active Salt / Generic: {medicine.genericName}
            </p>
            <p className="text-xs text-slate-500">Manufacturer: {medicine.manufacturer}</p>
          </div>

          {/* Description & Clinical Information */}
          <div className="space-y-2 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Therapeutic Indications</h3>
            <p>{medicine.description}</p>

            {medicine.sideEffects && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 mt-3 text-xs space-y-1">
                <span className="font-bold text-slate-800">Reported Mild Side Effects:</span>
                <p className="text-slate-600">{medicine.sideEffects}</p>
              </div>
            )}
          </div>

          {/* Real-Time Stock Availability Across Yelahanka Pharmacies */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Live Stock at Nearby Yelahanka Pharmacies
                </h3>
                <p className="text-xs text-slate-500">
                  Prices and unexpired batch stocks verified in real-time
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                {availableStores.length} Stores In Stock
              </span>
            </div>

            {availableStores.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
                <h4 className="font-bold text-red-900 text-sm">Temporarily Out of Stock in Yelahanka</h4>
                <p className="text-xs text-red-700 max-w-md mx-auto">
                  Our Fallback Engine has flagged this item across our 8 partner pharmacies. Check generic alternatives below or try back shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableStores.map((store: any) => (
                  <div
                    key={store.pharmacy.id}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500 hover:bg-emerald-50/20 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          {store.pharmacy.name}
                        </h4>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          ★ {store.pharmacy.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{store.pharmacy.address}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold">
                          🚗 {store.distanceKm} km
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                          ⏱️ ~{store.etaMinutes} mins
                        </span>
                        <span className="text-slate-500">
                          Stock: <strong>{store.totalQuantity} units</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col items-end gap-3 w-full sm:w-auto justify-between">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Store Price</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {formatPrice(store.bestPrice)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectStoreAndAdd(store)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          addedStoreId === store.pharmacy.id
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {addedStoreId === store.pharmacy.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select & Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generic Alternatives Section */}
      {genericAlternatives && genericAlternatives.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Generic & Therapeutic Alternatives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {genericAlternatives.map((alt: any) => (
              <Link
                key={alt.id}
                href={`/medicines/${alt.id}`}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition space-y-2 block"
              >
                <div className="text-xs font-bold text-slate-400">{alt.category.replace('_', ' ')}</div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{alt.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{alt.genericName}</p>
                <div className="text-xs font-bold text-emerald-600 pt-1">View Availability →</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

