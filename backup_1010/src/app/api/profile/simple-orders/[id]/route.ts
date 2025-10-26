import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - получить детали заказа
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const orderId = parseInt((await params).id)
    const userIdInt = parseInt(userId)
    
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/simple-orders/[id] - UserId:', userId, 'OrderId:', orderId)

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId.toString(),
        userId: userIdInt
      },
        include: {
          OrderItem: {
            include: {
              EventTicketType: true
            }
          }
        }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
