// src/app/api/admin/venues/filters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/venues/filters/[id] - получить фильтр по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})

    const filter = await prisma.venueFilter.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!filter) {
      return NextResponse.json(
        { error: 'Filter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(filter)
  } catch (error) {
    console.error('Error fetching venue filter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/venues/filters/[id] - обновить фильтр
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})

    const body = await request.json()
    const { name, key, isVisible, config, subcategoryId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    if (!subcategoryId) {
      return NextResponse.json(
        { error: 'Subcategory is required' },
        { status: 400 }
      )
    }

    const resolvedParams = await params;
    const filterId = parseInt(resolvedParams.id)

    // Проверяем, что фильтр существует
    const existingFilter = await prisma.venueFilter.findUnique({
      where: { id: filterId }
    })

    if (!existingFilter) {
      return NextResponse.json(
        { error: 'Filter not found' },
        { status: 404 }
      )
    }

    // Проверяем, что подкатегория существует
    const subcategory = await prisma.venueSubcategory.findUnique({
      where: { id: subcategoryId }
    })

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 400 }
      )
    }

    // Проверяем, что фильтр с таким ключом не существует в этой подкатегории (кроме текущего)
    const duplicateFilter = await prisma.venueFilter.findFirst({
      where: {
        key,
        subcategoryId,
        id: { not: filterId }
      }
    })

    if (duplicateFilter) {
      return NextResponse.json(
        { error: 'Filter with this key already exists in this subcategory' },
        { status: 400 }
      )
    }

    // Обновляем фильтр
    const filter = await prisma.venueFilter.update({
      where: { id: filterId },
      data: {
        name,
        key,
        isVisible: isVisible ?? true,
        config: config || {},
        subcategoryId
      },
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(filter)
  } catch (error) {
    console.error('Error updating venue filter:', error)
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/venues/filters/[id] - частично обновить фильтр (например, видимость)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})

    const body = await request.json()
    const resolvedParams = await params;
    const filterId = parseInt(resolvedParams.id)

    const filter = await prisma.venueFilter.update({
      where: { id: filterId },
      data: body,
      include: {
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(filter)
  } catch (error) {
    console.error('Error updating venue filter:', error)
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/venues/filters/[id] - удалить фильтр
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})

    const resolvedParams = await params;
    const filterId = parseInt(resolvedParams.id)

    // Проверяем, что фильтр существует
    const existingFilter = await prisma.venueFilter.findUnique({
      where: { id: filterId }
    })

    if (!existingFilter) {
      return NextResponse.json(
        { error: 'Filter not found' },
        { status: 404 }
      )
    }

    // Удаляем фильтр
    await prisma.venueFilter.delete({
      where: { id: filterId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue filter:', error)
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    )
  }
}
