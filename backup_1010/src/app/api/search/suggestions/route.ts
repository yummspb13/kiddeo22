import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { str as sstr } from '@/lib/query'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = sstr(searchParams.get('q'))
    const city = sstr(searchParams.get('city'))
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    const cityName = city === 'moskva' ? 'Москва' : 
                     city === 'spb' ? 'Санкт-Петербург' : null

    if (!cityName) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 })
    }

    // Ищем события по названию и описанию
    const events = await prisma.afishaEvent.findMany({
      where: {
        status: 'active',
        city: cityName,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { venue: { contains: query } },
          { organizer: { contains: query } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        endDate: true,
        venue: true,
        coverImage: true
      },
      orderBy: [
        { startDate: 'asc' },
        { title: 'asc' }
      ],
      take: 10
    })

    // Форматируем результаты для автокомплита
    const suggestions = events.map(event => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      coverImage: event.coverImage,
      isPast: new Date(event.endDate) < new Date()
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}