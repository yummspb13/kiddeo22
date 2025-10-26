// src/lib/loyalty.ts
import prisma from "@/lib/db"
import { LoyaltyAction, PromoCodeType } from "@prisma/client"

// Начисление баллов лояльности
export async function awardLoyaltyPoints(
  userId: number, 
  amount: number, 
  orderId: string,
  description?: string
): Promise<void> {
  // 1% от суммы заказа в баллах (1 балл = 10 копеек)
  const points = Math.floor(amount / 100)
  
  if (points <= 0) return

  // Создаем запись о начислении баллов
  await prisma.loyaltyPoint.create({
    data: {
      userId,
      action: 'EARN',
      points,
      orderId,
      description: description || `Начисление за заказ ${orderId}`,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 год
    }
  })

  // Обновляем баланс кошелька пользователя
  await updateUserWallet(userId, points, 0)
}

// Списание баллов лояльности
export async function spendLoyaltyPoints(
  userId: number,
  points: number,
  orderId: string,
  description?: string
): Promise<boolean> {
  const userWallet = await getUserWallet(userId)
  
  if (userWallet.balance < points) {
    return false // Недостаточно баллов
  }

  // Создаем запись о списании баллов
  await prisma.loyaltyPoint.create({
    data: {
      userId,
      action: 'SPEND',
      points: -points, // отрицательное значение для списания
      orderId,
      description: description || `Списание за заказ ${orderId}`
    }
  })

  // Обновляем баланс кошелька пользователя
  await updateUserWallet(userId, 0, points)
  
  return true
}

// Получение баланса пользователя
export async function getUserWallet(userId: number) {
  let wallet = await prisma.userWallet.findUnique({
    where: { userId }
  })

  if (!wallet) {
    // Создаем кошелек если его нет
    wallet = await prisma.userWallet.create({
      data: { userId }
    })
  }

  return wallet
}

// Обновление баланса кошелька
async function updateUserWallet(userId: number, earned: number, spent: number): Promise<void> {
  await prisma.userWallet.upsert({
    where: { userId },
    update: {
      balance: {
        increment: earned - spent
      },
      totalEarned: {
        increment: earned
      },
      totalSpent: {
        increment: spent
      },
      lastUpdatedAt: new Date()
    },
    create: {
      userId,
      balance: earned - spent,
      totalEarned: earned,
      totalSpent: spent
    }
  })
}

// Получение истории баллов
export async function getLoyaltyHistory(userId: number, limit: number = 50) {
  return await prisma.loyaltyPoint.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

// Создание промокода
export async function createPromoCode(data: {
  code: string
  type: PromoCodeType
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  validFrom: Date
  validUntil: Date
  applicableTo?: unknown
  description?: string
}) {
  return await prisma.promoCode.create({
    data
  })
}

// Применение промокода
export async function applyPromoCode(
  code: string,
  orderAmount: number,
  userId: number
): Promise<{ valid: boolean; discount: number; promoCode?: unknown }> {
  const promoCode = await prisma.promoCode.findFirst({
    where: {
      code,
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() }
    }
  })

  if (!promoCode) {
    return { valid: false, discount: 0 }
  }

  // Проверяем лимит использований
  if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
    return { valid: false, discount: 0 }
  }

  // Проверяем минимальную сумму заказа
  if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
    return { valid: false, discount: 0 }
  }

  // Рассчитываем скидку
  let discount = 0

  if (promoCode.type === 'PERCENTAGE') {
    discount = Math.floor(orderAmount * promoCode.value / 100)
  } else if (promoCode.type === 'FIXED_AMOUNT') {
    discount = promoCode.value
  } else if (promoCode.type === 'FREE_TICKET') {
    // Для бесплатного билета нужно знать цену билета
    // Пока что возвращаем 0
    discount = 0
  }

  // Применяем максимальную скидку
  if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
    discount = promoCode.maxDiscount
  }

  // Проверяем, что скидка не превышает сумму заказа
  discount = Math.min(discount, orderAmount)

  return {
    valid: true,
    discount,
    promoCode: {
      id: promoCode.id,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      description: promoCode.description
    }
  }
}

// Использование промокода (увеличение счетчика)
export async function usePromoCode(promoCodeId: string): Promise<void> {
  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: {
      usedCount: {
        increment: 1
      }
    }
  })
}

// Получение статистики лояльности
export async function getLoyaltyStats(userId: number) {
  const wallet = await getUserWallet(userId)
  
  const [totalEarned, totalSpent, activePoints] = await Promise.all([
    prisma.loyaltyPoint.aggregate({
      where: { userId, action: 'EARN' },
      _sum: { points: true }
    }),
    prisma.loyaltyPoint.aggregate({
      where: { userId, action: 'SPEND' },
      _sum: { points: true }
    }),
    prisma.loyaltyPoint.aggregate({
      where: { 
        userId, 
        action: 'EARN',
        expiresAt: { gt: new Date() }
      },
      _sum: { points: true }
    })
  ])

  return {
    balance: wallet.balance,
    totalEarned: totalEarned._sum.points || 0,
    totalSpent: Math.abs(totalSpent._sum.points || 0),
    activePoints: activePoints._sum.points || 0,
    totalEarnedMoney: wallet.totalEarned,
    totalSpentMoney: wallet.totalSpent
  }
}

// Очистка истекших баллов
export async function cleanupExpiredPoints(): Promise<void> {
  const expiredPoints = await prisma.loyaltyPoint.findMany({
    where: {
      action: 'EARN',
      expiresAt: { lt: new Date() },
      points: { gt: 0 }
    }
  })

  for (const point of expiredPoints) {
    // Создаем запись об истечении баллов
    await prisma.loyaltyPoint.create({
      data: {
        userId: point.userId,
        action: 'EXPIRE',
        points: -point.points,
        description: `Истечение баллов от ${point.createdAt.toLocaleDateString()}`
      }
    })

    // Обновляем баланс кошелька
    await updateUserWallet(point.userId, 0, point.points)
  }
}

// Получение топ пользователей по баллам
export async function getTopLoyaltyUsers(limit: number = 10) {
  return await prisma.userWallet.findMany({
    orderBy: { balance: 'desc' },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}
