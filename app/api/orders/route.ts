import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { OrderStatus, DeliveryStatus, PrescriptionStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereClause: any = {};
    if (user.role === 'CUSTOMER') {
      whereClause = { customerId: user.id };
    } else if (user.role === 'PHARMACY_OWNER') {
      const pharmacy = await prisma.pharmacy.findFirst({
        where: { ownerId: user.id },
      });
      if (pharmacy) {
        whereClause = { pharmacyId: pharmacy.id };
      }
    } else if (user.role === 'DELIVERY_PARTNER') {
      whereClause = {
        deliveryAssignment: {
          partnerId: user.id,
        },
      };
    }
    // ADMIN sees all orders

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        pharmacy: true,
        items: {
          include: {
            medicine: true,
          },
        },
        prescription: true,
        deliveryAssignment: {
          include: {
            partner: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        statusHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { placedAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 });
    }

    const {
      pharmacyId,
      items,
      deliveryAddress,
      customerPhone,
      customerLat = 13.1000,
      customerLng = 77.5950,
      prescriptionFile, // optional: base64 or file URL
    } = await req.json();

    if (!pharmacyId || !items || !items.length || !deliveryAddress || !customerPhone) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
    }

    // Verify stock availability at selected pharmacy
    const now = new Date();
    let totalAmount = 0;
    const orderItemsData: any[] = [];
    let requiresRx = false;

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        return NextResponse.json({ error: `Medicine not found: ${item.medicineId}` }, { status: 400 });
      }

      if (medicine.requiresPrescription) {
        requiresRx = true;
      }

      // Find available batch at this pharmacy
      const batch = await prisma.inventoryBatch.findFirst({
        where: {
          pharmacyId,
          medicineId: medicine.id,
          isFlaggedExpired: false,
          expiryDate: { gt: now },
          quantity: { gte: item.quantity },
        },
      });

      const unitPrice = batch ? batch.salePrice : 50;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        medicineId: medicine.id,
        batchId: batch?.id,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });

      // Deduct batch quantity if batch exists
      if (batch) {
        await prisma.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    // If Rx is required but no prescription file is provided, prompt user
    if (requiresRx && !prescriptionFile) {
      return NextResponse.json(
        { error: 'One or more items in your cart require a valid prescription. Please upload a prescription.' },
        { status: 400 }
      );
    }

    const deliveryFee = totalAmount > 500 ? 0 : 30;
    const discountAmount = totalAmount > 800 ? 50 : 0;
    const netAmount = totalAmount - discountAmount + deliveryFee;

    const orderNumber = `MR-YEL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // ETA is prep time + 20 mins delivery window
    const promisedEta = new Date(Date.now() + (pharmacy.prepTimeMinutes + 20) * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: user.id,
        pharmacyId,
        totalAmount,
        discountAmount,
        deliveryFee,
        netAmount,
        deliveryAddress,
        customerPhone,
        customerLat,
        customerLng,
        status: OrderStatus.PLACED,
        promisedEta,
        items: {
          create: orderItemsData,
        },
        statusHistory: {
          create: {
            status: OrderStatus.PLACED,
            notes: 'Order placed successfully by customer',
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Handle Prescription upload if provided
    if (prescriptionFile) {
      await prisma.prescription.create({
        data: {
          customerId: user.id,
          orderId: order.id,
          fileUrl: prescriptionFile.fileUrl || '/uploads/sample_prescription.jpg',
          fileName: prescriptionFile.fileName || 'Prescription_Upload.pdf',
          fileType: prescriptionFile.fileType || 'image/jpeg',
          status: PrescriptionStatus.PENDING,
        },
      });
    }

    // Automatically assign available delivery partner
    const deliveryPartner = await prisma.user.findFirst({
      where: { role: 'DELIVERY_PARTNER' },
    });

    if (deliveryPartner) {
      await prisma.deliveryAssignment.create({
        data: {
          orderId: order.id,
          partnerId: deliveryPartner.id,
          status: DeliveryStatus.ASSIGNED,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

