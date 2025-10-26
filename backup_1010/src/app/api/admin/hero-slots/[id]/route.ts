import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить конкретный слот
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const heroSlot = await prisma.heroSlot.findUnique({
      where: { id }
    })

    if (!heroSlot) {
      return NextResponse.json({ error: 'Hero slot not found' }, { status: 404 })
    }

    return NextResponse.json(heroSlot)

  } catch (error) {
    console.error('Error fetching hero slot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - обновить слот
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { city, eventIds, startDate, endDate, rotationFrequency, isActive } = body

    // Проверяем, нужно ли сериализовать eventIds
    let eventIdsString: string
    if (typeof eventIds === 'string') {
      eventIdsString = eventIds
    } else {
      eventIdsString = JSON.stringify(eventIds)
    }

    const heroSlot = await prisma.heroSlot.update({
      where: { id },
      data: {
        city,
        eventIds: eventIdsString,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rotationFrequency: rotationFrequency || 1,
        isActive: isActive !== false
      }
    })

    return NextResponse.json(heroSlot)

  } catch (error) {
    console.error('Error updating hero slot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - частичное обновление (например, статус)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const heroSlot = await prisma.heroSlot.update({
      where: { id },
      data: body
    })

    return NextResponse.json(heroSlot)

  } catch (error) {
    console.error('Error updating hero slot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - удалить слот
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.heroSlot.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting hero slot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
