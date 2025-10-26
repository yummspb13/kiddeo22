import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log('Blog Posts API: Starting request')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Построение условий фильтрации
    const where: any = {
      type: 'blog'
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Получение статей с пагинацией
    const queryStartTime = Date.now()
    console.log('Blog Posts API: Starting database queries')
    const [posts, totalCount] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          ContentCategory: true,
          User_Content_authorIdToUser: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          // Убираем _count для оптимизации - лайки и комментарии можно загружать отдельно при необходимости
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.content.count({ where })
    ])

    const queryEndTime = Date.now()
    console.log(`Blog Posts API: Database queries completed in ${queryEndTime - queryStartTime}ms`)
    console.log(`Blog Posts API: Found ${posts.length} posts, total: ${totalCount}`)

    // Форматирование данных
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      category: post.ContentCategory ? {
        name: post.ContentCategory.name,
        slug: post.ContentCategory.slug
      } : null,
      author: {
        id: post.User_Content_authorIdToUser.id,
        name: post.User_Content_authorIdToUser.name || 'Автор',
        image: post.User_Content_authorIdToUser.image
      },
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      viewCount: post.viewCount,
      likeCount: 0, // Убрано для оптимизации
      commentCount: 0, // Убрано для оптимизации
      featuredImage: post.featuredImage
    }))

    const totalTime = Date.now() - startTime
    console.log(`Blog Posts API: Total time: ${totalTime}ms`)
    console.log(`Blog Posts API: Returning ${formattedPosts.length} formatted posts`)

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
    console.error('Error fetching admin blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      authorId,
      cityId,
      status = 'DRAFT',
      seoTitle,
      seoDescription,
      seoKeywords,
      priority = 'NORMAL'
    } = body

    // Проверяем, что slug уникален
    const existingPost = await prisma.content.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 400 }
      )
    }

    // Создаем статью
    const post = await prisma.content.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        type: 'blog',
        status,
        priority,
        categoryId: categoryId ? parseInt(categoryId) : null,
        authorId: parseInt(authorId),
        cityId: cityId ? parseInt(cityId) : null,
        seoTitle,
        seoDescription,
        seoKeywords,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        ContentCategory: true,
        User_Content_authorIdToUser: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        category: post.ContentCategory ? {
          name: post.ContentCategory.name,
          slug: post.ContentCategory.slug
        } : null,
        author: {
          id: post.User_Content_authorIdToUser.id,
          name: post.User_Content_authorIdToUser.name || 'Автор',
          image: post.User_Content_authorIdToUser.image
        },
        publishedAt: post.publishedAt,
        createdAt: post.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

