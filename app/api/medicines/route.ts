import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { haversineDistanceKm, calculateEtaMinutes } from '@/services/fallbackEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const customerLat = parseFloat(searchParams.get('lat') || '13.1000');
    const customerLng = parseFloat(searchParams.get('lng') || '77.5950');

    const now = new Date();

    const medicines = await prisma.medicine.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query } },
                  { genericName: { contains: query } },
                  { brand: { contains: query } },
                  { description: { contains: query } },
                ],
              }
            : {},
          category && category !== 'ALL'
            ? {
                category: category as any,
              }
            : {},
        ],
      },
      include: {
        batches: {
          where: {
            isFlaggedExpired: false,
            expiryDate: { gt: now },
            quantity: { gt: 0 },
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
      take: 60,
    });

    // Format medicines with real-time availability across nearby stores
    const formatted = medicines.map((med) => {
      // Find all pharmacies stocking this medicine
      const pharmacyMap = new Map<string, {
        pharmacy: any;
        qty: number;
        salePrice: number;
        distanceKm: number;
        etaMinutes: number;
      }>();

      for (const batch of med.batches) {
        const pId = batch.pharmacyId;
        const dist = haversineDistanceKm(customerLat, customerLng, batch.pharmacy.lat, batch.pharmacy.lng);
        const eta = calculateEtaMinutes(dist, batch.pharmacy.prepTimeMinutes);

        if (!pharmacyMap.has(pId)) {
          pharmacyMap.set(pId, {
            pharmacy: batch.pharmacy,
            qty: batch.quantity,
            salePrice: batch.salePrice,
            distanceKm: dist,
            etaMinutes: eta,
          });
        } else {
          const existing = pharmacyMap.get(pId)!;
          existing.qty += batch.quantity;
          if (batch.salePrice < existing.salePrice) existing.salePrice = batch.salePrice;
        }
      }

      const stockingPharmacies = Array.from(pharmacyMap.values()).sort(
        (a, b) => a.distanceKm - b.distanceKm
      );

      const totalStock = stockingPharmacies.reduce((sum, p) => sum + p.qty, 0);
      const minPrice = stockingPharmacies.length > 0
        ? Math.min(...stockingPharmacies.map((p) => p.salePrice))
        : 50;

      let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'OUT_OF_STOCK';
      if (stockingPharmacies.length >= 2 && totalStock > 10) {
        stockStatus = 'IN_STOCK';
      } else if (stockingPharmacies.length > 0 && totalStock > 0) {
        stockStatus = 'LOW_STOCK';
      }

      return {
        id: med.id,
        name: med.name,
        genericName: med.genericName,
        brand: med.brand,
        category: med.category,
        dosageForm: med.dosageForm,
        strength: med.strength,
        packSize: med.packSize,
        manufacturer: med.manufacturer,
        description: med.description,
        requiresPrescription: med.requiresPrescription,
        image: med.image,
        minPrice,
        stockStatus,
        totalStock,
        stockingPharmaciesCount: stockingPharmacies.length,
        nearestPharmacy: stockingPharmacies[0]
          ? {
              id: stockingPharmacies[0].pharmacy.id,
              name: stockingPharmacies[0].pharmacy.name,
              distanceKm: stockingPharmacies[0].distanceKm,
              etaMinutes: stockingPharmacies[0].etaMinutes,
              price: stockingPharmacies[0].salePrice,
            }
          : null,
      };
    });

    return NextResponse.json({ medicines: formatted });
  } catch (error) {
    console.error('Fetch medicines error:', error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

