// src/app/api/admin/venues/filters/[id]/move-down/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// POST /api/admin/venues/filters/[id]/move-down - переместить фильтр вниз
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

    // Получаем следующий фильтр в том же порядке
    const nextFilter = await prisma.venueFilter.findFirst({
      where: {
        subcategoryId: currentFilter.subcategoryId,
        order: { gt: currentFilter.order }
      },
      orderBy: { order: 'asc' }
    })

    if (!nextFilter) {
      return NextResponse.json(
        { error: 'Cannot move filter down' },
        { status: 400 }
      )
    }

    // Меняем порядок местами
    await prisma.$transaction([
      prisma.venueFilter.update({
        where: { id: currentFilter.id },
        data: { order: nextFilter.order }
      }),
      prisma.venueFilter.update({
        where: { id: nextFilter.id },
        data: { order: currentFilter.order }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error moving filter down:', error)
    return NextResponse.json(
      { error: 'Failed to move filter down' },
      { status: 500 }
    )
  }
}
