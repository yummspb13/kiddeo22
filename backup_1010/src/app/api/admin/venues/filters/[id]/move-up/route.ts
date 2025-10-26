// src/app/api/admin/venues/filters/[id]/move-up/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

// POST /api/admin/venues/filters/[id]/move-up - переместить фильтр вверх
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})

    const resolvedParams = await params;
    const filterId = parseInt(resolvedParams.id)

    // Получаем текущий фильтр
    const currentFilter = await prisma.venueFilter.findUnique({
      where: { id: filterId }
    })

    if (!currentFilter) {
      return NextResponse.json(
        { error: 'Filter not found' },
        { status: 404 }
      )
    }

    // Получаем предыдущий фильтр в том же порядке
    const previousFilter = await prisma.venueFilter.findFirst({
      where: {
        subcategoryId: currentFilter.subcategoryId,
        order: { lt: currentFilter.order }
      },
      orderBy: { order: 'desc' }
    })

    if (!previousFilter) {
      return NextResponse.json(
        { error: 'Cannot move filter up' },
        { status: 400 }
      )
    }

    // Меняем порядок местами
    await prisma.$transaction([
      prisma.venueFilter.update({
        where: { id: currentFilter.id },
        data: { order: previousFilter.order }
      }),
      prisma.venueFilter.update({
        where: { id: previousFilter.id },
        data: { order: currentFilter.order }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error moving filter up:', error)
    return NextResponse.json(
      { error: 'Failed to move filter up' },
      { status: 500 }
    )
  }
}
