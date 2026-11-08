'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Phone, Star, Clock, ArrowLeft, ShieldCheck } from 'lucide-react';
import LeafletMap, { MapMarker } from '@/components/LeafletMap';

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPharmacies() {
      try {
        const res = await fetch('/api/pharmacies?lat=13.1000&lng=77.5950');
        const data = await res.json();
        setPharmacies(data.pharmacies || []);
      } catch (err) {
        console.error('Error fetching pharmacies:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPharmacies();
  }, []);

  const mapMarkers: MapMarker[] = [
    // Customer location
    {
      id: 'customer-pin',
      lat: 13.1000,
      lng: 77.5950,
      title: 'Your Delivery Location',
      subtitle: 'Yelahanka New Town, Sector A',
      type: 'user',
    },
    // Pharmacies
    ...pharmacies.map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      title: p.name,
      subtitle: p.address,
      type: 'normal_pharmacy' as const,
      distanceKm: p.distanceKm,
      etaMinutes: p.etaMinutes,
      onSelect: () => setSelectedPharmacyId(p.id),
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Pharmacies</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Pharmacies in Yelahanka
        </h1>
        <p className="text-xs text-slate-500">
          Browse licensed local medical stores on the interactive map. Ranked by distance, delivery ETA, and stock availability.
        </p>
      </div>

      {/* Split Layout: Interactive Map + Pharmacy Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Leaflet Map (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Live Yelahanka Map Network</span>
              </span>
              <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                8 Stores Online
              </span>
            </div>

            <LeafletMap
              markers={mapMarkers}
              center={[13.1007, 77.5963]}
              zoom={13}
              height="540px"
            />

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span>Blue Pin: Your Delivery Location (Yelahanka New Town)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                <span>Green Pins: Verified Partner Pharmacies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pharmacies Directory List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            pharmacies.map((pharmacy) => (
              <div
                key={pharmacy.id}
                id={pharmacy.id}
                className={`bg-white rounded-2xl border p-5 transition shadow-xs hover:shadow-md space-y-3 ${
                  selectedPharmacyId === pharmacy.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{pharmacy.name}</h3>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        ★ {pharmacy.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{pharmacy.address}</p>
                    {pharmacy.landmark && (
                      <p className="text-[11px] text-slate-400">Landmark: {pharmacy.landmark}</p>
                    )}
                  </div>

                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Open Now</span>
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    🚗 {pharmacy.distanceKm} km away
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>~{pharmacy.etaMinutes} mins ETA</span>
                  </span>
                  <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                    📦 {pharmacy.totalItemsInStock} medicines in stock
                  </span>
                </div>

                {/* Contact and Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pharmacy.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPharmacyId(pharmacy.id)}
                      className="text-slate-600 font-semibold hover:text-slate-900 px-2 py-1"
                    >
                      Locate on Map
                    </button>
                    <Link
                      href={`/medicines?store=${pharmacy.id}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition"
                    >
                      Shop Store →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

