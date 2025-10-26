import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Увеличиваем счетчик кликов
    await prisma.heroSlot.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1
        }
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking hero slot click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
