'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Search,
  Building2,
  FileText,
  TrendingDown,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function PharmacyDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'expiry' | 'orders' | 'prescriptions'>('inventory');
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Orders & Prescriptions state
  const [orders, setOrders] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  // Modals state
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  // New batch form state
  const [medicinesList, setMedicinesList] = useState<any[]>([]);
  const [newBatch, setNewBatch] = useState({
    medicineId: '',
    batchNumber: '',
    quantity: 20,
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    mrp: 100,
    salePrice: 85,
  });

  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/pharmacy/inventory?filter=${filter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setInventoryData(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersAndRx = async () => {
    try {
      const [ordRes, rxRes, medRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/pharmacy/prescriptions'),
        fetch('/api/medicines'),
      ]);
      const ordData = await ordRes.json();
      const rxData = await rxRes.json();
      const medData = await medRes.json();

      setOrders(ordData.orders || []);
      setPrescriptions(rxData.prescriptions || []);
      setMedicinesList(medData.medicines || []);
    } catch (err) {
      console.error('Failed to load portal data', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter, search]);

  useEffect(() => {
    fetchOrdersAndRx();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch),
      });
      if (res.ok) {
        setShowAddBatchModal(false);
        fetchInventory();
      }
    } catch (err) {
      console.error('Failed to add batch', err);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to remove this batch?')) return;
    try {
      const res = await fetch(`/api/pharmacy/inventory?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchInventory();
    } catch (err) {
      console.error('Failed to delete batch', err);
    }
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) return;
    try {
      setCsvStatus('Importing batches...');
      const res = await fetch('/api/pharmacy/inventory/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCsvStatus(`Successfully imported ${data.importedCount} batches!`);
        setTimeout(() => {
          setShowCsvModal(false);
          setCsvStatus(null);
          setCsvText('');
          fetchInventory();
        }, 1500);
      } else {
        setCsvStatus(`Import failed: ${data.error || 'Check CSV format'}`);
      }
    } catch (err: any) {
      setCsvStatus(`Error: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOrdersAndRx();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handlePrescriptionAction = async (prescriptionId: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
    try {
      const res = await fetch('/api/pharmacy/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, action, notes }),
      });
      if (res.ok) fetchOrdersAndRx();
    } catch (err) {
      console.error('Failed to review prescription', err);
    }
  };

  const stats = inventoryData?.stats || {
    totalBatches: 0,
    count30: 0,
    count60: 0,
    count90: 0,
    countExpired: 0,
    countLowStock: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Portal Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PHARMACY OWNER PORTAL
            </span>
            <span className="text-xs text-slate-400">Yelahanka Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {inventoryData?.pharmacy?.name || 'Apollo Pharmacy – Yelahanka New Town'}
          </h1>
          <p className="text-xs text-slate-500">
            License: {inventoryData?.pharmacy?.licenseNumber || 'KA-BGL-2023-AP8812'} • Rating: ★{' '}
            {inventoryData?.pharmacy?.rating || '4.8'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setShowAddBatchModal(true)}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch</span>
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>CSV Import</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Objective 7: Expiry Monitoring & Low Stock) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => {
            setActiveTab('inventory');
            setFilter('all');
          }}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-500 transition cursor-pointer"
        >
          <div className="text-xs font-semibold text-slate-500">Active Batches</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalBatches}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Total catalog in stock</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('expiry');
            setFilter('expiring30');
          }}
          className="bg-red-50/70 rounded-2xl p-4 border border-red-200 shadow-xs hover:border-red-400 transition cursor-pointer"
        >
          <div className="text-xs font-bold text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>&lt; 30 Days Expiry</span>
          </div>
          <div className="text-2xl font-black text-red-900 mt-1">{stats.count30}</div>
          <span className="text-[10px] text-red-700 font-semibold">Critical clearance needed</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('expiry');
            setFilter('expiring60');
          }}
          className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-xs hover:border-amber-400 transition cursor-pointer"
        >
          <div className="text-xs font-bold text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>&lt; 60 Days Expiry</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.count60}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Expiring in 2 months</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('expiry');
            setFilter('expired');
          }}
          className="bg-slate-100 rounded-2xl p-4 border border-slate-300 shadow-xs hover:border-slate-400 transition cursor-pointer"
        >
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Auto-Flagged Expired</span>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.countExpired}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Hidden from customers</span>
        </div>

        <div
          onClick={() => {
            setActiveTab('inventory');
            setFilter('lowStock');
          }}
          className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200 shadow-xs hover:border-orange-400 transition cursor-pointer"
        >
          <div className="text-xs font-bold text-orange-800 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Low Stock (≤10)</span>
          </div>
          <div className="text-2xl font-black text-orange-900 mt-1">{stats.countLowStock}</div>
          <span className="text-[10px] text-orange-700 font-semibold">Reorder recommended</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Inventory Management</span>
        </button>

        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'expiry'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Expiry-Date Monitoring</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Incoming Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'prescriptions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescription Verification Queue ({prescriptions.filter((p) => p.status === 'PENDING').length})</span>
        </button>
      </div>

      {/* TAB 1 & 2: INVENTORY & EXPIRY MONITORING */}
      {(activeTab === 'inventory' || activeTab === 'expiry') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search batches, medicines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'expiring30', label: '< 30 Days' },
                { id: 'expiring60', label: '< 60 Days' },
                { id: 'expiring90', label: '< 90 Days' },
                { id: 'expired', label: 'Expired' },
                { id: 'lowStock', label: 'Low Stock' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    filter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Batches Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-3">Batch Number</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">MRP / Sale Price</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {inventoryData?.batches?.map((b: any) => {
                  const exp = new Date(b.expiryDate);
                  const daysToExpiry = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.medicine.name}</div>
                        <div className="text-[11px] text-slate-400">{b.medicine.packSize}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">{b.batchNumber}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-bold ${
                            b.quantity <= 10 ? 'text-red-600' : 'text-slate-800'
                          }`}
                        >
                          {b.quantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div>{exp.toLocaleDateString()}</div>
                        <span className="text-[10px] text-slate-400">
                          {daysToExpiry < 0 ? `${Math.abs(daysToExpiry)} days ago` : `in ${daysToExpiry} days`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {b.isFlaggedExpired || daysToExpiry < 0 ? (
                          <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            EXPIRED (HIDDEN)
                          </span>
                        ) : daysToExpiry <= 30 ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            EXPIRING &lt; 30d
                          </span>
                        ) : daysToExpiry <= 60 ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            EXPIRING &lt; 60d
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="line-through text-slate-400 mr-1.5">{formatPrice(b.mrp)}</span>
                        <strong className="text-slate-900">{formatPrice(b.salePrice)}</strong>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteBatch(b.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INCOMING ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-extrabold text-slate-900 text-base">Incoming Delivery Orders</h2>

          <div className="space-y-4">
            {orders.map((ord: any) => (
              <div
                key={ord.id}
                className="border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-emerald-500 transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">#{ord.orderNumber}</span>
                    <p className="text-xs text-slate-500">
                      Customer: {ord.customer?.name || 'Rahul Sharma'} ({ord.customerPhone})
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.isDelayed
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-600">
                    <strong>Medicines:</strong> {ord.items?.map((i: any) => `${i.medicine.name} (x${i.quantity})`).join(', ')}
                  </div>
                  <div className="text-slate-500">
                    <strong>Address:</strong> {ord.deliveryAddress}
                  </div>
                  <div className="text-slate-700 font-extrabold">
                    Net Amount: {formatPrice(ord.netAmount)}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {ord.status === 'PLACED' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                      className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700"
                    >
                      Accept Order
                    </button>
                  )}
                  {(ord.status === 'ACCEPTED' || ord.status === 'PLACED') && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                      className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700"
                    >
                      Mark as Preparing
                    </button>
                  )}
                  {ord.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'OUT_FOR_DELIVERY')}
                      className="bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-800"
                    >
                      Handover to Rider (Dispatch)
                    </button>
                  )}
                  <Link
                    href={`/orders/${ord.id}`}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    View Live Tracker →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRESCRIPTION VERIFICATION QUEUE (Objective 4) */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Pharmacist Prescription Queue</h2>
              <p className="text-xs text-slate-500">
                Mandatory visual verification of doctor prescriptions before order release
              </p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {prescriptions.filter((p) => p.status === 'PENDING').length} Pending Review
            </span>
          </div>

          <div className="space-y-4">
            {prescriptions.map((rx: any) => (
              <div
                key={rx.id}
                className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-emerald-500 transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Prescription for Order #{rx.order?.orderNumber || 'Pending'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Patient: {rx.customer.name} ({rx.customer.phone || rx.customer.email})
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      rx.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rx.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* File preview */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Uploaded Document:</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rx.fileType}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{rx.fileName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Dr. Anand Sharma, MBBS, MD (General Medicine) • KMC Reg #KA-2018-88219
                    </p>
                  </div>

                  {/* Prescribed Items in Order */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                    <span className="font-bold text-slate-700">Rx Required Medicines in this Order:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
                      {rx.order?.items?.map((i: any) => (
                        <li key={i.id}>
                          <strong>{i.medicine.name}</strong> ({i.medicine.strength}) - Qty: {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Pharmacist Actions */}
                {rx.status === 'PENDING' ? (
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => handlePrescriptionAction(rx.id, 'APPROVE')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Prescription & Advance Order</span>
                    </button>

                    <button
                      onClick={() => {
                        const reason = prompt('Please provide rejection reason (e.g., Illegible handwriting, expired prescription):');
                        if (reason) handlePrescriptionAction(rx.id, 'REJECT', reason);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject with Reason</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Verified on {new Date(rx.verifiedAt || Date.now()).toLocaleString()}: &quot;
                    {rx.pharmacistNotes || 'Verified by pharmacist'}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD BATCH */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-900 text-lg">Add New Inventory Batch</h3>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Medicine</label>
                <select
                  required
                  value={newBatch.medicineId}
                  onChange={(e) => setNewBatch({ ...newBatch, medicineId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="">-- Choose Medicine --</option>
                  {medicinesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.packSize})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BT-APL-2026-99"
                  value={newBatch.batchNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBatch.mrp}
                    onChange={(e) => setNewBatch({ ...newBatch, mrp: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBatch.salePrice}
                    onChange={(e) => setNewBatch({ ...newBatch, salePrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CSV BULK IMPORT (Objective 6) */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-black text-slate-900 text-lg">Bulk Inventory CSV Import</h3>
            <p className="text-xs text-slate-500">
              Format: <code>Medicine Name,Batch Number,Quantity,Mfg Date,Expiry Date,MRP,Sale Price</code>
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Dolo 650 Tablet,BT-CSV-01,50,2026-01-01,2027-06-30,34,30
Combiflam Tablet,BT-CSV-02,30,2026-02-01,2027-08-30,45,39"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            {csvStatus && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">
                {csvStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleCsvImport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs"
              >
                Import CSV Batches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

