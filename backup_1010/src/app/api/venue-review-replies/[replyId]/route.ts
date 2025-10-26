import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { replyId: string } }
) {
  try {
    const { replyId } = params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    // Проверяем, существует ли ответ и принадлежит ли он пользователю
    const reply = await prisma.venueReviewReply.findUnique({
      where: { id: replyId }
    })

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    }

    if (reply.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Удаляем ответ
    await prisma.venueReviewReply.delete({
      where: { id: replyId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue review reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
