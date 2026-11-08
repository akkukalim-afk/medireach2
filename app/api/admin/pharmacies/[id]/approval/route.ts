import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isApproved, isOpen } = await req.json();

    const updated = await prisma.pharmacy.update({
      where: { id },
      data: {
        ...(isApproved !== undefined ? { isApproved: Boolean(isApproved) } : {}),
        ...(isOpen !== undefined ? { isOpen: Boolean(isOpen) } : {}),
      },
    });

    return NextResponse.json({ success: true, pharmacy: updated });
  } catch (error) {
    console.error('Pharmacy approval error:', error);
    return NextResponse.json({ error: 'Failed to update pharmacy approval' }, { status: 500 });
  }
}

