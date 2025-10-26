// src/lib/admin-metrics.ts
import prisma from "@/lib/db"

export interface DashboardMetrics {
  // Основные метрики
  totalUsers: number
  totalVendors: number
  totalListings: number
  totalCities: number
  
  // Активность
  activeListings: number
  pendingListings: number
  totalBookings: number
  totalLeads: number
  
  // Финансы
  totalRevenue: number
  pendingPayments: number
  
  // Реклама
  totalAdImpressions: number
  totalAdClicks: number
  adClickRate: number
}

export interface ModerationData {
  pendingListings: Array<{
    id: number
    title: string
    type: 'listing'
    status: 'pending'
    createdAt: Date
    city?: string
    category?: string
  }>
  pendingVendors: Array<{
    id: number
    title: string
    type: 'vendor'
    status: 'pending'
    createdAt: Date
    city?: string
  }>
  newLeads: Array<{
    id: number
    title: string
    type: 'lead'
    status: 'pending'
    createdAt: Date
    city?: string
    category?: string
  }>
}

export interface ChartData {
  views: Array<{ date: string; value: number }>
  clicks: Array<{ date: string; value: number }>
  conversions: Array<{ date: string; value: number }>
  revenue: Array<{ date: string; value: number }>
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    totalUsers,
    totalVendors,
    totalListings,
    totalCities,
    activeListings,
    totalBookings,
    totalLeads,
    totalRevenue,
    pendingPayments,
    adStats
  ] = await Promise.all([
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.listing.count(),
    prisma.city.count({ where: { isPublic: true } }),
    prisma.listing.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.lead.count(),
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.adEvent.groupBy({
      by: ['type'],
      _count: { id: true }
    })
  ])

  const impressions = adStats.find(s => s.type === 'IMPRESSION')?._count.id || 0
  const clicks = adStats.find(s => s.type === 'CLICK')?._count.id || 0
  const adClickRate = impressions > 0 ? (clicks / impressions) * 100 : 0

  return {
    totalUsers,
    totalVendors,
    totalListings,
    totalCities,
    activeListings,
    pendingListings: totalListings - activeListings,
    totalBookings,
    totalLeads,
    totalRevenue: totalRevenue._sum.amount || 0,
    pendingPayments,
    totalAdImpressions: impressions,
    totalAdClicks: clicks,
    adClickRate: Math.round(adClickRate * 100) / 100
  }
}

export async function getModerationData(): Promise<ModerationData> {
  const [pendingListings, pendingVendors, newLeads] = await Promise.all([
    prisma.listing.findMany({
      where: { isActive: false },
      include: { city: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.vendor.findMany({
      where: { 
        OR: [
          { canPostEvents: false },
          { canPostCatalog: false }
        ]
      },
      include: { city: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.lead.findMany({
      where: { status: 'NEW' },
      include: { city: true, listing: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  return {
    pendingListings: pendingListings.map(l => ({
      id: l.id,
      title: l.title,
      type: 'listing' as const,
      status: 'pending' as const,
      createdAt: l.createdAt,
      city: l.city.name,
      category: l.category.name
    })),
    pendingVendors: pendingVendors.map(v => ({
      id: v.id,
      title: v.displayName,
      type: 'vendor' as const,
      status: 'pending' as const,
      createdAt: v.createdAt,
      city: v.city.name
    })),
    newLeads: newLeads.map(l => ({
      id: l.id,
      title: l.name,
      type: 'lead' as const,
      status: 'pending' as const,
      createdAt: l.createdAt,
      city: l.city?.name,
      category: l.listing.category.name
    }))
  }
}

export async function getChartData(days: number = 30): Promise<ChartData> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  // Получаем данные по дням
  const [adEvents, bookings, payments] = await Promise.all([
    prisma.adEvent.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        type: true,
        createdAt: true
      }
    }),
    prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        createdAt: true,
        totalRub: true
      }
    }),
    prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'PAID'
      },
      select: {
        createdAt: true,
        amount: true
      }
    })
  ])

  // Группируем по дням
  const dailyData: Record<string, {
    views: number
    clicks: number
    bookings: number
    revenue: number
  }> = {}

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyData[dateStr] = { views: 0, clicks: 0, bookings: 0, revenue: 0 }
  }

  // Заполняем данные
  adEvents.forEach(event => {
    const dateStr = event.createdAt.toISOString().split('T')[0]
    if (dailyData[dateStr]) {
      if (event.type === 'IMPRESSION') {
        dailyData[dateStr].views++
      } else if (event.type === 'CLICK') {
        dailyData[dateStr].clicks++
      }
    }
  })

  bookings.forEach(booking => {
    const dateStr = booking.createdAt.toISOString().split('T')[0]
    if (dailyData[dateStr]) {
      dailyData[dateStr].bookings++
    }
  })

  payments.forEach(payment => {
    const dateStr = payment.createdAt.toISOString().split('T')[0]
    if (dailyData[dateStr]) {
      dailyData[dateStr].revenue += payment.amount / 100 // конвертируем из копеек в рубли
    }
  })

  // Преобразуем в формат для графиков
  const views = Object.entries(dailyData).map(([date, data]) => ({
    date,
    value: data.views
  }))

  const clicks = Object.entries(dailyData).map(([date, data]) => ({
    date,
    value: data.clicks
  }))

  const conversions = Object.entries(dailyData).map(([date, data]) => ({
    date,
    value: data.bookings
  }))

  const revenue = Object.entries(dailyData).map(([date, data]) => ({
    date,
    value: data.revenue
  }))

  return { views, clicks, conversions, revenue }
}
