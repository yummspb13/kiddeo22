import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    // Проверяем, существует ли отзыв и принадлежит ли он пользователю
    const review = await prisma.venueReview.findUnique({
      where: { id: reviewId },
      include: {
        reactions: true,
        replies: true
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Удаляем отзыв (каскадное удаление удалит реакции и ответы)
    await prisma.venueReview.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
