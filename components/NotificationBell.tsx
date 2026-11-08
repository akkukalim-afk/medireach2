'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Zap, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllRead();
          }
        }}
        className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 text-xs space-y-2 animate-scale-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <span className="font-extrabold text-slate-900">Notifications & Alerts</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-emerald-600 font-semibold hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-1" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || '/orders'}
                  onClick={() => setIsOpen(false)}
                  className={`block p-2.5 rounded-xl border transition ${
                    n.type === 'FALLBACK'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : n.type === 'SUCCESS'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {n.type === 'FALLBACK' ? (
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-current shrink-0 mt-0.5" />
                    ) : n.type === 'SUCCESS' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs">{n.title}</div>
                      <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                      <span className="text-[9px] text-slate-400 block pt-0.5">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

