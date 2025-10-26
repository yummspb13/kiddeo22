// src/lib/admin-assistant.ts
import prisma from "@/lib/db"
import { AdminInsightType, AdminInsightPriority } from "@prisma/client"

export interface UserBehaviorEvent {
  userId?: number
  sessionId: string
  eventType: string
  page: string
  element?: string
  data?: unknown
  userAgent?: string
  ipAddress?: string
}

export interface VendorPerformanceData {
  vendorId: number
  metricType: string
  value: number
  period: string
  date: Date
  metadata?: unknown
}

// Логирование события поведения пользователя
export async function logUserBehavior(event: UserBehaviorEvent) {
  return await prisma.userBehaviorEvent.create({
    data: {
      userId: event.userId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      page: event.page,
      element: event.element,
      data: event.data as any,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress
    }
  })
}

// Логирование метрики производительности вендора
export async function logVendorPerformance(data: VendorPerformanceData) {
  return await prisma.vendorPerformanceMetric.create({
    data
  })
}

// Создание административного инсайта
export async function createAdminInsight(data: {
  type: AdminInsightType
  priority: AdminInsightPriority
  title: string
  description: string
  data: unknown
  recommendations?: unknown
}) {
  return await prisma.adminInsight.create({
    data
  })
}

// Получение инсайтов
export async function getAdminInsights(filters?: {
  type?: AdminInsightType
  priority?: AdminInsightPriority
  isResolved?: boolean
  limit?: number
}) {
  return await prisma.adminInsight.findMany({
    where: {
      ...(filters?.type && { type: filters.type }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.isResolved !== undefined && { isResolved: filters.isResolved })
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    take: filters?.limit || 50
  })
}

// Отметка инсайта как решенного
export async function resolveInsight(id: number, resolvedBy: number) {
  return await prisma.adminInsight.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy
    }
  })
}

// Анализ поведения пользователей
export async function analyzeUserBehavior(days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    totalUsers,
    activeUsers,
    newUsers,
    avgSessionDuration,
    bounceRate,
    topPages,
    topActions
  ] = await Promise.all([
    // Общее количество пользователей
    prisma.user.count(),
    
    // Активные пользователи (с событиями за период)
    prisma.userBehaviorEvent.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: { userId: true },
      distinct: ['userId']
    }).then(events => events.length),
    
    // Новые пользователи за период
    prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    }),
    
    // Средняя продолжительность сессии (симуляция)
    calculateAvgSessionDuration(startDate),
    
    // Показатель отказов (симуляция)
    calculateBounceRate(startDate),
    
    // Топ страниц
    prisma.userBehaviorEvent.groupBy({
      by: ['page'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: startDate }
      },
      _count: { page: true },
      orderBy: { _count: { page: 'desc' } },
      take: 10
    }),
    
    // Топ действия
    prisma.userBehaviorEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } },
      take: 10
    })
  ])

  return {
    totalUsers,
    activeUsers,
    newUsers,
    avgSessionDuration,
    bounceRate,
    topPages: topPages.map(p => ({ page: p.page, views: p._count.page })),
    topActions: topActions.map(a => ({ action: a.eventType, count: a._count.eventType }))
  }
}

// Анализ производительности вендоров
export async function analyzeVendorPerformance(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [
    totalVendors,
    activeVendors,
    newVendors,
    avgRevenue,
    topPerformers,
    underPerformers
  ] = await Promise.all([
    // Общее количество вендоров
    prisma.vendor.count(),
    
    // Активные вендоры (с метриками за период)
    prisma.vendorPerformanceMetric.findMany({
      where: {
        date: { gte: startDate }
      },
      select: { vendorId: true },
      distinct: ['vendorId']
    }).then(metrics => metrics.length),
    
    // Новые вендоры за период
    prisma.vendor.count({
      where: {
        createdAt: { gte: startDate }
      }
    }),
    
    // Средний доход (симуляция)
    calculateAvgRevenue(startDate),
    
    // Топ исполнители (симуляция)
    getTopPerformers(startDate),
    
    // Требующие внимания (симуляция)
    getUnderPerformers(startDate)
  ])

  return {
    totalVendors,
    activeVendors,
    newVendors,
    avgRevenue,
    topPerformers,
    underPerformers
  }
}

// Автоматическое создание инсайтов на основе данных
export async function generateInsights() {
  const insights = []

  // Анализ поведения пользователей
  const userBehavior = await analyzeUserBehavior()
  
  if (userBehavior.bounceRate > 60) {
    insights.push({
      type: 'USER_BEHAVIOR' as AdminInsightType,
      priority: 'HIGH' as AdminInsightPriority,
      title: 'Высокий показатель отказов',
      description: `Показатель отказов составляет ${userBehavior.bounceRate}%, что превышает рекомендуемые 40%.`,
      data: { bounceRate: userBehavior.bounceRate, avgTimeOnPage: userBehavior.avgSessionDuration },
      recommendations: {
        actions: [
          'Оптимизировать загрузку страниц',
          'Улучшить мобильную версию',
          'Добавить интерактивные элементы',
          'Провести A/B тестирование заголовков'
        ]
      }
    })
  }

  if (userBehavior.avgSessionDuration < 2) {
    insights.push({
      type: 'USER_BEHAVIOR' as AdminInsightType,
      priority: 'MEDIUM' as AdminInsightPriority,
      title: 'Короткое время на сайте',
      description: `Среднее время сессии составляет ${userBehavior.avgSessionDuration} минут.`,
      data: { avgSessionDuration: userBehavior.avgSessionDuration },
      recommendations: {
        actions: [
          'Улучшить контент на главной странице',
          'Добавить рекомендации по интересам',
          'Оптимизировать навигацию'
        ]
      }
    })
  }

  // Анализ производительности вендоров
  const vendorPerformance = await analyzeVendorPerformance()
  
  if (vendorPerformance.avgRevenue < 10000) {
    insights.push({
      type: 'VENDOR_PERFORMANCE' as AdminInsightType,
      priority: 'HIGH' as AdminInsightPriority,
      title: 'Низкий средний доход вендоров',
      description: `Средний доход вендоров составляет ${vendorPerformance.avgRevenue.toLocaleString()}₽, что ниже ожидаемого.`,
      data: { avgRevenue: vendorPerformance.avgRevenue },
      recommendations: {
        actions: [
          'Улучшить онбординг новых вендоров',
          'Предоставить больше инструментов для продвижения',
          'Создать обучающие материалы',
          'Внедрить систему рекомендаций'
        ]
      }
    })
  }

  // Создание инсайтов в базе данных
  for (const insight of insights) {
    await createAdminInsight(insight)
  }

  return insights
}

// Вспомогательные функции (симуляция)
async function calculateAvgSessionDuration(startDate: Date): Promise<number> {
  // В реальной версии здесь будет сложная логика расчета
  return 4.2
}

async function calculateBounceRate(startDate: Date): Promise<number> {
  // В реальной версии здесь будет расчет на основе данных
  return 42
}

async function calculateAvgRevenue(startDate: Date): Promise<number> {
  // В реальной версии здесь будет расчет на основе данных о доходах
  return 12500
}

async function getTopPerformers(startDate: Date) {
  // В реальной версии здесь будет запрос к базе данных
  return [
    { name: 'Детский центр "Радуга"', revenue: 45000, growth: 15 },
    { name: 'Студия танцев "Грация"', revenue: 38000, growth: 22 },
    { name: 'Школа программирования', revenue: 35000, growth: 8 }
  ]
}

async function getUnderPerformers(startDate: Date) {
  // В реальной версии здесь будет запрос к базе данных
  return [
    { name: 'Мастер-классы "Творчество"', revenue: 2000, issues: ['Плохие фото', 'Нет описания'] },
    { name: 'Спортивная секция', revenue: 1500, issues: ['Высокая цена', 'Неудобное время'] }
  ]
}

// Получение статистики дашборда
export async function getDashboardStats() {
  const [
    totalInsights,
    unresolvedInsights,
    criticalInsights,
    resolvedInsights
  ] = await Promise.all([
    prisma.adminInsight.count(),
    prisma.adminInsight.count({ where: { isResolved: false } }),
    prisma.adminInsight.count({ 
      where: { 
        priority: 'CRITICAL',
        isResolved: false 
      } 
    }),
    prisma.adminInsight.count({ where: { isResolved: true } })
  ])

  return {
    totalInsights,
    unresolvedInsights,
    criticalInsights,
    resolvedInsights
  }
}
