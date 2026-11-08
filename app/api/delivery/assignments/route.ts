import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'DELIVERY_PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignments = await prisma.deliveryAssignment.findMany({
      where: { partnerId: user.id },
      include: {
        order: {
          include: {
            pharmacy: true,
            customer: {
              select: { name: true, phone: true },
            },
            items: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Delivery fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'DELIVERY_PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId, action } = await req.json(); // action: 'PICK_UP' | 'DELIVER'

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
      include: { order: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (action === 'PICK_UP') {
      await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { status: DeliveryStatus.PICKED_UP, pickedUpAt: new Date() },
      });

      await prisma.order.update({
        where: { id: assignment.orderId },
        data: {
          status: OrderStatus.OUT_FOR_DELIVERY,
          statusHistory: {
            create: {
              status: OrderStatus.OUT_FOR_DELIVERY,
              notes: `Order picked up by rider ${user.name} and is on the way.`,
            },
          },
        },
      });
    } else if (action === 'DELIVER') {
      await prisma.deliveryAssignment.update({
        where: { id: assignmentId },
        data: { status: DeliveryStatus.DELIVERED, deliveredAt: new Date() },
      });

      await prisma.order.update({
        where: { id: assignment.orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
          isDelayed: false,
          statusHistory: {
            create: {
              status: OrderStatus.DELIVERED,
              notes: `Order safely handed over to customer by ${user.name}.`,
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update delivery error:', error);
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 });
  }
}

