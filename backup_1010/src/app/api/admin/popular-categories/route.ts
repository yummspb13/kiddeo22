import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - получить все популярные категории для города
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId');
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where = cityId ? { cityId: parseInt(cityId) } : {};
    
    const categories = await prisma.popularCategory.findMany({
      where,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { cityId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular categories' },
      { status: 500 }
    );
  }
}

// POST - создать новую популярную категорию
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, color, cityId, sortOrder = 0 } = body;

    if (!name || !cityId) {
      return NextResponse.json(
        { error: 'Name and cityId are required' },
        { status: 400 }
      );
    }

    // Проверяем, что город существует
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    const category = await prisma.popularCategory.create({
      data: {
        name,
        description,
        icon,
        color,
        cityId: parseInt(cityId),
        sortOrder: parseInt(sortOrder)
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating popular category:', error);
    return NextResponse.json(
      { error: 'Failed to create popular category' },
      { status: 500 }
    );
  }
}
