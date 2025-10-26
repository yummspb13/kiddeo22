import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdminOrDevKey } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/venues/tariffs - Get all venues with their tariff information
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey(request.nextUrl.searchParams);

    const venues = await prisma.venuePartner.findMany({
      select: {
        id: true,
        name: true,
        tariff: true,
        tariffExpiresAt: true,
        tariffAutoRenew: true,
        tariffGracePeriodEndsAt: true,
        tariffPrice: true,
        vendor: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json(venues);
  } catch (error) {
    console.error('Error fetching venue tariffs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
