import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartPulse, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                ✚
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Medi<span className="text-emerald-400">Reach</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hyperlocal medicine ordering and delivery powered by automated Fallback Routing. Ensuring patients never face delayed or missing critical medications.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Default Hub: Yelahanka, Bengaluru (560064)</span>
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/medicines" className="hover:text-emerald-400 transition">
                  Live Medicine Search
                </Link>
              </li>
              <li>
                <Link href="/pharmacies" className="hover:text-emerald-400 transition">
                  Nearby Pharmacies Map
                </Link>
              </li>
              <li>
                <Link href="/orders/demo" className="text-emerald-400 hover:text-emerald-300 font-medium transition flex items-center gap-1.5">
                  <span>⚡ Delay Fallback Demo</span>
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-emerald-400 transition">
                  AI Health Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Role Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/pharmacy/dashboard" className="hover:text-emerald-400 transition">
                  Pharmacy Owner Portal
                </Link>
              </li>
              <li>
                <Link href="/delivery/dashboard" className="hover:text-emerald-400 transition">
                  Delivery Partner Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-emerald-400 transition">
                  Admin Central & Metrics
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-emerald-400 transition">
                  Customer Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Patient Commitments</h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>100% Licensed & verified local pharmacies in Yelahanka</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Fallback rerouting ensures zero stockouts during emergencies</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <HeartPulse className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Safe prescription verification by registered pharmacists</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 text-xs text-slate-400 leading-relaxed space-y-2 text-center md:text-left">
          <p>
            <strong>Regulatory Disclaimer:</strong> MediReach is an intermediary digital technology platform facilitating medicine ordering between registered pharmacies and end-consumers in Bengaluru, India. We comply with Drugs and Cosmetics Rules and Pharmacy Practice Regulations. All prescription medications (Schedule H / H1) mandate visual review and physical endorsement by a registered pharmacist before order dispatch.
          </p>
          <p>© 2026 MediReach Healthcare Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

