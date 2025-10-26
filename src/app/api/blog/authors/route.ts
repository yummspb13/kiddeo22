import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Построение условий фильтрации
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Получение авторов с пагинацией
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
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Форматирование данных
    const formattedAuthors = authors.map(author => ({
      id: author.id,
      name: author.name,
      email: author.email,
      image: author.image,
      bio: author.bio || 'Автор блога KidsReview',
      heroImage: author.heroImage || null,
      socialLinks: author.socialLinks || null,
      postCount: author._count.Content_Content_authorIdToUser,
      createdAt: author.createdAt
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
