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

    // Все 22 города с их слагами
    const cities = [
      { name: 'Москва', slug: 'moskva', isPublic: true }, // Уже открыт
      { name: 'Санкт-Петербург', slug: 'sankt-peterburg', isPublic: false }, // Закрыт пока
      { name: 'Екатеринбург', slug: 'ekaterinburg', isPublic: false },
      { name: 'Новосибирск', slug: 'novosibirsk', isPublic: false },
      { name: 'Казань', slug: 'kazan', isPublic: false },
      { name: 'Нижний Новгород', slug: 'nizhniy-novgorod', isPublic: false },
      { name: 'Краснодар', slug: 'krasnodar', isPublic: false },
      { name: 'Челябинск', slug: 'chelyabinsk', isPublic: false },
      { name: 'Уфа', slug: 'ufa', isPublic: false },
      { name: 'Ростов-на-Дону', slug: 'rostov-na-donu', isPublic: false },
      { name: 'Самара', slug: 'samara', isPublic: false },
      { name: 'Воронеж', slug: 'voronezh', isPublic: false },
      { name: 'Пермь', slug: 'perm', isPublic: false },
      { name: 'Волгоград', slug: 'volgograd', isPublic: false },
      { name: 'Омск', slug: 'omsk', isPublic: false },
      { name: 'Тюмень', slug: 'tyumen', isPublic: false },
      { name: 'Барнаул', slug: 'barnaul', isPublic: false },
      { name: 'Ижевск', slug: 'izhevsk', isPublic: false },
      { name: 'Тольятти', slug: 'tolyatti', isPublic: false },
      { name: 'Красноярск', slug: 'krasnoyarsk', isPublic: false },
      { name: 'Саратов', slug: 'saratov', isPublic: false },
      { name: 'Хабаровск', slug: 'khabarovsk', isPublic: false }
    ];

    const createdCities = [];
    const updatedCities = [];

    for (const cityData of cities) {
      try {
        // Проверяем, существует ли город
        const existingCity = await prisma.city.findFirst({
          where: { slug: cityData.slug }
        });

        if (existingCity) {
          // Обновляем существующий город
          const updatedCity = await prisma.city.update({
            where: { id: existingCity.id },
            data: {
              name: cityData.name,
              isPublic: cityData.isPublic
            }
          });
          updatedCities.push(updatedCity);
        } else {
          // Создаем новый город
          const newCity = await prisma.city.create({
            data: cityData
          });
          createdCities.push(newCity);
        }
      } catch (error) {
        console.error(`Error processing city ${cityData.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${cities.length} cities`,
      created: createdCities.length,
      updated: updatedCities.length,
      cities: [...createdCities, ...updatedCities]
    });
  } catch (error) {
    console.error('Error seeding all cities:', error);
    return NextResponse.json(
      { error: 'Failed to seed all cities', details: error },
      { status: 500 }
    );
  }
}
