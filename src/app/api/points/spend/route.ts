import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// Трата баллов на награду
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(String(session.user.id))
    const { rewardId, orderId } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ message: 'Reward ID is required' }, { status: 400 })
    }

    // Получаем информацию о награде
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    })

    if (!reward || !reward.isActive) {
      return NextResponse.json({ message: 'Reward not found or inactive' }, { status: 404 })
    }

    // Проверяем срок действия награды
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return NextResponse.json({ message: 'Reward has expired' }, { status: 400 })
    }

    // Получаем текущие баллы пользователя
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    })

    if (!userPoints) {
      return NextResponse.json({ message: 'User points not found' }, { status: 404 })
    }

    if (userPoints.points < reward.pointsCost) {
      return NextResponse.json({ 
        message: 'Insufficient points',
        required: reward.pointsCost,
        available: userPoints.points
      }, { status: 400 })
    }

    // Проверяем максимальное количество использований
    if (reward.maxUses) {
      const usedCount = await prisma.userReward.count({
        where: { rewardId, isUsed: true }
      })
      
      if (usedCount >= reward.maxUses) {
        return NextResponse.json({ message: 'Reward usage limit reached' }, { status: 400 })
      }
    }

    // Создаем запись о покупке награды
    const userReward = await prisma.userReward.create({
      data: {
        userId,
        rewardId,
        pointsSpent: reward.pointsCost,
        orderId
      }
    })

    // Обновляем баллы пользователя
    const updatedUserPoints = await prisma.userPoints.update({
      where: { userId },
      data: {
        points: { decrement: reward.pointsCost },
        totalSpent: { increment: reward.pointsCost }
      }
    })

    // Создаем транзакцию о трате баллов
    const transaction = await prisma.pointsTransaction.create({
      data: {
        userId,
        points: -reward.pointsCost,
        type: 'SPENT',
        category: 'reward',
        description: `Покупка награды: ${reward.name}`,
        orderId
      }
    })

    return NextResponse.json({
      userReward,
      userPoints: updatedUserPoints,
      transaction
    })
  } catch (error) {
    console.error('Error spending points:', error)
    return NextResponse.json({ message: 'Error spending points' }, { status: 500 })
  }
}
