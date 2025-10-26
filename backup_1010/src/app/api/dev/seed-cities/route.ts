import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cities = [
      { name: 'Москва', slug: 'moskva', isPublic: true },
      { name: 'Санкт-Петербург', slug: 'spb', isPublic: true },
      { name: 'Екатеринбург', slug: 'ekaterinburg', isPublic: true }
    ];

    const createdCities = [];

    for (const cityData of cities) {
      try {
        const city = await prisma.city.create({
          data: cityData
        });
        createdCities.push(city);
      } catch (error) {
        // Игнорируем ошибки дублирования
        console.log(`City ${cityData.name} already exists`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdCities.length} cities`,
      cities: createdCities
    });
  } catch (error) {
    console.error('Error seeding cities:', error);
    return NextResponse.json(
      { error: 'Failed to seed cities', details: error },
      { status: 500 }
    );
  }
}
