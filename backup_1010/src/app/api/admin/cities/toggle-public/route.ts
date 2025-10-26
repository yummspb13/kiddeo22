import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cityId, isPublic } = await request.json();

    if (!cityId || typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'cityId and isPublic are required' },
        { status: 400 }
      );
    }

    const updatedCity = await prisma.city.update({
      where: { id: parseInt(cityId) },
      data: { isPublic }
    });

    return NextResponse.json({
      success: true,
      city: updatedCity
    });
  } catch (error) {
    console.error('Error toggling city public status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle city status', details: error },
      { status: 500 }
    );
  }
}
