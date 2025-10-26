import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

// GET /api/admin/users/stats - получить статистику пользователей
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // дней
    const days = parseInt(period)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Общая статистика пользователей
    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      recentActivity
    ] = await Promise.all([
      // Общее количество пользователей
      prisma.user.count(),

      // Активные пользователи (с верифицированным email)
      prisma.user.count({
        where: { emailVerified: { not: null } }
      }),

      // Новые пользователи за период
      prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Пользователи по ролям
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),

      // Последняя активность пользователей
      prisma.user.findMany({
        where: { updatedAt: { gte: startDate } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    ])

    // Упрощенная статистика по лояльности
    const totalLoyaltyPoints = 0
    const avgLoyaltyPoints = 0

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsers,
        activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      byRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role
      })),
      byStatus: {
        verified: activeUsers,
        unverified: totalUsers - activeUsers
      },
      loyalty: {
        totalPoints: totalLoyaltyPoints,
        averagePoints: avgLoyaltyPoints,
        usersWithPoints: 0
      },
      recentActivity: recentActivity.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastActivity: user.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 })
  }
}
