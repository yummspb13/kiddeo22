import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { type } = await request.json()
    const { id } = await params
    const popularEventId = id

    if (!['view', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Обновляем счетчик просмотров или кликов
    const updateField = type === 'view' ? 'viewCount' : 'clickCount'
    
    await prisma.popularEvent.update({
      where: { id: parseInt(popularEventId) },
      data: {
        [updateField]: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating stats:', error)
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
  }
}