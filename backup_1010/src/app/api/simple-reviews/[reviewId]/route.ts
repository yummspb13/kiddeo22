import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params
    console.log('🔍 DELETE /api/simple-reviews/[reviewId] - ReviewId:', reviewId)

    // Удаляем отзыв (каскадное удаление удалит все связанные реакции и ответы)
    await prisma.eventReview.delete({
      where: {
        id: reviewId
      }
    })

    console.log('✅ Review deleted:', reviewId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting review:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
