import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Увеличиваем счетчик просмотров
    await prisma.heroSlot.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking hero slot view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
