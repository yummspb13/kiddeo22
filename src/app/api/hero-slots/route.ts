import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('Hero slots API called')
  
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
    console.log('Hero slots API called with city:', city)
    
    if (!city) {
      console.log('No city parameter provided')
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    console.log('Searching for hero slots with city:', city)
    
    // Получаем активные слоты для города (убираем фильтрацию по датам для тестирования)
    const heroSlots = await prisma.heroSlot.findMany({
      where: {
        city: city,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found hero slots:', heroSlots.length)

    if (heroSlots.length === 0) {
      return NextResponse.json({ 
        events: [], 
        isFallback: true 
      })
    }

    // Выбираем случайный слот (ротация)
    const randomSlot = heroSlots[Math.floor(Math.random() * heroSlots.length)]
    
    // Получаем события для слота
    const eventIds = JSON.parse(randomSlot.eventIds)
    const events = await prisma.afishaEvent.findMany({
      where: {
        id: { in: eventIds }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        venue: true,
        isPaid: true,
        tickets: true
      }
    })

    // Вычисляем минимальную цену для каждого события
    const eventsWithPrice = events.map(event => {
      let minPrice = 0
      
      if (event.tickets && Array.isArray(event.tickets)) {
        const prices = event.tickets
          .filter(ticket => ticket.price && ticket.price > 0)
          .map(ticket => ticket.price)
        
        if (prices.length > 0) {
          minPrice = Math.min(...prices)
        }
      }
      
      return {
        ...event,
        minPrice: event.isPaid ? minPrice : 0
      }
    })

    return NextResponse.json({
      events: eventsWithPrice,
      isFallback: false,
      slotId: randomSlot.id
    })

  } catch (error) {
    console.error('Error fetching hero slots:', error)
    return NextResponse.json({ 
      events: [], 
      isFallback: true 
    })
  }
}