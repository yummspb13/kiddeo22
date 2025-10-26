import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - увеличить счетчик кликов
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const heroSlot = await prisma.heroSlot.update({
      where: { id },
      data: { clickCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true, clickCount: heroSlot.clickCount })

  } catch (error) {
    console.error('Error updating click count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
