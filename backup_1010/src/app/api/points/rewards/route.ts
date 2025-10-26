import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'

// Получение доступных наград
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(String(session.user.id))
    const { searchParams } = new URL(request.url)
    const availableOnly = searchParams.get('availableOnly') === 'true'

    // Получаем текущие баллы пользователя
    let userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    })

    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: {
          userId,
          points: 0,
          totalEarned: 0,
          totalSpent: 0,
          level: 'NOVICE'
        }
      })
    }

    // Получаем награды
    const whereClause: unknown = {
      isActive: true
    }

    if (availableOnly) {
      (whereClause as any).pointsCost = { lte: userPoints.points }
    }

    const rewards = await prisma.reward.findMany({
      where: whereClause,
      orderBy: { pointsCost: 'asc' }
    })

    // Получаем использованные награды пользователя
    const userRewards = await prisma.userReward.findMany({
      where: { userId },
      include: {
        reward: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      rewards,
      userRewards,
      userPoints
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json({ message: 'Error fetching rewards' }, { status: 500 })
  }
}
