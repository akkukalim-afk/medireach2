'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Lock, Mail, User, Phone, Zap, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, quickSwitch } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CUSTOMER');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (isRegister) {
      const res = await register({ name, email, password, role, phone });
      if (res.success) {
        router.push(role === 'PHARMACY_OWNER' ? '/pharmacy/dashboard' : '/');
      } else {
        setError(res.error || 'Failed to register');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Failed to sign in');
      }
    }

    setSubmitting(false);
  };

  const handleQuickPersona = async (demoEmail: string, destination: string) => {
    setSubmitting(true);
    const success = await quickSwitch(demoEmail);
    if (success) {
      router.push(destination);
    } else {
      setError('Failed to switch persona.');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-black shadow-md shadow-emerald-600/20">
          ✚
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? 'Join MediReach' : 'Welcome to MediReach'}
        </h1>
        <p className="text-xs text-slate-500">
          Hyperlocal medicine delivery platform for Yelahanka, Bengaluru
        </p>
      </div>

      {/* 1-Click Demo Evaluation Personas */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>1-Click Test Personas</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">Instant Evaluation</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickPersona('customer@medireach.in', '/')}
            className="bg-white border border-emerald-200 hover:border-emerald-500 p-2.5 rounded-xl font-bold text-slate-800 text-left transition shadow-2xs hover:bg-emerald-50/50 cursor-pointer"
          >
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Customer</div>
            <div>Rahul Sharma</div>
          </button>

          <button
            onClick={() => handleQuickPersona('apollo@medireach.in', '/pharmacy/dashboard')}
            className="bg-white border border-emerald-200 hover:border-emerald-500 p-2.5 rounded-xl font-bold text-slate-800 text-left transition shadow-2xs hover:bg-emerald-50/50 cursor-pointer"
          >
            <div className="text-[10px] text-emerald-600 font-semibold uppercase">Pharmacy</div>
            <div>Apollo Owner</div>
          </button>

          <button
            onClick={() => handleQuickPersona('delivery@medireach.in', '/delivery/dashboard')}
            className="bg-white border border-emerald-200 hover:border-emerald-500 p-2.5 rounded-xl font-bold text-slate-800 text-left transition shadow-2xs hover:bg-emerald-50/50 cursor-pointer"
          >
            <div className="text-[10px] text-blue-600 font-semibold uppercase">Delivery</div>
            <div>Kiran (Rider)</div>
          </button>

          <button
            onClick={() => handleQuickPersona('admin@medireach.in', '/admin/dashboard')}
            className="bg-white border border-emerald-200 hover:border-emerald-500 p-2.5 rounded-xl font-bold text-slate-800 text-left transition shadow-2xs hover:bg-emerald-50/50 cursor-pointer"
          >
            <div className="text-[10px] text-purple-600 font-semibold uppercase">Admin</div>
            <div>Administrator</div>
          </button>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number (+91)</label>
                <input
                  type="text"
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                >
                  <option value="CUSTOMER">Customer (Order Medicines)</option>
                  <option value="PHARMACY_OWNER">Pharmacy Store Owner</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner (Rider)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition shadow-xs text-xs mt-2 cursor-pointer"
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

