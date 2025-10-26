import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    // Загружаем только события
    const events = await prisma.afishaEvent.findMany({
      where: {
        status: 'active',
        city: city,
        endDate: { gte: new Date() }
      },
      orderBy: [
        { priority: 'asc' },
        { isPromoted: 'desc' },
        { isPopular: 'desc' },
        { viewCount: 'desc' },
        { startDate: 'asc' }
      ],
      take: 8,
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
        tickets: true,
        afishaCategory: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      events,
      categories: [],
      heroSlot: null,
      heroEvents: [],
      collections: [],
      pagination: {
        hasMore: true,
        nextOffset: 8
      }
    })

  } catch (error) {
    console.error('Error in initial events API:', error)
    return NextResponse.json({ error: 'Failed to fetch initial data' }, { status: 500 })
  }
}
