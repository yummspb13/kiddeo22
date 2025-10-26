import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET - получить последнюю активность пользователя (отзывы)
export async function GET(request: NextRequest) {
  try {
    // Получаем userId из заголовка
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdInt = parseInt(userId)
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 })
    }

    console.log('🔍 GET /api/profile/recent-activity - UserId:', userIdInt)

    // Получаем последние 10 отзывов
    const reviews = await prisma.eventReview.findMany({
      where: {
        userId: userIdInt
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Получаем последние 5 активностей пользователя
    const behaviorEvents = await prisma.userBehaviorEvent.findMany({
      where: {
        userId: userIdInt
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Формируем активности из отзывов
    const reviewActivities = reviews.map(review => ({
      id: `review-${review.id}`,
      type: 'review',
      action: 'Оставлен отзыв на мероприятие',
      title: review.event.title,
      slug: review.event.slug,
      rating: review.rating,
      status: review.status,
      createdAt: review.createdAt
    }))

    // Формируем активности из событий поведения
    const behaviorActivities = behaviorEvents.map(event => {
      let action = 'Действие выполнено'
      let title = 'Активность'
      
      switch (event.eventType) {
        case 'user_registered':
          action = 'Вы зарегистрировались в системе'
          title = 'Регистрация'
          break
        case 'child_added':
          action = 'Добавлен ребенок'
          title = event.data?.childName || 'Ребенок'
          break
        case 'profile_updated':
          action = 'Обновлен профиль'
          title = 'Профиль'
          break
        case 'favorite_added':
          action = 'Добавлено в избранное'
          title = event.data?.listingTitle || 'Место'
          break
        case 'review_created':
          action = 'Оставлен отзыв на мероприятие'
          title = event.data?.eventTitle || 'Мероприятие'
          break
        case 'review_reply_received':
          action = 'Получен ответ на отзыв'
          title = event.data?.eventTitle || 'Мероприятие'
          break
        default:
          action = 'Выполнено действие'
          title = 'Активность'
      }

      return {
        id: `behavior-${event.id}`,
        type: 'behavior',
        action,
        title,
        slug: event.page,
        rating: null,
        status: 'COMPLETED',
        createdAt: event.createdAt
      }
    })

    // Объединяем и сортируем все активности
    const allActivities = [...reviewActivities, ...behaviorActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: allActivities })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
