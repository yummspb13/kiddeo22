import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Получаем статью по slug
    const post = await prisma.content.findUnique({
      where: {
        slug,
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
        User_Content_authorIdToUser: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
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
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Увеличиваем счетчик просмотров
    await prisma.content.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    // Получаем похожие статьи
    const relatedPosts = await prisma.content.findMany({
      where: {
        type: 'blog',
        status: 'PUBLISHED',
        id: { not: post.id },
        OR: [
          { categoryId: post.categoryId },
          { ContentCategory: { slug: post.ContentCategory?.slug } }
        ]
      },
      include: {
        ContentCategory: {
          select: {
            name: true,
            slug: true
          }
        },
        User_Content_authorIdToUser: {
          select: {
            name: true,
            image: true
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
      take: 3
    })

    // Форматируем основную статью
    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
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
        image: post.User_Content_authorIdToUser.image,
        email: post.User_Content_authorIdToUser.email
      },
      city: post.City ? {
        id: post.City.id,
        name: post.City.name,
        slug: post.City.slug
      } : null,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      readTime: Math.max(1, Math.ceil((post.content?.length || 0) / 1000)),
      viewCount: post.viewCount + 1, // Уже увеличенный счетчик
      likeCount: post._count.ContentLike,
      commentCount: post._count.ContentComment,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      seoKeywords: post.seoKeywords,
      isFeatured: post.priority === 'HIGH'
    }

    // Форматируем похожие статьи
    const formattedRelatedPosts = relatedPosts.map(relatedPost => ({
      id: relatedPost.id,
      title: relatedPost.title,
      slug: relatedPost.slug,
      excerpt: relatedPost.excerpt,
      featuredImage: relatedPost.featuredImage,
      category: relatedPost.ContentCategory?.name || 'Без категории',
      author: {
        name: relatedPost.User_Content_authorIdToUser.name || 'Автор',
        image: relatedPost.User_Content_authorIdToUser.image
      },
      publishedAt: relatedPost.publishedAt,
      readTime: Math.max(1, Math.ceil((relatedPost.content?.length || 0) / 1000)),
      likeCount: relatedPost._count.ContentLike,
      commentCount: relatedPost._count.ContentComment
    }))

    return NextResponse.json({
      post: formattedPost,
      relatedPosts: formattedRelatedPosts
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}
