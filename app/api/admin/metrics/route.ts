import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalPharmacies,
      pendingPharmacies,
      totalOrders,
      delayedOrders,
      totalCustomers,
      recentOrders,
      pharmacies,
    ] = await Promise.all([
      prisma.pharmacy.count(),
      prisma.pharmacy.count({ where: { isApproved: false } }),
      prisma.order.count(),
      prisma.order.count({ where: { isDelayed: true, status: { not: 'DELIVERED' } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { placedAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          pharmacy: { select: { name: true } },
        },
      }),
      prisma.pharmacy.findMany({
        include: {
          owner: { select: { name: true, email: true, phone: true } },
          _count: { select: { orders: true, batches: true } },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalPharmacies,
        pendingPharmacies,
        totalOrders,
        delayedOrders,
        totalCustomers,
      },
      recentOrders,
      pharmacies,
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}

