import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { haversineDistanceKm, calculateEtaMinutes } from '@/services/fallbackEngine';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const customerLat = parseFloat(searchParams.get('lat') || '13.1000');
    const customerLng = parseFloat(searchParams.get('lng') || '77.5950');

    const now = new Date();

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        batches: {
          where: {
            isFlaggedExpired: false,
            expiryDate: { gt: now },
            pharmacy: {
              isApproved: true,
              isOpen: true,
            },
          },
          include: {
            pharmacy: true,
          },
        },
      },
    });

    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    // Group batches by pharmacy
    const pharmacyBatchesMap = new Map<string, {
      pharmacy: any;
      batches: any[];
      totalQuantity: number;
      bestPrice: number;
      distanceKm: number;
      etaMinutes: number;
    }>();

    for (const batch of medicine.batches) {
      const p = batch.pharmacy;
      const dist = haversineDistanceKm(customerLat, customerLng, p.lat, p.lng);
      const eta = calculateEtaMinutes(dist, p.prepTimeMinutes);

      if (!pharmacyBatchesMap.has(p.id)) {
        pharmacyBatchesMap.set(p.id, {
          pharmacy: p,
          batches: [batch],
          totalQuantity: batch.quantity,
          bestPrice: batch.salePrice,
          distanceKm: dist,
          etaMinutes: eta,
        });
      } else {
        const item = pharmacyBatchesMap.get(p.id)!;
        item.batches.push(batch);
        item.totalQuantity += batch.quantity;
        if (batch.salePrice < item.bestPrice) item.bestPrice = batch.salePrice;
      }
    }

    const availableStores = Array.from(pharmacyBatchesMap.values()).sort(
      (a, b) => a.distanceKm - b.distanceKm
    );

    // Find generic alternatives (same genericName or same category)
    const genericAlternatives = await prisma.medicine.findMany({
      where: {
        id: { not: medicine.id },
        OR: [
          { genericName: medicine.genericName },
          { category: medicine.category },
        ],
      },
      take: 4,
    });

    return NextResponse.json({
      medicine,
      availableStores,
      genericAlternatives,
    });
  } catch (error) {
    console.error('Medicine detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch medicine detail' }, { status: 500 });
  }
}

