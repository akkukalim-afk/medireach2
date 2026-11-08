'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  medicineId: string;
  name: string;
  genericName: string;
  brand: string;
  price: number;
  quantity: number;
  requiresPrescription: boolean;
  image?: string | null;
  pharmacyId?: string;
  pharmacyName?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (medicineId: string) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  requiresPrescription: boolean;
  selectedPharmacyId: string | null;
  setSelectedPharmacyId: (id: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('medireach_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedPharmacy = localStorage.getItem('medireach_pharmacy_id');
      if (savedPharmacy) {
        setSelectedPharmacyId(savedPharmacy);
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('medireach_cart', JSON.stringify(items));
      if (selectedPharmacyId) {
        localStorage.setItem('medireach_pharmacy_id', selectedPharmacyId);
      }
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items, selectedPharmacyId]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.medicineId === item.medicineId);
      if (existing) {
        return prev.map((i) =>
          i.medicineId === item.medicineId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });

    if (item.pharmacyId && !selectedPharmacyId) {
      setSelectedPharmacyId(item.pharmacyId);
    }
  };

  const removeItem = (medicineId: string) => {
    setItems((prev) => prev.filter((i) => i.medicineId !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(medicineId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.medicineId === medicineId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setSelectedPharmacyId(null);
    localStorage.removeItem('medireach_cart');
    localStorage.removeItem('medireach_pharmacy_id');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const requiresPrescription = items.some((item) => item.requiresPrescription);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        requiresPrescription,
        selectedPharmacyId,
        setSelectedPharmacyId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

