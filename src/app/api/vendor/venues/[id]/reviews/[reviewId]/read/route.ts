import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth-server'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, reviewId } = await params
    const venueId = parseInt(id)

    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 })
    }

    // Проверяем, что вендор имеет доступ к этому месту
    const venue = await prisma.venuePartner.findFirst({
      where: {
        id: venueId,
        vendor: {
          userId: parseInt(session.user.id)
        }
      }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 404 })
    }

    // Проверяем, что отзыв существует
    const review = await prisma.venueReview.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Здесь можно добавить логику для отметки отзыва как прочитанного
    // Например, создать запись в таблице VenueReviewRead или обновить статус
    // Пока просто возвращаем успех

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking review as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
