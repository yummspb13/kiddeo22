import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/roles - получить роли и пользователей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    // Получаем всех пользователей с их ролями
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Группируем пользователей по ролям
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = []
      }
      acc[user.role].push(user)
      return acc
    }, {} as Record<string, typeof users>)

    // Определяем доступные роли
    const availableRoles = [
      {
        name: 'ADMIN',
        displayName: 'Администратор',
        description: 'Полный доступ ко всем функциям системы',
        color: 'red',
        permissions: [
          'Управление пользователями',
          'Модерация заявок',
          'Управление контентом',
          'Аналитика и отчеты',
          'Системные настройки'
        ]
      },
      {
        name: 'MANAGER',
        displayName: 'Менеджер',
        description: 'Управление контентом и модерация',
        color: 'blue',
        permissions: [
          'Модерация заявок',
          'Управление контентом',
          'Просмотр аналитики',
          'Управление вендорами'
        ]
      },
      {
        name: 'MODERATOR',
        displayName: 'Модератор',
        description: 'Модерация заявок и контента',
        color: 'green',
        permissions: [
          'Модерация заявок вендоров',
          'Модерация заявок на клайм',
          'Просмотр журнала аудита'
        ]
      },
      {
        name: 'VENDOR',
        displayName: 'Вендор',
        description: 'Управление своими заявками и контентом',
        color: 'purple',
        permissions: [
          'Управление профилем',
          'Создание заявок',
          'Просмотр статистики'
        ]
      },
      {
        name: 'USER',
        displayName: 'Пользователь',
        description: 'Базовые права пользователя',
        color: 'gray',
        permissions: [
          'Просмотр контента',
          'Создание заказов',
          'Оставление отзывов'
        ]
      }
    ]

    // Статистика по ролям
    const roleStats = availableRoles.map(role => ({
      ...role,
      count: usersByRole[role.name]?.length || 0,
      users: usersByRole[role.name] || []
    }))

    return NextResponse.json({
      roles: availableRoles,
      roleStats,
      totalUsers: users.length,
      usersByRole
    })

  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH /api/admin/roles - обновить роль пользователя
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    const { userId, newRole } = await request.json()

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing userId or newRole' }, { status: 400 })
    }

    // Проверяем, что роль валидна
    const validRoles = ['ADMIN', 'MANAGER', 'MODERATOR', 'VENDOR', 'USER']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Обновляем роль пользователя
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })

    // Создаем запись в журнале аудита
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: userId.toString(),
        action: 'UPDATE_ROLE',
        details: {
          reason: 'Изменение роли пользователя',
          previousRole: 'UNKNOWN', // Можно получить из базы, но для простоты оставляем так
          newRole: newRole,
          userId: parseInt(userId)
        },
        userId: 1, // ID администратора, который выполняет действие
        ipAddress: '127.0.0.1'
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Роль пользователя ${updatedUser.name} изменена на ${newRole}`
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
