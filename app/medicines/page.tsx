'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, CheckCircle2, Clock, AlertTriangle, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

function MedicinesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { addItem } = useCart();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockOnly, setStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedicines() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('q', search);
        if (selectedCategory && selectedCategory !== 'ALL') queryParams.set('category', selectedCategory);

        const res = await fetch(`/api/medicines?${queryParams.toString()}`);
        const data = await res.json();
        setMedicines(data.medicines || []);
      } catch (err) {
        console.error('Error fetching medicines:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchMedicines();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const filteredMedicines = stockOnly
    ? medicines.filter((m) => m.stockStatus !== 'OUT_OF_STOCK')
    : medicines;

  const handleAddToCart = (med: any) => {
    addItem({
      medicineId: med.id,
      name: med.name,
      genericName: med.genericName,
      brand: med.brand,
      price: med.minPrice,
      quantity: 1,
      requiresPrescription: med.requiresPrescription,
      pharmacyId: med.nearestPharmacy?.id,
      pharmacyName: med.nearestPharmacy?.name,
    });

    setAddedId(med.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const categories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'PRESCRIPTION', name: 'Prescription (Rx)' },
    { id: 'OTC', name: 'Over the Counter (OTC)' },
    { id: 'VITAMINS', name: 'Vitamins & Supplements' },
    { id: 'PERSONAL_CARE', name: 'First Aid & Personal Care' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Medicine Catalog</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Medicine Catalog & Live Store Availability
        </h1>
        <p className="text-xs text-slate-500">
          Search over 50+ medicines across verified Yelahanka pharmacies. Stock status updates in real-time.
        </p>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by brand name or salt (e.g., Paracetamol, Azee)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Quick Toggle for In-Stock Only */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
              <div className="w-full h-32 bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-900">No medicines matched your query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for common Indian generics like Dolo, Azithromycin, Augmentin, or clear your filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setStockOnly(false);
            }}
            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between p-4 group"
            >
              <div className="space-y-3">
                {/* Header status */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">
                    {med.category.replace('_', ' ')}
                  </span>
                  {med.requiresPrescription ? (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      Rx
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      OTC
                    </span>
                  )}
                </div>

                {/* Icon box */}
                <div className="w-full h-28 bg-emerald-50/40 rounded-xl flex items-center justify-center text-4xl group-hover:scale-105 transition">
                  {med.category === 'PRESCRIPTION' && '💊'}
                  {med.category === 'OTC' && '🩹'}
                  {med.category === 'VITAMINS' && '🍊'}
                  {med.category === 'PERSONAL_CARE' && '🧴'}
                </div>

                {/* Info */}
                <div>
                  <Link
                    href={`/medicines/${med.id}`}
                    className="font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-1 text-sm"
                  >
                    {med.name}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{med.genericName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {med.packSize} • {med.manufacturer}
                  </p>
                </div>

                {/* Availability status */}
                <div>
                  {med.stockStatus === 'IN_STOCK' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>In Stock at {med.stockingPharmaciesCount} Yelahanka stores</span>
                    </span>
                  ) : med.stockStatus === 'LOW_STOCK' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Low Stock ({med.totalStock} units left)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Out of Stock (Fallback Available)</span>
                    </span>
                  )}

                  {med.nearestPharmacy && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Nearest: <strong>{med.nearestPharmacy.name.split('–')[0]}</strong> (
                      {med.nearestPharmacy.distanceKm} km • ~{med.nearestPharmacy.etaMinutes}m)
                    </p>
                  )}
                </div>
              </div>

              {/* Price and Add button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">Best Price</span>
                  <div className="text-base font-extrabold text-slate-900">
                    {formatPrice(med.minPrice)}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(med)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    addedId === med.id
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {addedId === med.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MedicinesPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-xs text-slate-400">Loading catalog...</div>}>
      <MedicinesContent />
    </Suspense>
  );
}
