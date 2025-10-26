// src/lib/afisha-admin.ts
import prisma from "@/lib/db"

export interface QuickFilterData {
  id?: number
  cityId?: number | null
  page: string
  label: string
  queryJson: unknown
  order: number
  isActive: boolean
}

export interface AdPlacementData {
  id?: number
  page: string
  position: 'HERO' | 'HERO_BELOW' | 'INLINE' | 'SIDEBAR'
  title: string
  imageUrl?: string
  hrefUrl?: string
  startsAt?: Date
  endsAt?: Date
  order: number
  isActive: boolean
  cityId?: number | null
  weight: number
}

export interface AdEventStats {
  impressions: number
  clicks: number
  ctr: number
}

// QuickFilter CRUD
export async function getQuickFilters() {
  return await prisma.quickFilter.findMany({
    include: {
      City: true
    },
    orderBy: { order: 'asc' }
  })
}

export async function createQuickFilter(data: QuickFilterData) {
  return await prisma.quickFilter.create({
    data: {
      cityId: data.cityId,
      page: data.page,
      label: data.label,
      queryJson: data.queryJson as any,
      order: data.order,
      isActive: data.isActive
    }
  })
}

export async function updateQuickFilter(id: number, data: QuickFilterData) {
  return await prisma.quickFilter.update({
    where: { id },
    data: {
      cityId: data.cityId,
      page: data.page,
      label: data.label,
      queryJson: data.queryJson as any,
      order: data.order,
      isActive: data.isActive
    }
  })
}

export async function deleteQuickFilter(id: number) {
  return await prisma.quickFilter.delete({
    where: { id }
  })
}

export async function toggleQuickFilterActive(id: number, isActive: boolean) {
  return await prisma.quickFilter.update({
    where: { id },
    data: { isActive }
  })
}

// AdPlacement CRUD
export async function getAdPlacements() {
  const placements = await prisma.adPlacement.findMany({
    include: {
      City: true
    },
    orderBy: { order: 'asc' }
  })

  // Получаем статистику событий для каждого размещения
  const placementsWithStats = await Promise.all(
    placements.map(async (placement) => {
      const events = await prisma.adEvent.groupBy({
        by: ['type'],
        where: { adPlacementId: placement.id },
        _count: { id: true }
      })

      return {
        ...placement,
        events: events.map(event => ({
          type: event.type,
          count: event._count.id
        }))
      }
    })
  )

  return placementsWithStats
}

export async function createAdPlacement(data: AdPlacementData) {
  return await prisma.adPlacement.create({
    data: {
      page: data.page,
      position: data.position,
      title: data.title,
      imageUrl: data.imageUrl,
      hrefUrl: data.hrefUrl,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      order: data.order,
      isActive: data.isActive,
      cityId: data.cityId,
      weight: data.weight
    }
  })
}

export async function updateAdPlacement(id: number, data: AdPlacementData) {
  return await prisma.adPlacement.update({
    where: { id },
    data: {
      page: data.page,
      position: data.position,
      title: data.title,
      imageUrl: data.imageUrl,
      hrefUrl: data.hrefUrl,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      order: data.order,
      isActive: data.isActive,
      cityId: data.cityId,
      weight: data.weight
    }
  })
}

export async function deleteAdPlacement(id: number) {
  return await prisma.adPlacement.delete({
    where: { id }
  })
}

export async function toggleAdPlacementActive(id: number, isActive: boolean) {
  return await prisma.adPlacement.update({
    where: { id },
    data: { isActive }
  })
}

// AdEvent logging
export async function logAdEvent(
  adPlacementId: number,
  type: 'IMPRESSION' | 'CLICK',
  ip?: string,
  userAgent?: string,
  cityId?: number
) {
  return await prisma.adEvent.create({
    data: {
      adPlacementId,
      type,
      ip,
      ua: userAgent,
      cityId
    }
  })
}

// Analytics
export async function getAdPlacementStats(adPlacementId: number, startDate?: Date, endDate?: Date) {
  const where: unknown = { adPlacementId }
  
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const events = await prisma.adEvent.groupBy({
    by: ['type'],
    where,
    _count: { id: true }
  })

  const impressions = events.find(e => e.type === 'IMPRESSION')?._count.id || 0
  const clicks = events.find(e => e.type === 'CLICK')?._count.id || 0
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

  return {
    impressions,
    clicks,
    ctr: Math.round(ctr * 100) / 100
  }
}

export async function getAdAnalytics(startDate: Date, endDate: Date) {
  const events = await prisma.adEvent.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      AdPlacement: {
        select: {
          id: true,
          title: true,
          position: true,
          page: true
        }
      },
      City: {
        select: {
          name: true
        }
      }
    }
  })

  // Группируем по дням
  const dailyStats: Record<string, { impressions: number; clicks: number }> = {}
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyStats[dateStr] = { impressions: 0, clicks: 0 }
  }

  events.forEach(event => {
    const dateStr = event.createdAt.toISOString().split('T')[0]
    if (dailyStats[dateStr]) {
      if (event.type === 'IMPRESSION') {
        dailyStats[dateStr].impressions++
      } else if (event.type === 'CLICK') {
        dailyStats[dateStr].clicks++
      }
    }
  })

  return {
    totalImpressions: events.filter(e => e.type === 'IMPRESSION').length,
    totalClicks: events.filter(e => e.type === 'CLICK').length,
    dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0
    })),
    byPlacement: events.reduce((acc, event) => {
      const key = event.AdPlacement.id
      if (!acc[key]) {
        acc[key] = {
          title: event.AdPlacement.title,
          position: event.AdPlacement.position,
          page: event.AdPlacement.page,
          impressions: 0,
          clicks: 0
        }
      }
      if (event.type === 'IMPRESSION') acc[key].impressions++
      if (event.type === 'CLICK') acc[key].clicks++
      return acc
    }, {} as Record<number, any>)
  }
}

// Anti-fraud protection
export async function checkAdFraud(ip: string, adPlacementId: number, timeWindowMinutes: number = 5) {
  const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
  
  const recentEvents = await prisma.adEvent.count({
    where: {
      adPlacementId,
      ip,
      createdAt: {
        gte: timeWindow
      }
    }
  })

  // Максимум 10 показов за 5 минут с одного IP
  return recentEvents < 10
}
