import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetPharmacyId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        pharmacy: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const targetPharmacy = await prisma.pharmacy.findUnique({
      where: { id: targetPharmacyId },
    });

    if (!targetPharmacy) {
      return NextResponse.json({ error: 'Target pharmacy not found' }, { status: 404 });
    }

    const oldPharmacyName = order.pharmacy.name;
    const newPharmacyName = targetPharmacy.name;

    // Recalculate fresh ETA (prep time + 15 mins)
    const newEta = new Date(Date.now() + (targetPharmacy.prepTimeMinutes + 15) * 60 * 1000);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        originalPharmacyId: order.pharmacyId,
        pharmacyId: targetPharmacyId,
        isDelayed: false,
        status: OrderStatus.ACCEPTED,
        promisedEta: newEta,
        statusHistory: {
          create: {
            status: OrderStatus.ACCEPTED,
            notes: `⚡ Fallback switch: Order rerouted from ${oldPharmacyName} to ${newPharmacyName}. Preparation started.`,
          },
        },
      },
      include: {
        pharmacy: true,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: 'Order Rerouted Successfully',
        message: `Your order #${order.orderNumber} is now being prepared by ${newPharmacyName}. New estimated delivery: ${newEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        type: 'SUCCESS',
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order successfully switched to ${newPharmacyName}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Switch pharmacy error:', error);
    return NextResponse.json({ error: 'Failed to switch pharmacy' }, { status: 500 });
  }
}

