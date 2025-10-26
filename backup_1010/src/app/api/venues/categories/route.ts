import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 VENUES CATEGORIES API: Fetching categories...');
    
    const categories = await prisma.venueCategory.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            backgroundImage: true,
            isActive: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('🔍 VENUES CATEGORIES API: Found categories:', categories.length);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('🔍 VENUES CATEGORIES API: Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}