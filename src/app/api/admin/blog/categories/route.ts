import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET - Получить все категории блога
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [categories, total] = await Promise.all([
      prisma.contentCategory.findMany({
        where,
        include: {
          _count: {
            select: {
              Content: {
                where: {
                  type: 'blog',
                  status: 'PUBLISHED'
                }
              }
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.contentCategory.count({ where })
    ])

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      postCount: category._count.Content,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json({
      categories: formattedCategories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    )
  }
}

// POST - Создать новую категорию блога
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      color,
      sortOrder = 0,
      isActive = true
    } = body

    // Проверяем, что название уникально
    const existingCategory = await prisma.contentCategory.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name or slug already exists' },
        { status: 400 }
      )
    }

    // Создаем новую категорию
    const category = await prisma.contentCategory.create({
      data: {
        name,
        slug,
        description,
        color,
        sortOrder,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            Content: {
              where: {
                type: 'blog',
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        postCount: category._count.Content,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })
  } catch (error) {
    console.error('Error creating blog category:', error)
    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    )
  }
}
