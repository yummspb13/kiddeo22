import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { eventIds } = body

    // Сначала удаляем все существующие связи с этой коллекцией
    await prisma.collectionEvent.deleteMany({
      where: { collectionId: id }
    })

    // Затем создаем новые связи
    if (eventIds && eventIds.length > 0) {
      await prisma.collectionEvent.createMany({
        data: eventIds.map((eventId: string) => ({
          collectionId: id,
          eventId: eventId
        }))
      })
    }

    // Возвращаем обновленную коллекцию с событиями
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        eventCollections: {
          include: {
            event: true
          }
        },
        _count: {
          select: { eventCollections: true }
        }
      }
    })

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error updating collection events:', error)
    return NextResponse.json({ error: 'Failed to update collection events' }, { status: 500 })
  }
}
