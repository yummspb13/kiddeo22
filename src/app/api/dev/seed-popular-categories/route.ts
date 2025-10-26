import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем города
    const cities = await prisma.city.findMany({
      select: { id: true, name: true, slug: true }
    });

    if (cities.length === 0) {
      return NextResponse.json(
        { error: 'No cities found. Please seed cities first.' },
        { status: 400 }
      );
    }

    // Создаем популярные категории для каждого города
    const popularCategories = [
      {
        name: 'Театральные представления',
        description: 'Спектакли, мюзиклы, детские постановки',
        icon: '🎭',
        color: '#8B5CF6',
        sortOrder: 1
      },
      {
        name: 'События нашего города',
        description: 'Местные мероприятия и активности',
        icon: '🏛️',
        color: '#3B82F6',
        sortOrder: 2
      },
      {
        name: 'Спортивные мероприятия',
        description: 'Спорт, фитнес, активный отдых',
        icon: '⚽',
        color: '#10B981',
        sortOrder: 3
      },
      {
        name: 'Образовательные события',
        description: 'Мастер-классы, лекции, курсы',
        icon: '📚',
        color: '#F59E0B',
        sortOrder: 4
      },
      {
        name: 'Развлекательные центры',
        description: 'Игровые зоны, аттракционы, развлечения',
        icon: '🎪',
        color: '#EF4444',
        sortOrder: 5
      }
    ];

    const createdCategories = [];

    for (const city of cities) {
      for (const category of popularCategories) {
        try {
          const created = await prisma.popularCategory.create({
            data: {
              ...category,
              cityId: city.id
            }
          });
          createdCategories.push(created);
        } catch (error) {
          // Игнорируем ошибки дублирования
          console.log(`Category ${category.name} already exists for city ${city.name}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdCategories.length} popular categories`,
      categories: createdCategories
    });
  } catch (error) {
    console.error('Error seeding popular categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed popular categories', details: error },
      { status: 500 }
    );
  }
}
