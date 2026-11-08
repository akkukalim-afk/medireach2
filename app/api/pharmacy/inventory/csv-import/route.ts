import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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

    const { csvContent } = await req.json();
    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: 'Invalid CSV content' }, { status: 400 });
    }

    // Parse CSV lines
    // Header format: Medicine Name,Batch Number,Quantity,Mfg Date (YYYY-MM-DD),Expiry Date (YYYY-MM-DD),MRP,Sale Price
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain a header and at least one row' }, { status: 400 });
    }

    const header = lines[0].toLowerCase();
    const rows = lines.slice(1);

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const line = rows[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 7) {
        errors.push(`Row ${i + 2}: Insufficient columns`);
        continue;
      }

      const [medName, batchNo, qtyStr, mfgStr, expStr, mrpStr, saleStr] = cols;

      // Find medicine by partial or exact name
      const med = await prisma.medicine.findFirst({
        where: {
          OR: [
            { name: { contains: medName } },
            { genericName: { contains: medName } },
          ],
        },
      });

      if (!med) {
        errors.push(`Row ${i + 2}: Medicine "${medName}" not found in catalog`);
        continue;
      }

      const qty = parseInt(qtyStr) || 0;
      const mfgDate = new Date(mfgStr);
      const expiryDate = new Date(expStr);
      const mrp = parseFloat(mrpStr) || 100;
      const salePrice = parseFloat(saleStr) || mrp;
      const isExpired = expiryDate < new Date();

      await prisma.inventoryBatch.create({
        data: {
          pharmacyId: pharmacy.id,
          medicineId: med.id,
          batchNumber: batchNo || `CSV-${Date.now()}-${i}`,
          quantity: qty,
          mfgDate: isNaN(mfgDate.getTime()) ? new Date() : mfgDate,
          expiryDate: isNaN(expiryDate.getTime()) ? new Date(Date.now() + 365 * 86400000) : expiryDate,
          mrp,
          salePrice,
          isFlaggedExpired: isExpired,
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: 'Failed to process CSV import' }, { status: 500 });
  }
}

