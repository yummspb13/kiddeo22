import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getMinActivePrice } from '@/lib/price'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params
    
    const event = await prisma.afishaEvent.findUnique({
      where: {
        slug: slug
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        richDescription: true,
        venue: true,
        organizer: true,
        startDate: true,
        endDate: true,
        coordinates: true,
        coverImage: true,
        gallery: true,
        tickets: true,
        city: true,
        category: true,
        ageFrom: true,
        ageTo: true,
        minPrice: true,
        isPaid: true,
        afishaCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Получаем рекомендуемые события (случайные)
    const allEvents = await prisma.afishaEvent.findMany({
      where: {
        id: {
          not: event.id
        },
        status: 'active'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        venue: true,
        startDate: true,
        coverImage: true,
        category: true,
        tickets: true,
        isPaid: true,
        afishaCategory: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    // Перемешиваем массив случайным образом
    const shuffledEvents = allEvents.sort(() => Math.random() - 0.5)
    
    // Берем первые 6 событий
    const recommendedEvents = shuffledEvents.slice(0, 6).map(event => {
      const minPrice = getMinActivePrice(event.tickets, event.isPaid)
      
      return {
        ...event,
        minPrice
      }
    })

    return NextResponse.json({
      event,
      recommendedEvents
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
