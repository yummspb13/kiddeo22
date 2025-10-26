import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/moderation-analytics - получить аналитику модерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, all
    const vendorType = searchParams.get('vendorType') || 'all' // all, START, PRO

    // Вычисляем даты для периода
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date('2020-01-01') // Все время
    }

    // Базовые фильтры
    const whereClause: unknown = {
      createdAt: {
        gte: startDate
      }
    }

    if (vendorType !== 'all') {
      (whereClause as any).type = vendorType
    }

    // Общая статистика по заявкам
    const totalApplications = await prisma.vendor.count({
      where: whereClause
    })

    const applicationsByStatus = await prisma.vendor.groupBy({
      by: ['kycStatus'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    const applicationsByType = await prisma.vendor.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // Статистика по времени обработки
    const processedApplications = await prisma.vendor.findMany({
      where: {
        ...(whereClause as any),
        kycStatus: {
          in: ['APPROVED', 'REJECTED', 'NEEDS_INFO']
        }
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        kycStatus: true,
        type: true
      }
    })

    // Вычисляем время обработки
    const processingTimes = processedApplications.map(app => {
      const processingTime = app.updatedAt.getTime() - app.createdAt.getTime()
      const hours = Math.round(processingTime / (1000 * 60 * 60))
      return {
        id: app.id,
        type: app.type,
        status: app.kycStatus,
        hours: hours
      }
    })

    // Среднее время обработки
    const avgProcessingTime = processingTimes.length > 0 
      ? Math.round(processingTimes.reduce((sum, item) => sum + item.hours, 0) / processingTimes.length)
      : 0

    // Статистика по типам вендоров
    const avgProcessingTimeByType = applicationsByType.map(type => {
      const typeProcessingTimes = processingTimes.filter(item => item.type === type.type)
      const avgTime = typeProcessingTimes.length > 0
        ? Math.round(typeProcessingTimes.reduce((sum, item) => sum + item.hours, 0) / typeProcessingTimes.length)
        : 0
      
      return {
        type: type.type,
        count: type._count.id,
        avgProcessingTime: avgTime
      }
    })

    // Статистика по дням (для графика)
    const dailyStats = []
    const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dayStats = await prisma.vendor.groupBy({
        by: ['kycStatus'],
        where: {
          ...(whereClause as any),
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        _count: {
          id: true
        }
      })

      const dayData = {
        date: date.toISOString().split('T')[0],
        submitted: 0,
        approved: 0,
        rejected: 0,
        needsInfo: 0
      }

      dayStats.forEach(stat => {
        switch (stat.kycStatus) {
          case 'SUBMITTED':
            dayData.submitted = stat._count.id
            break
          case 'APPROVED':
            dayData.approved = stat._count.id
            break
          case 'REJECTED':
            dayData.rejected = stat._count.id
            break
          case 'NEEDS_INFO':
            dayData.needsInfo = stat._count.id
            break
        }
      })

      dailyStats.push(dayData)
    }

    // Топ причины отклонений (из auditLog)
    const rejectionAuditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: 'VENDOR',
        action: 'REJECT',
        createdAt: {
          gte: startDate
        }
      },
      select: {
        details: true,
        createdAt: true
      }
    })

    // Извлекаем причины из details
    const rejectionReasonsMap = new Map<string, number>()
    
    rejectionAuditLogs.forEach(log => {
      if (log.details && typeof log.details === 'object') {
        const details = log.details as any
        const reason = details.reason || details.notes || 'Не указана причина'
        
        // Нормализуем причины
        let normalizedReason = reason
        if (reason.includes('документ') || reason.includes('документация')) {
          normalizedReason = 'Неполные документы'
        } else if (reason.includes('данные') || reason.includes('информация')) {
          normalizedReason = 'Некорректные данные'
        } else if (reason.includes('представительство') || reason.includes('подтверждение')) {
          normalizedReason = 'Отсутствует подтверждение представительства'
        } else if (reason.includes('банк') || reason.includes('реквизит')) {
          normalizedReason = 'Неверные банковские реквизиты'
        } else if (reason.includes('подозритель') || reason.includes('активность')) {
          normalizedReason = 'Подозрительная активность'
        }
        
        rejectionReasonsMap.set(normalizedReason, (rejectionReasonsMap.get(normalizedReason) || 0) + 1)
      }
    })

    // Если нет реальных данных, используем заглушки
    const rejectionReasons = rejectionReasonsMap.size > 0 
      ? Array.from(rejectionReasonsMap.entries())
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
      : [
          { reason: 'Неполные документы', count: 0 },
          { reason: 'Некорректные данные', count: 0 },
          { reason: 'Отсутствует подтверждение представительства', count: 0 },
          { reason: 'Неверные банковские реквизиты', count: 0 },
          { reason: 'Подозрительная активность', count: 0 }
        ]

    // Конверсия по воронке
    const funnelData = {
      submitted: totalApplications,
      underReview: applicationsByStatus.find(s => s.kycStatus === 'SUBMITTED')?._count.id || 0,
      approved: applicationsByStatus.find(s => s.kycStatus === 'APPROVED')?._count.id || 0,
      rejected: applicationsByStatus.find(s => s.kycStatus === 'REJECTED')?._count.id || 0,
      needsInfo: applicationsByStatus.find(s => s.kycStatus === 'NEEDS_INFO')?._count.id || 0
    }

    const conversionRate = funnelData.submitted > 0 
      ? Math.round((funnelData.approved / funnelData.submitted) * 100)
      : 0

    // SLA метрики
    const slaMetrics = {
      avgProcessingTime: avgProcessingTime,
      sla24h: processingTimes.filter(item => item.hours <= 24).length,
      sla48h: processingTimes.filter(item => item.hours <= 48).length,
      sla72h: processingTimes.filter(item => item.hours <= 72).length,
      totalProcessed: processingTimes.length
    }

    const sla24hRate = slaMetrics.totalProcessed > 0 
      ? Math.round((slaMetrics.sla24h / slaMetrics.totalProcessed) * 100)
      : 0

    const sla48hRate = slaMetrics.totalProcessed > 0 
      ? Math.round((slaMetrics.sla48h / slaMetrics.totalProcessed) * 100)
      : 0

    // Статистика по модераторам
    const moderatorStats = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        entityType: 'VENDOR',
        action: {
          in: ['APPROVE', 'REJECT', 'REQUEST_INFO']
        },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    // Получаем информацию о модераторах
    const moderatorIds = moderatorStats.map(stat => stat.userId)
    const moderators = moderatorIds.length > 0 ? await prisma.user.findMany({
      where: {
        id: {
          in: moderatorIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    }) : []

    const moderatorStatsWithNames = moderatorStats.map(stat => {
      const moderator = moderators.find(m => m.id === stat.userId)
      return {
        userId: stat.userId,
        name: moderator?.name || 'Неизвестный модератор',
        email: moderator?.email || '',
        actionsCount: stat._count.id
      }
    }).sort((a, b) => b.actionsCount - a.actionsCount)

    // Статистика по времени модерации
    const moderationTimeStats = await prisma.auditLog.findMany({
      where: {
        entityType: 'VENDOR',
        action: {
          in: ['APPROVE', 'REJECT']
        },
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        details: true,
        userId: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Группируем по вендорам для расчета времени модерации
    const vendorModerationTimes = new Map<string, { start: Date, end: Date, moderatorId: number }>()
    
    moderationTimeStats.forEach(log => {
      if (log.details && typeof log.details === 'object') {
        const details = log.details as any
        const vendorId = details.vendorId || details.entityId
        
        if (vendorId) {
          if (!vendorModerationTimes.has(vendorId)) {
            vendorModerationTimes.set(vendorId, {
              start: log.createdAt,
              end: log.createdAt,
              moderatorId: log.userId
            })
          } else {
            const existing = vendorModerationTimes.get(vendorId)!
            existing.end = log.createdAt
          }
        }
      }
    })

    // Рассчитываем среднее время модерации
    const moderationTimes = Array.from(vendorModerationTimes.values()).map(item => {
      const hours = Math.round((item.end.getTime() - item.start.getTime()) / (1000 * 60 * 60))
      return {
        hours,
        moderatorId: item.moderatorId
      }
    })

    const avgModerationTime = moderationTimes.length > 0
      ? Math.round(moderationTimes.reduce((sum, item) => sum + item.hours, 0) / moderationTimes.length)
      : 0

    return NextResponse.json({
      period,
      vendorType,
      summary: {
        totalApplications,
        avgProcessingTime,
        conversionRate,
        sla24hRate,
        sla48hRate
      },
      statusBreakdown: applicationsByStatus.map(item => ({
        status: item.kycStatus,
        count: item._count.id,
        percentage: totalApplications > 0 ? Math.round((item._count.id / totalApplications) * 100) : 0
      })),
      typeBreakdown: avgProcessingTimeByType,
      dailyStats,
      rejectionReasons,
      funnelData,
      slaMetrics: {
        ...slaMetrics,
        sla24hRate,
        sla48hRate
      },
      moderatorStats: moderatorStatsWithNames,
      avgModerationTime,
      totalModerationActions: moderatorStats.reduce((sum, stat) => sum + stat._count.id, 0)
    })

  } catch (error) {
    console.error('Error fetching moderation analytics:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
