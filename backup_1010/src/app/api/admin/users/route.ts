import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

// GET /api/admin/users - получить всех пользователей с фильтрацией и пагинацией
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Строим условия фильтрации
    const where: any = {}

    // Поиск по имени и email
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Фильтр по роли
    if (role) {
      where.role = role
    }

    // Фильтр по статусу (активность)
    if (status === 'active') {
      where.emailVerified = { not: null }
    } else if (status === 'inactive') {
      where.emailVerified = null
    }

    // Получаем пользователей с дополнительной информацией
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          RoleAssignment: {
            select: {
              id: true,
              role: true,
              scopeType: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              bookings: true,
              RoleAssignment: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Обогащаем данные
    const enrichedUsers = users.map(user => {
      return {
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
          reviewsCount: 0,
          commentsCount: 0,
          favoritesCount: 0,
          loyaltyPoints: 0,
          roleAssignmentsCount: user._count.RoleAssignment
        },
        roleAssignments: user.RoleAssignment,
        isActive: !!user.emailVerified,
        lastActivity: user.updatedAt
      }
    })

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users - создать нового пользователя
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const body = await request.json()
    const { email, name, role = 'USER', sendWelcomeEmail = false } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Проверяем, что пользователь с таким email не существует
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        emailVerified: new Date() // Админ создает пользователя как верифицированного
      },
      include: {
        _count: {
          select: {
            bookings: true,
            RoleAssignment: true
          }
        }
      }
    })

    // TODO: Отправить приветственное письмо если sendWelcomeEmail = true

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      isActive: true
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ 
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
