import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PHARMACY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pharmacy = await prisma.pharmacy.findFirst({
      where: { ownerId: user.id },
    });

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found for this account' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, expiring30, expiring60, expiring90, expired, lowStock
    const search = searchParams.get('search') || '';

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const date30 = new Date(now.getTime() + 30 * dayMs);
    const date60 = new Date(now.getTime() + 60 * dayMs);
    const date90 = new Date(now.getTime() + 90 * dayMs);

    let whereClause: any = {
      pharmacyId: pharmacy.id,
      ...(search
        ? {
            OR: [
              { medicine: { name: { contains: search } } },
              { medicine: { genericName: { contains: search } } },
              { batchNumber: { contains: search } },
            ],
          }
        : {}),
    };

    if (filter === 'expiring30') {
      whereClause.expiryDate = { gte: now, lte: date30 };
      whereClause.isFlaggedExpired = false;
    } else if (filter === 'expiring60') {
      whereClause.expiryDate = { gte: now, lte: date60 };
      whereClause.isFlaggedExpired = false;
    } else if (filter === 'expiring90') {
      whereClause.expiryDate = { gte: now, lte: date90 };
      whereClause.isFlaggedExpired = false;
    } else if (filter === 'expired') {
      whereClause.OR = [
        { isFlaggedExpired: true },
        { expiryDate: { lt: now } },
      ];
    } else if (filter === 'lowStock') {
      whereClause.quantity = { lte: 10 };
      whereClause.isFlaggedExpired = false;
    }

    const batches = await prisma.inventoryBatch.findMany({
      where: whereClause,
      include: {
        medicine: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    // Compute summary stats for badges
    const totalBatches = await prisma.inventoryBatch.count({ where: { pharmacyId: pharmacy.id } });
    const count30 = await prisma.inventoryBatch.count({
      where: { pharmacyId: pharmacy.id, expiryDate: { gte: now, lte: date30 }, isFlaggedExpired: false },
    });
    const count60 = await prisma.inventoryBatch.count({
      where: { pharmacyId: pharmacy.id, expiryDate: { gte: now, lte: date60 }, isFlaggedExpired: false },
    });
    const count90 = await prisma.inventoryBatch.count({
      where: { pharmacyId: pharmacy.id, expiryDate: { gte: now, lte: date90 }, isFlaggedExpired: false },
    });
    const countExpired = await prisma.inventoryBatch.count({
      where: {
        pharmacyId: pharmacy.id,
        OR: [{ isFlaggedExpired: true }, { expiryDate: { lt: now } }],
      },
    });
    const countLowStock = await prisma.inventoryBatch.count({
      where: { pharmacyId: pharmacy.id, quantity: { lte: 10 }, isFlaggedExpired: false },
    });

    return NextResponse.json({
      pharmacy,
      batches,
      stats: {
        totalBatches,
        count30,
        count60,
        count90,
        countExpired,
        countLowStock,
      },
    });
  } catch (error) {
    console.error('Inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const {
      medicineId,
      batchNumber,
      quantity,
      mfgDate,
      expiryDate,
      mrp,
      salePrice,
    } = await req.json();

    if (!medicineId || !batchNumber || quantity === undefined || !mfgDate || !expiryDate || !mrp || !salePrice) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const expDate = new Date(expiryDate);
    const isExpired = expDate < new Date();

    const newBatch = await prisma.inventoryBatch.create({
      data: {
        pharmacyId: pharmacy.id,
        medicineId,
        batchNumber,
        quantity: parseInt(quantity),
        mfgDate: new Date(mfgDate),
        expiryDate: expDate,
        mrp: parseFloat(mrp),
        salePrice: parseFloat(salePrice),
        isFlaggedExpired: isExpired,
      },
      include: {
        medicine: true,
      },
    });

    return NextResponse.json({ success: true, batch: newBatch });
  } catch (error) {
    console.error('Create batch error:', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PHARMACY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, quantity, mrp, salePrice, expiryDate, isFlaggedExpired } = await req.json();

    const updated = await prisma.inventoryBatch.update({
      where: { id },
      data: {
        ...(quantity !== undefined ? { quantity: parseInt(quantity) } : {}),
        ...(mrp !== undefined ? { mrp: parseFloat(mrp) } : {}),
        ...(salePrice !== undefined ? { salePrice: parseFloat(salePrice) } : {}),
        ...(expiryDate ? { expiryDate: new Date(expiryDate) } : {}),
        ...(isFlaggedExpired !== undefined ? { isFlaggedExpired: Boolean(isFlaggedExpired) } : {}),
      },
    });

    return NextResponse.json({ success: true, batch: updated });
  } catch (error) {
    console.error('Update batch error:', error);
    return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PHARMACY_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    await prisma.inventoryBatch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete batch error:', error);
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
  }
}

