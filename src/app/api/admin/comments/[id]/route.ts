import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
    const { status } = await request.json()
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be APPROVED or REJECTED' }, { status: 400 })
    }

    // Обновляем статус комментария
    const updatedComment = await prisma.contentComment.update({
      where: {
        id: parseInt(commentId)
      },
      data: {
        isApproved: status === 'APPROVED'
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
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id.toString(),
        status: updatedComment.isApproved ? 'APPROVED' : 'PENDING',
        user: updatedComment.User,
        article: updatedComment.Content
      }
    })

  } catch (error) {
    console.error('Error updating comment status:', error)
    return NextResponse.json(
      { error: 'Failed to update comment status' },
      { status: 500 }
    )
  }
}
