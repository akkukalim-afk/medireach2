import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isOrderDelayed, findFallbackPharmacies } from '@/services/fallbackEngine';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        pharmacy: true,
        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
        prescription: {
          include: {
            verifiedBy: {
              select: { name: true, email: true },
            },
          },
        },
        deliveryAssignment: {
          include: {
            partner: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order is delayed past threshold
    const delayed = order.isDelayed || isOrderDelayed(order, 10);

    let fallbackPharmacies: any[] = [];
    if (delayed || order.fallbackOffered) {
      const itemsList = order.items.map((i) => ({
        medicineId: i.medicineId,
        medicineName: i.medicine.name,
        quantity: i.quantity,
      }));

      fallbackPharmacies = await findFallbackPharmacies({
        customerLat: order.customerLat || 13.1000,
        customerLng: order.customerLng || 77.5950,
        items: itemsList,
        excludePharmacyId: order.pharmacyId,
        maxRadiusKm: 6.0,
        maxResults: 4,
      });
    }

    return NextResponse.json({
      order: {
        ...order,
        isDelayed: delayed,
      },
      fallbackPharmacies,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

