'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building2,
  Bike,
  Plus,
  Bot,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function HomePage() {
  const { addItem } = useCart();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [medRes, pharmRes] = await Promise.all([
          fetch('/api/medicines?lat=13.1000&lng=77.5950'),
          fetch('/api/pharmacies?lat=13.1000&lng=77.5950'),
        ]);

        const medData = await medRes.json();
        const pharmData = await pharmRes.json();

        setMedicines(medData.medicines || []);
        setPharmacies(pharmData.pharmacies || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const categories = [
    { id: 'ALL', name: 'All Categories', icon: '💊' },
    { id: 'PRESCRIPTION', name: 'Prescription (Rx)', icon: '🩺' },
    { id: 'OTC', name: 'Over the Counter', icon: '🩹' },
    { id: 'VITAMINS', name: 'Vitamins & Immunity', icon: '🍊' },
    { id: 'PERSONAL_CARE', name: 'First Aid & Care', icon: '🧴' },
  ];

  const filteredMedicines =
    selectedCategory === 'ALL'
      ? medicines.slice(0, 8)
      : medicines.filter((m) => m.category === selectedCategory).slice(0, 8);

  return (
    <div className="space-y-12 pb-16">
      {/* Interactive Demo Banner */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-3 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> LIVE DEMO
            </span>
            <span className="text-emerald-100">
              Test MediReach&apos;s <strong>Delay Fallback Engine</strong> with live seed data in Yelahanka:
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders/demo"
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-3 py-1 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
            >
              <span>View Delayed Order Fallback</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/medicines?q=Azithromycin"
              className="bg-emerald-700/60 hover:bg-emerald-600/80 text-white px-3 py-1 rounded-full font-semibold transition"
            >
              Out-of-Stock Trigger
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-100/80 rounded-3xl p-6 md:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>HYPERLOCAL MEDICINE DISCOVERY & FALLBACK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Medicines delivered in minutes. <br />
              <span className="text-emerald-600">Never out of reach.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Order from verified pharmacies near you in <strong>Yelahanka, Bengaluru</strong>. If an item is out of stock or your delivery is delayed, our smart Fallback Engine automatically reroutes your order to nearby alternative stores with live stock.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="bg-white/90 backdrop-blur-xs border border-emerald-100 rounded-2xl p-3 text-center shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">8+</div>
                <div className="text-[11px] font-semibold text-slate-500">Yelahanka Stores</div>
              </div>
              <div className="bg-white/90 backdrop-blur-xs border border-emerald-100 rounded-2xl p-3 text-center shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">~22m</div>
                <div className="text-[11px] font-semibold text-slate-500">Average ETA</div>
              </div>
              <div className="bg-white/90 backdrop-blur-xs border border-emerald-100 rounded-2xl p-3 text-center shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">100%</div>
                <div className="text-[11px] font-semibold text-slate-500">Fallback Uptime</div>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/medicines"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Find Medicines Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pharmacies"
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-5 py-3.5 rounded-xl transition flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Browse Pharmacies Map</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending & Available Medicines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Essential Medicines in Yelahanka
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live stock aggregated from 8 local medical stores
            </p>
          </div>
          <Link
            href="/medicines"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All ({medicines.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                <div className="w-full h-32 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredMedicines.map((med) => (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col justify-between p-4 group"
              >
                <div className="space-y-3">
                  {/* Header badges */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider">
                      {med.category.replace('_', ' ')}
                    </span>
                    {med.requiresPrescription ? (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                        Rx Required
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        OTC
                      </span>
                    )}
                  </div>

                  {/* Icon illustration */}
                  <div className="w-full h-28 bg-emerald-50/50 rounded-xl flex items-center justify-center text-4xl group-hover:scale-105 transition">
                    {med.category === 'PRESCRIPTION' && '💊'}
                    {med.category === 'OTC' && '🩹'}
                    {med.category === 'VITAMINS' && '🍊'}
                    {med.category === 'PERSONAL_CARE' && '🧴'}
                  </div>

                  {/* Title & Generic */}
                  <div>
                    <Link
                      href={`/medicines/${med.id}`}
                      className="font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-1 text-sm"
                    >
                      {med.name}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1">{med.genericName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{med.packSize}</p>
                  </div>

                  {/* Availability Badge */}
                  <div className="pt-1">
                    {med.stockStatus === 'IN_STOCK' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Stock at {med.stockingPharmaciesCount} stores</span>
                      </span>
                    ) : med.stockStatus === 'LOW_STOCK' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Low Stock (1 store)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Out of Stock (Fallback Available)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Add to Cart button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-slate-400">From</span>
                    <div className="text-base font-extrabold text-slate-900">
                      {formatPrice(med.minPrice)}
                    </div>
                  </div>

                  <button
                    onClick={() =>
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
                      })
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition shadow-xs hover:shadow flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Standout Feature: How Fallback Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              PROPRIETARY TECHNOLOGY
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Delay & Stockout Fallback Engine
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Traditional delivery apps cancel your order when a pharmacy runs out of stock or faces heavy rush. MediReach monitors your delivery window in real-time. If delayed or unavailable, we instantly query neighbouring pharmacies in Yelahanka and give you a 1-click option to switch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 relative z-10">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-white text-base">Automatic Trigger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an order remains preparing past ETA + 10 mins, or an item has 0 stock, the engine wakes up automatically.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-white text-base">Haversine Geo-Ranking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Queries verified pharmacies within 5 km, checking unexpired batch stock, road distance, and store preparation speed.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-white text-base">1-Click Seamless Transfer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer receives a fallback alert with an interactive map, and switches the order to the new pharmacy instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Pharmacies in Yelahanka */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Nearby Yelahanka Pharmacies
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified local stores ready for instant dispatch
            </p>
          </div>
          <Link
            href="/pharmacies"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Explore Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pharmacies.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.address}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2 py-1 rounded-md shrink-0">
                  ★ {p.rating}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="bg-slate-100 px-2 py-1 rounded-md font-semibold">
                  🚗 {p.distanceKm} km
                </span>
                <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md font-semibold">
                  ⏱️ {p.etaMinutes} mins
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {p.totalItemsInStock} medicines in stock
                </span>
                <Link
                  href={`/pharmacies#${p.id}`}
                  className="text-emerald-600 font-bold hover:text-emerald-700"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Have questions about a medicine?</h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Chat with MediReach AI for basic pharmacological details, side-effect queries, or help placing your order. Protected by strict safety disclaimers.
              </p>
            </div>
          </div>
          <Link
            href="/ai-assistant"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-sm whitespace-nowrap"
          >
            Ask MediReach AI
          </Link>
        </div>
      </section>
    </div>
  );
}

