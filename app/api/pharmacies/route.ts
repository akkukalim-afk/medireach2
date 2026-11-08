import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { haversineDistanceKm, calculateEtaMinutes } from '@/services/fallbackEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerLat = parseFloat(searchParams.get('lat') || '13.1000');
    const customerLng = parseFloat(searchParams.get('lng') || '77.5950');

    const pharmacies = await prisma.pharmacy.findMany({
      where: { isApproved: true },
      include: {
        _count: {
          select: { batches: true, orders: true },
        },
      },
    });

    const formatted = pharmacies.map((p) => {
      const distanceKm = haversineDistanceKm(customerLat, customerLng, p.lat, p.lng);
      const etaMinutes = calculateEtaMinutes(distanceKm, p.prepTimeMinutes);

      return {
        id: p.id,
        name: p.name,
        licenseNumber: p.licenseNumber,
        address: p.address,
        landmark: p.landmark,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone,
        rating: p.rating,
        isOpen: p.isOpen,
        prepTimeMinutes: p.prepTimeMinutes,
        distanceKm,
        etaMinutes,
        totalItemsInStock: p._count.batches,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({ pharmacies: formatted });
  } catch (error) {
    console.error('Pharmacies error:', error);
    return NextResponse.json({ error: 'Failed to fetch pharmacies' }, { status: 500 });
  }
}

