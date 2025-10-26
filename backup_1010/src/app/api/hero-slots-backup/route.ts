import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
  }

  try {
    const now = new Date()
    
    // Получаем случайное событие для fallback
    const fallbackEvents = await prisma.afishaEvent.findMany({
      where: {
        status: 'active',
        city: city,
        endDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        venue: true,
      },
      take: 10,
    })

    let selectedEvent = null
    let isFallback = true

    if (fallbackEvents.length > 0) {
      selectedEvent = fallbackEvents[Math.floor(Math.random() * fallbackEvents.length)]
    }

    return NextResponse.json({ 
      events: selectedEvent ? [selectedEvent] : [], 
      isFallback,
      debug: {
        city,
        now: now.toISOString(),
        fallbackEventsCount: fallbackEvents.length
      }
    })
  } catch (error) {
    console.error('Error fetching hero slots:', error)
    return NextResponse.json({ error: 'Failed to fetch hero slots', details: error.message }, { status: 500 })
  }
}
