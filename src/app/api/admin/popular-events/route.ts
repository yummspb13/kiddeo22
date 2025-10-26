import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/popular-events - получить все популярные мероприятия
export async function GET(request: NextRequest) {
  try {
    // В dev режиме разрешаем доступ
    if (process.env.NODE_ENV !== 'production') {
      console.log('Dev mode: allowing access to popular events API')
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (cityId) where.cityId = parseInt(cityId)
    if (isActive !== null) where.isActive = isActive === 'true'

    // Используем Prisma
    const events = await prisma.popularEvent.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching popular events:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST /api/admin/popular-events - создать новое популярное мероприятие
export async function POST(request: NextRequest) {
  try {
    // В dev режиме разрешаем доступ
    if (process.env.NODE_ENV !== 'production') {
      console.log('Dev mode: allowing access to popular events API')
    }

    const body = await request.json()
    const {
      eventId,
      title,
      slug,
      description,
      imageUrl,
      price,
      date,
      location,
      category,
      isActive = true,
      order = 0,
      startDate,
      endDate,
      cityId,
      tickets,
      vendorName,
      coordinatesLat,
      coordinatesLng,
      images
    } = body

    // Валидация обязательных полей
    if (!eventId || !title || !slug) {
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 })
    }

    // Используем Prisma
    const event = await prisma.popularEvent.create({
      data: {
        eventId: eventId as any,
        title: title as any,
        slug: slug as any,
        description: description || null,
        imageUrl: imageUrl || null,
        price: price || null,
        date: date || null,
        location: location || null,
        category: category || null,
        isActive,
        order,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        cityId: cityId ? parseInt(cityId) : null,
        clickCount: 0,
        viewCount: 0,
        tickets: tickets ? JSON.stringify(tickets) : null,
        vendorName: vendorName || null,
        coordinatesLat: coordinatesLat ?? null,
        coordinatesLng: coordinatesLng ?? null,
        images: images ? JSON.stringify(images) : null
      } as any
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating popular event:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
