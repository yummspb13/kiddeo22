import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('🔍 Fetching events with limit:', limit, 'offset:', offset)

    const events = await prisma.afishaEvent.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        startDate: true,
        endDate: true,
        venue: true,
        organizer: true,
        coordinates: true,
        city: true,
        citySlug: true,
        category: true,
        categoryId: true,
        minPrice: true,
        ageFrom: true,
        ageTo: true,
        ageGroups: true,
        isPaid: true,
        isPopular: true,
        isPromoted: true,
        priority: true,
        status: true,
        createdAt: true
      }
    })

    console.log('✅ Found events:', events.length)

    return NextResponse.json({ events })
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Creating event:', body)

    // Генерируем уникальный slug
    const baseSlug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const timestamp = Date.now()
    const uniqueSlug = `${baseSlug}-${timestamp}`

    const event = await prisma.afishaEvent.create({
      data: {
        title: body.title,
        slug: uniqueSlug,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        venue: body.venue,
        organizer: body.organizer || 'Тестовый организатор',
        coordinates: body.coordinates || null,
        city: body.city || 'Москва',
        citySlug: body.citySlug || 'moskva',
        category: body.category || 'Развлечения',
        categoryId: body.categoryId || 1,
        minPrice: body.minPrice || 0,
        ageFrom: body.ageFrom || null,
        ageTo: body.ageTo || null,
        ageGroups: body.ageGroups || null,
        isPaid: body.isPaid || false,
        isPopular: body.isPopular || false,
        isPromoted: body.isPromoted || false,
        priority: body.priority || 5,
        searchText: body.searchText || body.title.toLowerCase(),
        status: body.status || 'active'
      }
    })

    console.log('✅ Event created:', event.id)

    return NextResponse.json({ 
      success: true,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug
      }
    })
  } catch (error) {
    console.error('❌ Error creating event:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
