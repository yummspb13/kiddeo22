import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Получаем категории, которые используются в блоге
    const categories = await prisma.contentCategory.findMany({
      where: {
        isActive: true,
        Content: {
          some: {
            type: 'blog',
            status: 'PUBLISHED'
          }
        }
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
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    // Форматируем данные
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      postCount: category._count.Content
    }))

    return NextResponse.json({
      categories: formattedCategories
    })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    )
  }
}
