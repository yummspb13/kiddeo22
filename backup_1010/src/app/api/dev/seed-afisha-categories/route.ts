import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Базовые категории для афиши
    const categories = [
      {
        name: 'Театр',
        slug: 'theater',
        description: 'Спектакли, мюзиклы, детские постановки',
        icon: '🎭',
        color: '#8B5CF6',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'Концерты',
        slug: 'concerts',
        description: 'Музыкальные концерты и выступления',
        icon: '🎵',
        color: '#3B82F6',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'Спорт',
        slug: 'sports',
        description: 'Спортивные мероприятия и соревнования',
        icon: '⚽',
        color: '#10B981',
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'Образование',
        slug: 'education',
        description: 'Образовательные мероприятия и мастер-классы',
        icon: '📚',
        color: '#F59E0B',
        sortOrder: 4,
        isActive: true
      },
      {
        name: 'Развлечения',
        slug: 'entertainment',
        description: 'Развлекательные мероприятия и шоу',
        icon: '🎪',
        color: '#EF4444',
        sortOrder: 5,
        isActive: true
      },
      {
        name: 'Выставки',
        slug: 'exhibitions',
        description: 'Выставки, ярмарки и фестивали',
        icon: '🎨',
        color: '#8B5CF6',
        sortOrder: 6,
        isActive: true
      }
    ];

    // Очищаем существующие категории
    await prisma.afishaCategory.deleteMany({});

    // Создаем новые категории
    const createdCategories = await Promise.all(
      categories.map(category => 
        prisma.afishaCategory.create({ data: category })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Created ${createdCategories.length} afisha categories`,
      categories: createdCategories
    });
  } catch (error) {
    console.error('Error seeding afisha categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
