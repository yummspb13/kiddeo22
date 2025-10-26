import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить список заказов
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-orders - UserId:', userId)

    // Временно возвращаем пустой список заказов
    // TODO: Исправить запрос к базе данных после отладки схемы
    const orders: unknown[] = []

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
