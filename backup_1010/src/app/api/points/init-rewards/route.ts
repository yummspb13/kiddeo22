import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Инициализация базовых наград (только для админов)
export async function POST(request: NextRequest) {
  try {
    // Проверяем, есть ли уже награды
    const existingRewards = await prisma.reward.count()
    
    if (existingRewards > 0) {
      return NextResponse.json({ message: 'Rewards already initialized' }, { status: 400 })
    }

    // Создаем базовые награды
    const rewards = await prisma.reward.createMany({
      data: [
        {
          name: 'Скидка 10₽',
          description: 'Скидка 10 рублей на любой заказ',
          pointsCost: 100,
          type: 'DISCOUNT',
          value: 10,
          isActive: true
        },
        {
          name: 'Скидка 50₽',
          description: 'Скидка 50 рублей на любой заказ',
          pointsCost: 500,
          type: 'DISCOUNT',
          value: 50,
          isActive: true
        },
        {
          name: 'Скидка 100₽',
          description: 'Скидка 100 рублей на любой заказ',
          pointsCost: 1000,
          type: 'DISCOUNT',
          value: 100,
          isActive: true
        },
        {
          name: 'Бесплатный билет',
          description: 'Бесплатный билет до 1000 рублей',
          pointsCost: 1000,
          type: 'FREE_TICKET',
          value: 1000,
          isActive: true
        },
        {
          name: 'VIP статус на месяц',
          description: 'VIP статус с приоритетной поддержкой',
          pointsCost: 5000,
          type: 'VIP_STATUS',
          value: 30,
          isActive: true
        },
        {
          name: 'Подарок ребенку',
          description: 'Небольшой подарок для вашего ребенка',
          pointsCost: 200,
          type: 'GIFT',
          value: 200,
          isActive: true
        },
        {
          name: 'Эксклюзивный подарок',
          description: 'Эксклюзивный подарок для VIP пользователей',
          pointsCost: 2000,
          type: 'GIFT',
          value: 2000,
          isActive: true
        }
      ]
    })

    return NextResponse.json({
      message: 'Rewards initialized successfully',
      count: rewards.count
    })
  } catch (error) {
    console.error('Error initializing rewards:', error)
    return NextResponse.json({ message: 'Error initializing rewards' }, { status: 500 })
  }
}
