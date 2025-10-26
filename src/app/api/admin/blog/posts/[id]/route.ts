import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.content.findUnique({
      where: {
        id: parseInt(id),
        type: 'blog'
      },
      include: {
        ContentCategory: true,
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

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        status: post.status,
        priority: post.priority,
        category: post.ContentCategory ? {
          id: post.ContentCategory.id,
          name: post.ContentCategory.name,
          slug: post.ContentCategory.slug
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
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        viewCount: post.viewCount,
        likeCount: post._count.ContentLike,
        commentCount: post._count.ContentComment,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        seoKeywords: post.seoKeywords
      }
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      cityId,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      priority
    } = body

    // Проверяем, что slug уникален (если изменился)
    const currentPost = await prisma.content.findUnique({
      where: { id: parseInt(id) }
    })

    if (currentPost?.slug !== slug) {
      const existingPost = await prisma.content.findUnique({
        where: { slug }
      })

      if (existingPost) {
        return NextResponse.json(
          { error: 'Post with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Обновляем статью
    const post = await prisma.content.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        categoryId: categoryId ? parseInt(categoryId) : null,
        cityId: cityId ? parseInt(cityId) : null,
        status,
        priority,
        seoTitle,
        seoDescription,
        seoKeywords,
        publishedAt: status === 'PUBLISHED' && !currentPost?.publishedAt ? new Date() : currentPost?.publishedAt,
        updatedAt: new Date()
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
        updatedAt: post.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Удаляем статью
    await prisma.content.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}

