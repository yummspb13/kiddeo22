import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Убрали withApiGuard и getServerSession для ускорения
// Получение информации о баллах пользователя
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Быстрая проверка JWT
    const token = request.cookies.get('session')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = await Promise.race([
      verifyJWT(token),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
    ]) as any
    
    if (!payload?.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(payload.sub)

    // Получаем или создаем запись о баллах пользователя
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

    // Получаем последние транзакции (упрощенная версия) с таймаутом
    let recentTransactions = [] as any[]
    try {
      console.log('🔍 Points API: Fetching transactions')
      recentTransactions = await Promise.race<any>([
        prisma.pointsTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        new Promise<any>((resolve) => setTimeout(() => resolve([]), 2000))
      ])
      console.log('🔍 Points API: Transactions found:', recentTransactions.length)
    } catch (transactionError) {
      console.error('Error fetching transactions:', transactionError)
      recentTransactions = []
    }

    // Получаем доступные награды (упрощенная версия)
    let availableRewards = []
    let usedRewards = []
    
    try {
      console.log('🔍 Points API: Fetching rewards')
      availableRewards = await Promise.race<any>([
        prisma.reward.findMany({
          where: { 
            isActive: true,
            pointsCost: { lte: userPoints.points }
          },
          orderBy: { pointsCost: 'asc' },
          take: 10
        }),
        new Promise<any>((resolve) => setTimeout(() => resolve([]), 2000))
      ])
      console.log('🔍 Points API: Rewards found:', availableRewards.length)
    } catch (rewardError) {
      console.error('Error fetching rewards:', rewardError)
      availableRewards = []
    }

    try {
      console.log('🔍 Points API: Fetching user rewards')
      usedRewards = await Promise.race<any>([
        prisma.userReward.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        new Promise<any>((resolve) => setTimeout(() => resolve([]), 2000))
      ])
      console.log('🔍 Points API: User rewards found:', usedRewards.length)
    } catch (userRewardError) {
      console.error('Error fetching user rewards:', userRewardError)
      usedRewards = []
    }

    // Проверяем, что userPoints существует
    if (!userPoints) {
      console.error('❌ Points API: userPoints is null')
      return NextResponse.json({ 
        message: 'User points not found',
        error: 'User points record not found'
      }, { status: 404 })
    }

    const response = {
      userPoints,
      recentTransactions,
      availableRewards,
      usedRewards
    }
    
    console.log('🔍 Points API: Returning response:', {
      userPoints: response.userPoints,
      transactionsCount: response.recentTransactions.length,
      rewardsCount: response.availableRewards.length,
      usedRewardsCount: response.usedRewards.length
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching points:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      message: 'Error fetching points',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Начисление баллов пользователю
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(String(session.user.id))
    const { points, category, description, eventId, orderId } = await request.json()

    if (!points || !category || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Получаем или создаем запись о баллах пользователя
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

    // Применяем бонус уровня
    const bonusMultiplier = getLevelBonus(userPoints.level)
    const finalPoints = Math.floor(points * bonusMultiplier)

    // Обновляем баллы пользователя
    const newPoints = userPoints.points + finalPoints
    const newTotalEarned = userPoints.totalEarned + finalPoints

    // Определяем новый уровень
    const newLevel = getUserLevel(newPoints)

    const updatedUserPoints = await prisma.userPoints.update({
      where: { userId },
      data: {
        points: newPoints,
        totalEarned: newTotalEarned,
        level: newLevel
      }
    })

    // Создаем запись о транзакции
    const transaction = await prisma.pointsTransaction.create({
      data: {
        userId,
        points: finalPoints,
        type: 'EARNED',
        category,
        description,
        eventId,
        orderId
      }
    })

    return NextResponse.json({
      userPoints: updatedUserPoints,
      transaction
    })
  } catch (error) {
    console.error('Error adding points:', error)
    return NextResponse.json({ message: 'Error adding points' }, { status: 500 })
  }
}

// Вспомогательные функции
function getUserLevel(points: number): 'NOVICE' | 'ACTIVE' | 'VIP' | 'PLATINUM' {
  if (points >= 20000) return 'PLATINUM'
  if (points >= 5000) return 'VIP'
  if (points >= 1000) return 'ACTIVE'
  return 'NOVICE'
}

function getLevelBonus(level: string): number {
  switch (level) {
    case 'NOVICE': return 1.0
    case 'ACTIVE': return 1.05
    case 'VIP': return 1.10
    case 'PLATINUM': return 1.20
    default: return 1.0
  }
}
