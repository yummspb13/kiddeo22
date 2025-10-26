import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Получаем все комментарии к статьям для модерации
    const comments = await prisma.contentComment.findMany({
      where: {
        isApproved: false // Только комментарии на модерации
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        Content: {
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Преобразуем данные для админки
    const formattedComments = comments.map(comment => ({
      id: comment.id.toString(),
      content: comment.text,
      status: comment.isApproved ? 'APPROVED' : 'PENDING',
      likes: 0, // Пока нет системы лайков
      dislikes: 0,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.User.id.toString(),
        name: comment.User.name,
        email: comment.User.email
      },
      article: {
        id: comment.Content.id.toString(),
        title: comment.Content.title,
        createdAt: comment.Content.createdAt.toISOString()
      }
    }))

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length
    })

  } catch (error) {
    console.error('Error fetching comments for moderation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
