import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const city = searchParams.get('city')
    
    if (!position) {
      return NextResponse.json({ error: 'Position is required' }, { status: 400 })
    }

    // Получаем город по slug с учетом маппинга
    let citySlug = city
    if (city === 'saint-petersburg') {
      citySlug = 'spb'
    }
    
    const cityRecord = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: { name: true }
    })
    
    const cityName = cityRecord?.name || null

    // Получаем активные рекламные слоты для данной позиции
    const where: any = {
      page: 'afisha',
      position: position,
      isActive: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: new Date() } }
      ],
      AND: [
        { OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }
      ]
    }

    // Фильтр по городу
    if (cityName) {
      const city = await prisma.city.findFirst({
        where: { name: cityName },
        select: { id: true }
      })
      
      if (city) {
        // Показываем только рекламу для конкретного города
        where.cityId = city.id
      } else {
        // Если город не найден, не показываем рекламу
        where.cityId = -1 // Несуществующий ID
      }
    } else {
      // Если город не указан, не показываем рекламу
      where.cityId = -1 // Несуществующий ID
    }

    const adPlacements = await prisma.adPlacement.findMany({
      where,
      orderBy: [
        { weight: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 1 // Берем только один слот
    })

    if (adPlacements.length === 0) {
      return NextResponse.json(null)
    }

    const adPlacement = adPlacements[0]

    // Записываем показ рекламы
    try {
      await prisma.adEvent.create({
        data: {
          adPlacementId: adPlacement.id,
          type: 'IMPRESSION',
          cityId: cityName ? await prisma.city.findFirst({
            where: { name: cityName },
            select: { id: true }
          }).then(c => c?.id) : null
        }
      })
    } catch (error) {
      // Игнорируем ошибки записи событий
      console.error('Error recording ad impression:', error)
    }

    return NextResponse.json({
      id: adPlacement.id,
      title: adPlacement.title,
      imageUrl: adPlacement.imageUrl,
      hrefUrl: adPlacement.hrefUrl,
      position: adPlacement.position,
      weight: adPlacement.weight
    })

  } catch (error) {
    console.error('Error fetching ad placement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
