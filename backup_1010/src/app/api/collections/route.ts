import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Collections API: Starting request')
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const citySlug = searchParams.get('citySlug')
    
    console.log('Collections API: Params', { city, citySlug })
    
    // Строим условие для фильтрации по городу
    const whereClause: any = {
      isActive: true,
      hideFromAfisha: false
    }
    
    if (city) {
      whereClause.city = city
    } else if (citySlug) {
      whereClause.citySlug = citySlug
    }
    
    console.log('Collections API: Where clause', whereClause)
    
    // Получаем подборки с количеством событий
    const collections = await prisma.collection.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        eventCollections: {
          include: {
            event: true
          }
        },
        _count: {
          select: {
            eventCollections: true
          }
        }
      }
    })
    
    // Фильтруем только подборки с активными событиями
    const collectionsWithEvents = collections.filter(collection => {
      const activeEvents = collection.eventCollections.filter(ec => ec.event.status === 'active')
      return activeEvents.length > 0
    })
    
    return NextResponse.json(collectionsWithEvents)
  } catch (error) {
    console.error('Error fetching collections:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
