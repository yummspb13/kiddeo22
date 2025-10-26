import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Получаем общее количество транзакций
    const totalTransactions = await prisma.pointsTransaction.count({
      where: {
        userId: parseInt(session.user.id)
      }
    })

    // Получаем транзакции с пагинацией
    const transactions = await prisma.pointsTransaction.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      include: {
        event: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    const totalPages = Math.ceil(totalTransactions / limit)

    return NextResponse.json({
      transactions,
      totalPages,
      totalTransactions,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
