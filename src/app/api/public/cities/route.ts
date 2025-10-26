import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.city.findMany({
      where: {
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isPublic: true
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching public cities:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch cities',
      cities: [] 
    }, { status: 500 });
  }
}

