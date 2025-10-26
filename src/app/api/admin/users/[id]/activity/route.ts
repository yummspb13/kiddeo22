import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/users/[id]/activity - получить лог активности пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    
    const { id } = await params
    const userId = id

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const eventType = searchParams.get('eventType') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Строим условия фильтрации
    const where: any = { userId: parseInt(userId) }

    if (eventType) {
      where.eventType = eventType
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    }

    // Получаем события активности
    const [events, totalCount] = await Promise.all([
      prisma.userBehaviorEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.userBehaviorEvent.count({ where })
    ])

    // Получаем статистику по типам событий
    const eventStats = await prisma.userBehaviorEvent.groupBy({
      by: ['eventType'],
      where: { userId: parseInt(userId) } as any,
      _count: { eventType: true }
    })

    // Получаем последнюю активность
    const lastActivity = await prisma.userBehaviorEvent.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, eventType: true }
    })

    return NextResponse.json({
      events: events.map(event => ({
        id: event.id,
        eventType: event.eventType,
        eventData: event.data,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        createdAt: event.createdAt
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        totalEvents: totalCount,
        eventTypes: eventStats.map(stat => ({
          eventType: stat.eventType,
          count: stat._count.eventType
        })),
        lastActivity: lastActivity?.createdAt,
        lastActivityType: lastActivity?.eventType
      }
    })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 })
  }
}

