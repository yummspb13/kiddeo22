import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/admin/popular-events/[id] - получить популярное мероприятие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // В dev режиме разрешаем доступ
    if (process.env.NODE_ENV !== 'production') {
      console.log('Dev mode: allowing access to popular events API')
    }

    const { id } = await params
    const eventId = parseInt(id)
    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Неверный ID мероприятия' }, { status: 400 })
    }

    // Используем Prisma
    const event = await prisma.popularEvent.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: 'Мероприятие не найдено' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching popular event:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// PUT /api/admin/popular-events/[id] - обновить популярное мероприятие
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // В dev режиме разрешаем доступ
    if (process.env.NODE_ENV !== 'production') {
      console.log('Dev mode: allowing access to popular events API')
    }

    const { id } = await params
    const eventId = parseInt(id)
    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Неверный ID мероприятия' }, { status: 400 })
    }

    const body = await request.json()
    const {
      eventId: newEventId,
      title,
      slug,
      description,
      imageUrl,
      price,
      date,
      location,
      category,
      isActive,
      order,
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
    if (!newEventId || !title || !slug) {
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 })
    }

    // Используем Prisma
    const event = await prisma.popularEvent.update({
      where: { id: eventId },
      data: {
        eventId: newEventId,
        title,
        slug,
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
        cityId: cityId ? cityId : null,
        tickets: tickets ? JSON.stringify(tickets) : null,
        vendorName: vendorName || null,
        coordinatesLat: coordinatesLat ?? null,
        coordinatesLng: coordinatesLng ?? null,
        images: images ? JSON.stringify(images) : null
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating popular event:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// DELETE /api/admin/popular-events/[id] - удалить популярное мероприятие
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // В dev режиме разрешаем доступ
    if (process.env.NODE_ENV !== 'production') {
      console.log('Dev mode: allowing access to popular events API')
    }

    const { id } = await params
    const eventId = parseInt(id)
    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Неверный ID мероприятия' }, { status: 400 })
    }

    // Используем Prisma
    await prisma.popularEvent.delete({
      where: { id: eventId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting popular event:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}