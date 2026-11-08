import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { OrderStatus, DeliveryStatus } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, notes, triggerDelayDemo } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Special trigger for Demo: immediately force order into delayed fallback state
    if (triggerDelayDemo) {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          isDelayed: true,
          fallbackOffered: true,
          promisedEta: new Date(Date.now() - 15 * 60 * 1000), // set ETA 15m in past
          statusHistory: {
            create: {
              status: order.status,
              notes: 'Delivery delayed due to high store rush. Fallback pharmacies activated.',
            },
          },
        },
      });

      // Create customer notification
      await prisma.notification.create({
        data: {
          userId: order.customerId,
          title: 'Order Delay Alert',
          message: `Your order #${order.orderNumber} is running late. Alternative nearby pharmacies have been located.`,
          type: 'FALLBACK',
          link: `/orders/${order.id}`,
        },
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    const updateData: any = {
      status: status as OrderStatus,
    };

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status: status as OrderStatus,
            notes: notes || `Order status updated to ${status}`,
          },
        },
      },
    });

    // If out for delivery or delivered, update delivery assignment
    if (status === 'OUT_FOR_DELIVERY') {
      await prisma.deliveryAssignment.updateMany({
        where: { orderId: id },
        data: { status: DeliveryStatus.PICKED_UP, pickedUpAt: new Date() },
      });
    } else if (status === 'DELIVERED') {
      await prisma.deliveryAssignment.updateMany({
        where: { orderId: id },
        data: { status: DeliveryStatus.DELIVERED, deliveredAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

