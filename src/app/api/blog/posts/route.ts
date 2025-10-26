import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    console.log('Search query:', search)

    const skip = (page - 1) * limit

    // Построение условий фильтрации
    const where: any = {
      type: 'blog',
      status: 'PUBLISHED'
    }

    if (category && category !== 'all') {
      where.ContentCategory = {
        slug: category
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
        { seoTitle: { contains: search } },
        { seoDescription: { contains: search } },
        { seoKeywords: { contains: search } }
      ]
    }

    if (featured === 'true') {
      where.priority = 'HIGH'
    }

    // Получение статей с пагинацией
    const [posts, totalCount] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          ContentCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          User_Content_authorIdToUser: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          City: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              ContentLike: true,
              ContentComment: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.content.count({ where })
    ])

    // Форматирование данных
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      category: post.ContentCategory ? {
        id: post.ContentCategory.id,
        name: post.ContentCategory.name,
        slug: post.ContentCategory.slug,
        color: post.ContentCategory.color
      } : null,
      author: {
        id: post.User_Content_authorIdToUser.id,
        name: post.User_Content_authorIdToUser.name || 'Автор',
        image: post.User_Content_authorIdToUser.image
      },
      city: post.City ? {
        id: post.City.id,
        name: post.City.name,
        slug: post.City.slug
      } : null,
      publishedAt: post.publishedAt,
      readTime: Math.max(1, Math.ceil((post.content?.length || 0) / 1000)), // Примерный расчет времени чтения
      viewCount: post.viewCount,
      likeCount: post._count.ContentLike,
      commentCount: post._count.ContentComment,
      isFeatured: post.priority === 'HIGH'
    }))

    return NextResponse.json({
      posts: formattedPosts,
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
    console.error('Error fetching blog posts:', error)
    console.error('Search query:', search)
    console.error('Where clause:', where)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts', details: error.message },
      { status: 500 }
    )
  }
}
