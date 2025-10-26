import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { 
  createApiResponse, 
  createApiError, 
  getPaginationParams,
  safePrismaOperation
} from '@/lib/api-utils'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return createApiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Получаем общее количество заказов
    const totalOrders = await prisma.order.count({
      where: {
        userId: parseInt(session.user.id)
      }
    })

    // Получаем заказы с пагинацией
    let orders = []
    try {
      orders = await prisma.order.findMany({
        where: {
          userId: parseInt(session.user.id)
        },
        include: {
          OrderItem: {
            include: {
              EventTicketType: {
                select: {
                  id: true,
                  name: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      })
    } catch (dbError) {
      console.error('Database error fetching orders:', dbError)
      // Если есть ошибка с базой данных, возвращаем пустой массив
      orders = []
    }

    // Обрабатываем заказы, чтобы избежать ошибок с отсутствующими данными
    const processedOrders = orders.map(order => ({
      ...order,
      OrderItem: order.OrderItem.map(item => ({
        ...item,
        listing: item.listing || {
          id: 0,
          title: 'Товар недоступен',
          price: item.unitPrice,
          currency: order.currency
        }
      }))
    }))

    const totalPages = Math.ceil(totalOrders / limit)

    return NextResponse.json({
      orders: processedOrders,
      totalPages,
      totalOrders,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
