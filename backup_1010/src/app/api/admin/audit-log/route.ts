import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'

// GET /api/admin/audit-log - получить записи аудита
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const entityType = searchParams.get('entityType') || ''
    const action = searchParams.get('action') || ''
    const userId = searchParams.get('userId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const skip = (page - 1) * limit

    // Строим фильтры
    const whereClause: any = {}

    if (entityType) {
      whereClause.entityType = entityType
    }

    if (action) {
      whereClause.action = action
    }

    if (userId && userId.trim() !== '') {
      const userIdNum = parseInt(userId)
      if (!isNaN(userIdNum)) {
        whereClause.userId = userIdNum
      }
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom && dateFrom.trim() !== '') {
        const fromDate = new Date(dateFrom)
        if (!isNaN(fromDate.getTime())) {
          whereClause.createdAt.gte = fromDate
        }
      }
      if (dateTo && dateTo.trim() !== '') {
        const toDate = new Date(dateTo)
        if (!isNaN(toDate.getTime())) {
          // Добавляем 23:59:59 к дате "до", чтобы включить весь день
          toDate.setHours(23, 59, 59, 999)
          whereClause.createdAt.lte = toDate
        }
      }
    }

    // Получаем записи аудита с информацией о пользователе
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Получаем общее количество записей для пагинации
    const totalCount = await prisma.auditLog.count({
      where: whereClause
    })

    // Получаем статистику по типам сущностей
    const entityTypeStats = await prisma.auditLog.groupBy({
      by: ['entityType'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Получаем статистику по действиям
    const actionStats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Получаем статистику по пользователям
    const userStats = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Получаем информацию о пользователях для статистики
    const userIds = userStats.map(stat => stat.userId)
    const users = userIds.length > 0 ? await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    }) : []

    const userStatsWithNames = userStats.map(stat => {
      const user = users.find(u => u.id === stat.userId)
      return {
        userId: stat.userId,
        userName: user?.name || 'Неизвестный пользователь',
        userEmail: user?.email || '',
        userRole: user?.role || 'UNKNOWN',
        actionsCount: stat._count.id
      }
    }).sort((a, b) => b.actionsCount - a.actionsCount)

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      statistics: {
        entityTypeStats,
        actionStats,
        userStats: userStatsWithNames
      }
    })

  } catch (error) {
    console.error('Error fetching audit log:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/admin/audit-log - создать запись аудита (для тестирования)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    const { entityType, entityId, action, details, userId, ipAddress } = await request.json()

    if (!entityType || !entityId || !action || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        entityType,
        entityId: entityId.toString(),
        action,
        details: details || {},
        userId: parseInt(userId),
        ipAddress: ipAddress || '127.0.0.1'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(auditLog)

  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
