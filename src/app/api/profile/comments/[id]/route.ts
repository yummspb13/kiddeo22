import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const commentId = params.id
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 })
    }

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Проверяем, что комментарий принадлежит пользователю
    const comment = await prisma.contentComment.findFirst({
      where: {
        id: parseInt(commentId),
        userId: parseInt(userId)
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found or access denied' }, { status: 404 })
    }

    // Удаляем комментарий
    await prisma.contentComment.delete({
      where: {
        id: parseInt(commentId)
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
