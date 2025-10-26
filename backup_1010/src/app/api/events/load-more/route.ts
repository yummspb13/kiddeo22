import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '6')
    
    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    // Строим условия фильтрации
    const where: any = {
      status: 'active',
      city: city,
      endDate: { gte: new Date() }
    }

    // Фильтр по категориям - убираем SQL фильтрацию, будем фильтровать в JS
    // const categories = searchParams.get('categories')
    // if (categories) {
    //   const categoryList = categories.split(',')
    //   where.category = { in: categoryList }
    // }

    // Фильтр по возрасту
    const age = searchParams.get('age')
    if (age) {
      const ageList = age.split(',')
      where.OR = ageList.map(ageGroup => {
        switch (ageGroup) {
          case '0-3': return { ageFrom: { lte: 3 }, ageTo: { gte: 0 } }
          case '4-7': return { ageFrom: { lte: 7 }, ageTo: { gte: 4 } }
          case '8-12': return { ageFrom: { lte: 12 }, ageTo: { gte: 8 } }
          case '13+': return { ageFrom: { lte: 99 }, ageTo: { gte: 13 } }
          default: return {}
        }
      })
    }

    // Фильтр по цене
    const price = searchParams.get('price')
    if (price) {
      if (price === 'free') {
        where.isPaid = false
      } else if (price === 'paid') {
        where.isPaid = true
      }
    }

    let events = await prisma.afishaEvent.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { isPromoted: 'desc' },
        { isPopular: 'desc' },
        { viewCount: 'desc' },
        { startDate: 'asc' }
      ],
      skip: offset,
      take: limit * 2, // Загружаем больше, чтобы после фильтрации осталось достаточно
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        venue: true,
        isPaid: true,
        minPrice: true,
        category: true,
        ageFrom: true,
        ageTo: true,
        ageGroups: true
      }
    })

    // JS-фильтрация по категориям (как в основной странице)
    const categories = searchParams.get('categories')
    if (categories) {
      const selectedCategories = categories.split(',')
      events = events.filter(event => 
        selectedCategories.includes(event.category)
      )
    }

    // Ограничиваем результат
    events = events.slice(0, limit)

    return NextResponse.json({
      events,
      hasMore: events.length === limit,
      nextOffset: offset + limit
    })

  } catch (error) {
    console.error('Error in load more events API:', error)
    return NextResponse.json({ error: 'Failed to fetch more events' }, { status: 500 })
  }
}
