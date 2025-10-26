import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      )
    }

    // Получаем комментарии с авторами
    const comments = await prisma.contentComment.findMany({
      where: {
        contentId: parseInt(contentId),
        isApproved: true,
        parentId: null // Только корневые комментарии
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        other_ContentComment: {
          where: {
            isApproved: true
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Форматируем комментарии
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      author: {
        id: comment.User.id,
        name: comment.User.name || 'Пользователь',
        image: comment.User.image
      },
      createdAt: comment.createdAt,
      replies: comment.other_ContentComment.map(reply => ({
        id: reply.id,
        text: reply.text,
        author: {
          id: reply.User.id,
          name: reply.User.name || 'Пользователь',
          image: reply.User.image
        },
        createdAt: reply.createdAt
      }))
    }))

    return NextResponse.json({
      comments: formattedComments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, userId, text, parentId } = body

    if (!contentId || !userId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли статья
    const post = await prisma.content.findUnique({
      where: {
        id: parseInt(contentId),
        type: 'blog',
        status: 'PUBLISHED'
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Если это ответ на комментарий, проверяем существование родительского комментария
    if (parentId) {
      const parentComment = await prisma.contentComment.findUnique({
        where: { id: parseInt(parentId) }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Создаем комментарий
    const comment = await prisma.contentComment.create({
      data: {
        contentId: parseInt(contentId),
        userId: parseInt(userId),
        text: text.trim(),
        parentId: parentId ? parseInt(parentId) : null,
        isApproved: true, // Автоматически одобряем комментарии
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Обновляем счетчик комментариев в статье
    await prisma.content.update({
      where: { id: parseInt(contentId) },
      data: {
        commentCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        text: comment.text,
        author: {
          id: comment.User.id,
          name: comment.User.name || 'Пользователь',
          image: comment.User.image
        },
        createdAt: comment.createdAt,
        parentId: comment.parentId
      }
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
