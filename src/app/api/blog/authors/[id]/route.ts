import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Получаем автора по ID
    const author = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
      }
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      )
    }

    // Получаем статьи автора
    const posts = await prisma.content.findMany({
      where: {
        authorId: parseInt(id),
        type: 'blog',
        status: 'PUBLISHED'
      },
      include: {
        ContentCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        _count: {
          select: {
            ContentLike: true,
            ContentComment: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 10
    })

    // Форматируем автора
    const formattedAuthor = {
      id: author.id,
      name: author.name,
      email: author.email,
      image: author.image,
      bio: author.bio || 'Автор блога KidsReview',
      heroImage: author.heroImage || null,
      socialLinks: author.socialLinks || null,
      postCount: author._count.Content_Content_authorIdToUser,
      createdAt: author.createdAt
    }

    // Форматируем статьи
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
      publishedAt: post.publishedAt,
      readTime: Math.max(1, Math.ceil((post.content?.length || 0) / 1000)),
      viewCount: post.viewCount,
      likeCount: post._count.ContentLike,
      commentCount: post._count.ContentComment
    }))

    return NextResponse.json({
      author: formattedAuthor,
      posts: formattedPosts
    })
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    )
  }
}
