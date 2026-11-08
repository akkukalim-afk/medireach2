import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { PrescriptionStatus, OrderStatus } from '@prisma/client';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PHARMACY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pharmacy = await prisma.pharmacy.findFirst({
      where: { ownerId: user.id },
    });

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        order: {
          pharmacyId: pharmacy.id,
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        },
        verifiedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PHARMACY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prescriptionId, action, notes } = await req.json(); // action: 'APPROVE' | 'REJECT'

    if (!prescriptionId || !action) {
      return NextResponse.json({ error: 'Prescription ID and action are required' }, { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { order: true, customer: true },
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const newStatus = action === 'APPROVE' ? PrescriptionStatus.APPROVED : PrescriptionStatus.REJECTED;

    const updated = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: newStatus,
        verifiedById: user.id,
        pharmacistNotes: notes || (action === 'APPROVE' ? 'Prescription verified by pharmacist.' : 'Prescription rejected due to illegibility or invalid doctor details.'),
        verifiedAt: new Date(),
      },
    });

    // Update associated order
    if (prescription.orderId) {
      if (action === 'APPROVE') {
        await prisma.order.update({
          where: { id: prescription.orderId },
          data: {
            status: OrderStatus.ACCEPTED,
            statusHistory: {
              create: {
                status: OrderStatus.ACCEPTED,
                notes: `Prescription approved by pharmacist (${user.name}). Order moving to preparation.`,
              },
            },
          },
        });

        await prisma.notification.create({
          data: {
            userId: prescription.customerId,
            title: 'Prescription Approved',
            message: `Your prescription for order #${prescription.order?.orderNumber} was verified and approved!`,
            type: 'SUCCESS',
            link: `/orders/${prescription.orderId}`,
          },
        });
      } else {
        await prisma.order.update({
          where: { id: prescription.orderId },
          data: {
            status: OrderStatus.CANCELLED,
            statusHistory: {
              create: {
                status: OrderStatus.CANCELLED,
                notes: `Prescription rejected: ${notes || 'Unable to verify prescription'}. Order cancelled.`,
              },
            },
          },
        });

        await prisma.notification.create({
          data: {
            userId: prescription.customerId,
            title: 'Prescription Verification Issue',
            message: `Your prescription for order #${prescription.order?.orderNumber} was rejected: ${notes || 'Please re-upload a clear prescription'}.`,
            type: 'WARNING',
            link: `/orders/${prescription.orderId}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, prescription: updated });
  } catch (error) {
    console.error('Verify prescription error:', error);
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
  }
}

