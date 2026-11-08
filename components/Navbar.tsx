'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import NotificationBell from '@/components/NotificationBell';
import {
  ShoppingBag,
  Search,
  MapPin,
  Bot,
  User,
  LogOut,
  Building2,
  Bike,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, quickSwitch } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/medicines?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRoleSwitch = async (email: string) => {
    setRoleDropdownOpen(false);
    await quickSwitch(email);
    if (email.includes('apollo') || email.includes('medplus')) {
      router.push('/pharmacy/dashboard');
    } else if (email.includes('delivery')) {
      router.push('/delivery/dashboard');
    } else if (email.includes('admin')) {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Demo Bar / Quick Switcher */}
      <div className="bg-emerald-950 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-200">Demo Role Switcher:</span>
          <span className="text-slate-300">
            Active: <strong className="text-white">{user?.name || 'Guest Customer'}</strong> ({user?.role || 'GUEST'})
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 px-2.5 py-1 rounded-md text-emerald-100 font-medium transition cursor-pointer"
          >
            <span>Switch Persona</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 p-2 z-50">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select Test Persona
              </div>
              <button
                onClick={() => handleRoleSwitch('customer@medireach.in')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-700">Rahul Sharma</div>
                  <div className="text-[11px] text-slate-500">Customer (Yelahanka New Town)</div>
                </div>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Customer</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('apollo@medireach.in')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-700">Dr. Ramesh Kumar</div>
                  <div className="text-[11px] text-slate-500">Apollo Pharmacy Owner</div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Store</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('medplus@medireach.in')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-700">Suresh Gowda</div>
                  <div className="text-[11px] text-slate-500">MedPlus Pharmacy Owner</div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Store</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('delivery@medireach.in')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-700">Kiran Nayak</div>
                  <div className="text-[11px] text-slate-500">Delivery Partner (Rider)</div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Rider</span>
              </button>

              <button
                onClick={() => handleRoleSwitch('admin@medireach.in')}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-emerald-700">Administrator</div>
                  <div className="text-[11px] text-slate-500">Platform Admin & Monitor</div>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <span className="text-xl font-black">✚</span>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-600 transition">
                  Medi<span className="text-emerald-600">Reach</span>
                </span>
                <span className="block text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
                  Medicines, Closer to You
                </span>
              </div>
            </Link>

            {/* Location Indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-xs text-emerald-900 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Yelahanka New Town, Bengaluru (560064)</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search 50+ medicines, generics (e.g. Dolo, Azithromycin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-700">
              <Link href="/medicines" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                Medicines
              </Link>
              <Link href="/pharmacies" className="px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                Pharmacies
              </Link>
              <Link
                href="/ai-assistant"
                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>AI Health</span>
              </Link>
            </nav>

            {/* Portal Link if Owner, Delivery, or Admin */}
            {user?.role === 'PHARMACY_OWNER' && (
              <Link
                href="/pharmacy/dashboard"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Store Dashboard</span>
              </Link>
            )}

            {user?.role === 'DELIVERY_PARTNER' && (
              <Link
                href="/delivery/dashboard"
                className="hidden sm:flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Portal</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Central</span>
              </Link>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 text-sm">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-semibold text-slate-900 truncate">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'Not signed in'}</p>
                  </div>

                  <Link
                    href="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    My Orders
                  </Link>

                  {user?.role === 'PHARMACY_OWNER' && (
                    <Link
                      href="/pharmacy/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-emerald-700 font-medium hover:bg-emerald-50 rounded-lg"
                    >
                      Pharmacy Dashboard
                    </Link>
                  )}

                  {user?.role === 'DELIVERY_PARTNER' && (
                    <Link
                      href="/delivery/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-blue-700 font-medium hover:bg-blue-50 rounded-lg"
                    >
                      Delivery Partner Portal
                    </Link>
                  )}

                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-purple-700 font-medium hover:bg-purple-50 rounded-lg"
                    >
                      Admin Central
                    </Link>
                  )}

                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-lg"
                    >
                      Sign In / Register
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link
            href="/medicines"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Browse Medicines
          </Link>
          <Link
            href="/pharmacies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Nearby Pharmacies Map
          </Link>
          <Link
            href="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-emerald-700 font-semibold bg-emerald-50"
          >
            MediReach AI Health Assistant
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            My Orders
          </Link>
        </div>
      )}
    </header>
  );
}

