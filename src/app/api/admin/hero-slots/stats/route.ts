import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!requireAdminOrDevKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Получаем все рекламные слоты
    const heroSlots = await prisma.heroSlot.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Подсчитываем статистику
    const activeSlots = heroSlots.filter(slot => slot.isActive).length
    const totalViews = heroSlots.reduce((sum, slot) => sum + slot.viewCount, 0)
    const totalClicks = heroSlots.reduce((sum, slot) => sum + slot.clickCount, 0)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

    const stats = {
      activeSlots,
      totalViews,
      totalClicks,
      ctr: Math.round(ctr * 10) / 10, // Округляем до 1 знака после запятой
      totalSlots: heroSlots.length
    }

    console.log('Hero slots stats:', stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching hero slots stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
