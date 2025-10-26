import { prisma } from '@/lib/db'

export interface AddPointsParams {
  userId: number
  points: number
  category: string
  description: string
  eventId?: string
  orderId?: string
}

export async function addPoints({
  userId,
  points,
  category,
  description,
  eventId,
  orderId
}: AddPointsParams) {
  try {
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

    return {
      success: true,
      userPoints: updatedUserPoints,
      transaction
    }
  } catch (error) {
    console.error('Error adding points:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function getUserLevel(points: number): 'NOVICE' | 'ACTIVE' | 'VIP' | 'PLATINUM' {
  if (points >= 10000) return 'PLATINUM'
  if (points >= 5000) return 'VIP'
  if (points >= 1000) return 'ACTIVE'
  return 'NOVICE'
}

export function getLevelBonus(level: string): number {
  switch (level) {
    case 'NOVICE': return 1.0
    case 'ACTIVE': return 1.05
    case 'VIP': return 1.10
    case 'PLATINUM': return 1.15
    default: return 1.0
  }
}

// Функция для списания баллов
export async function deductPoints({
  userId,
  points,
  category,
  description,
  eventId,
  orderId
}: AddPointsParams) {
  try {
    // Получаем текущие баллы пользователя
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    })

    if (!userPoints) {
      return {
        success: false,
        error: 'User points not found'
      }
    }

    // Проверяем, достаточно ли баллов для списания
    if (userPoints.points < points) {
      return {
        success: false,
        error: 'Insufficient points'
      }
    }

    // Списываем баллы
    const newPoints = userPoints.points - points
    const newTotalSpent = userPoints.totalSpent + points

    // Определяем новый уровень (может понизиться)
    const newLevel = getUserLevel(newPoints)

    const updatedUserPoints = await prisma.userPoints.update({
      where: { userId },
      data: {
        points: newPoints,
        totalSpent: newTotalSpent,
        level: newLevel
      }
    })

    // Создаем запись о транзакции списания
    const transaction = await prisma.pointsTransaction.create({
      data: {
        userId,
        points: -points, // Отрицательное значение для списания
        type: 'SPENT',
        category,
        description,
        eventId,
        orderId
      }
    })

    return {
      success: true,
      userPoints: updatedUserPoints,
      transaction
    }
  } catch (error) {
    console.error('Error deducting points:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Предопределенные категории баллов
export const POINTS_CATEGORIES = {
  REGISTRATION: 'registration',
  PROFILE_COMPLETE: 'profile_complete',
  ADD_CHILD: 'add_child',
  WRITE_REVIEW: 'write_review',
  RATE_VENUE: 'rate_venue',
  PURCHASE: 'purchase',
  INVITE_FRIEND: 'invite_friend',
  WEEKLY_ACTIVITY: 'weekly_activity',
  BIRTHDAY_BONUS: 'birthday_bonus',
  HOLIDAY_BONUS: 'holiday_bonus'
} as const

// Предопределенные значения баллов
export const POINTS_VALUES = {
  REGISTRATION: 100,
  PROFILE_COMPLETE: 50,
  ADD_CHILD: 25,
  WRITE_REVIEW: 10,
  RATE_VENUE: 5,
  PURCHASE_PER_RUBLE: 1,
  INVITE_FRIEND: 200,
  WEEKLY_ACTIVITY: 20,
  BIRTHDAY_BONUS: 50,
  HOLIDAY_BONUS: 100
} as const
