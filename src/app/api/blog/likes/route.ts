import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, userId, action } = body

    if (!contentId || !userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "like" or "unlike"' },
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

    if (action === 'like') {
      // Добавляем лайк (upsert для избежания дубликатов)
      await prisma.contentLike.upsert({
        where: {
          contentId_userId: {
            contentId: parseInt(contentId),
            userId: parseInt(userId)
          }
        },
        update: {},
        create: {
          contentId: parseInt(contentId),
          userId: parseInt(userId)
        }
      })
    } else {
      // Удаляем лайк
      await prisma.contentLike.deleteMany({
        where: {
          contentId: parseInt(contentId),
          userId: parseInt(userId)
        }
      })
    }

    // Получаем обновленное количество лайков
    const likeCount = await prisma.contentLike.count({
      where: { contentId: parseInt(contentId) }
    })

    return NextResponse.json({
      success: true,
      likeCount,
      isLiked: action === 'like'
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')
    const userId = searchParams.get('userId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      )
    }

    // Получаем количество лайков
    const likeCount = await prisma.contentLike.count({
      where: { contentId: parseInt(contentId) }
    })

    let isLiked = false
    if (userId) {
      // Проверяем, лайкнул ли пользователь
      const userLike = await prisma.contentLike.findUnique({
        where: {
          contentId_userId: {
            contentId: parseInt(contentId),
            userId: parseInt(userId)
          }
        }
      })
      isLiked = !!userLike
    }

    return NextResponse.json({
      likeCount,
      isLiked
    })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    )
  }
}
