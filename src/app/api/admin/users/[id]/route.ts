import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/users/[id] - получить пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    await requireAdminOrDevKey({ key })
    
    const { id } = await params
    const userId = id

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        _count: {
          select: {
            bookings: true,
            RoleAssignment: true,
            UserBehaviorEvent: true,
            favorites: true
          }
        },
        userPoints: true
      }
    })


    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем последнюю активность
    const lastActivity = await prisma.userBehaviorEvent.findFirst({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, eventType: true }
    })

    // Получаем статистику лояльности
    const loyaltyPoints = user.userPoints?.points || 0

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        bookingsCount: user._count.bookings,
        reviewsCount: 0, // Пока не считаем отзывы
        commentsCount: 0, // Пока нет комментариев
        favoritesCount: user._count.favorites,
        loyaltyPoints,
        roleAssignmentsCount: user._count.RoleAssignment,
        behaviorEventsCount: user._count.UserBehaviorEvent
      },
      roleAssignments: user.RoleAssignment,
      notificationSettings: user.UserNotificationSettings,
      subscriptions: user.UserSubscription,
      isActive: !!user.emailVerified,
      lastActivity: lastActivity?.createdAt || user.updatedAt,
      lastActivityType: lastActivity?.eventType
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - обновить пользователя
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    
    const { id } = await params
    const userId = id

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, role, emailVerified, isActive } = body

    // Проверяем, что пользователь существует
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Подготавливаем данные для обновления
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified ? new Date() : null
    }
    if (isActive !== undefined) {
      updateData.emailVerified = isActive ? new Date() : null
    }

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      include: {
        _count: {
          select: {
            bookings: true,
            RoleAssignment: true
          }
        }
      }
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: !!user.emailVerified
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    
    const { id } = await params
    const userId = id

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Проверяем, что пользователь существует
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем, что это не последний админ
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })
      
      if (adminCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot delete the last admin user' 
        }, { status: 400 })
      }
    }

    // Удаляем пользователя (каскадное удаление настроено в схеме)
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
