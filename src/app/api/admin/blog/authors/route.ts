import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Построение условий поиска
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Получение авторов с подсчетом статей
    const [authors, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              Content_Content_authorIdToUser: {
                where: {
                  type: 'blog',
                  status: 'PUBLISHED'
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Форматирование данных
    const formattedAuthors = authors.map(author => ({
      id: author.id,
      name: author.name || 'Без имени',
      email: author.email,
      image: author.image,
      bio: author.bio,
      heroImage: author.heroImage,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      postCount: author._count.Content_Content_authorIdToUser
    }))

    return NextResponse.json({
      authors: formattedAuthors,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      image,
      bio,
      heroImage
    } = body

    // Проверяем, что email уникален
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Создаем нового автора
    const author = await prisma.user.create({
      data: {
        name,
        email,
        image,
        bio: bio || null,
        heroImage: heroImage || null,
        role: 'USER', // Роль пользователя
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        image: author.image,
        bio: author.bio,
        heroImage: author.heroImage,
        createdAt: author.createdAt,
        updatedAt: author.updatedAt,
        postCount: 0
      }
    })
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    )
  }
}
