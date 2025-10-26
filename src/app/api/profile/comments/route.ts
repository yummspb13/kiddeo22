import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    // Получаем комментарии пользователя к статьям
    const comments = await prisma.contentComment.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
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

    // Преобразуем данные в нужный формат
    const formattedComments = comments.map(comment => ({
      id: comment.id.toString(),
      eventTitle: comment.Content?.title || 'Статья удалена',
      venue: 'Статья', // Для статей указываем тип контента
      content: comment.text || '',
      isModerated: comment.isApproved,
      likes: 0, // Пока нет системы лайков для комментариев
      dislikes: 0,
      replies: 0, // Пока нет системы ответов
      createdAt: comment.createdAt.toISOString(),
      eventDate: comment.Content?.createdAt?.toISOString() || comment.createdAt.toISOString()
    }))

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length
    })

  } catch (error) {
    console.error('Error fetching user comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
