import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findFallbackPharmacies } from '@/services/fallbackEngine';

export async function POST(req: Request) {
  try {
    const { items, pharmacyId, customerLat = 13.1000, customerLng = 77.5950 } = await req.json();

    if (!items || !items.length) {
      return NextResponse.json({ isAvailable: true, fallbackPharmacies: [] });
    }

    const now = new Date();
    const missingItems: any[] = [];

    if (pharmacyId) {
      for (const item of items) {
        const batches = await prisma.inventoryBatch.findMany({
          where: {
            pharmacyId,
            medicineId: item.medicineId,
            isFlaggedExpired: false,
            expiryDate: { gt: now },
          },
        });

        const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalAvailable < item.quantity) {
          const med = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
          missingItems.push({
            medicineId: item.medicineId,
            name: med?.name || 'Medicine',
            requestedQty: item.quantity,
            availableQty: totalAvailable,
          });
        }
      }
    }

    let fallbackPharmacies: any[] = [];
    if (missingItems.length > 0) {
      // Trigger A: Store has insufficient/zero stock for cart items!
      fallbackPharmacies = await findFallbackPharmacies({
        customerLat,
        customerLng,
        items: items.map((i: any) => ({ medicineId: i.medicineId, quantity: i.quantity })),
        excludePharmacyId: pharmacyId,
        maxRadiusKm: 6.0,
        maxResults: 3,
      });
    }

    return NextResponse.json({
      isAvailable: missingItems.length === 0,
      missingItems,
      fallbackPharmacies,
    });
  } catch (error) {
    console.error('Cart availability error:', error);
    return NextResponse.json({ isAvailable: true, fallbackPharmacies: [] });
  }
}

