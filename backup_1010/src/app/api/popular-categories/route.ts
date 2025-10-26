import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить популярные категории для города
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('citySlug');

    if (!citySlug) {
      return NextResponse.json(
        { error: 'citySlug parameter is required' },
        { status: 400 }
      );
    }

    // Находим город по slug
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true, name: true, slug: true }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Получаем популярные категории для города
    const categories = await prisma.popularCategory.findMany({
      where: {
        cityId: city.id,
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      city,
      categories
    });
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular categories' },
      { status: 500 }
    );
  }
}
