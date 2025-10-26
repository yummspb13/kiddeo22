// src/app/api/admin/venues/parameters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/venues/parameters/[id] - получить параметр по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})

    const parameter = await prisma.venueParameter.findUnique({
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

    if (!parameter) {
      return NextResponse.json(
        { error: 'Parameter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(parameter)
  } catch (error) {
    console.error('Error fetching venue parameter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parameter' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/venues/parameters/[id] - обновить параметр
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params

    const body = await request.json()
    const { name, type, config, isFree, isOptimal, isMaximum, isActive, subcategoryId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!subcategoryId) {
      return NextResponse.json(
        { error: 'Subcategory is required' },
        { status: 400 }
      )
    }

    const parameterId = id

    // Проверяем, что параметр существует
    const existingParameter = await prisma.venueParameter.findUnique({
      where: { id: parseInt(parameterId) }
    })

    if (!existingParameter) {
      return NextResponse.json(
        { error: 'Parameter not found' },
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

    // Проверяем, что параметр с таким именем не существует в этой подкатегории (кроме текущего)
    const duplicateParameter = await prisma.venueParameter.findFirst({
      where: {
        name,
        subcategoryId,
        id: { not: parseInt(parameterId) }
      }
    })

    if (duplicateParameter) {
      return NextResponse.json(
        { error: 'Parameter with this name already exists in this subcategory' },
        { status: 400 }
      )
    }

    // Обновляем параметр
    const parameter = await prisma.venueParameter.update({
      where: { id: parseInt(parameterId) },
      data: {
        name,
        type,
        config: config ? JSON.stringify(config) : null,
        isFree: isFree || false,
        isOptimal: isOptimal || false,
        isMaximum: isMaximum || false,
        isActive: isActive ?? true,
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

    return NextResponse.json(parameter)
  } catch (error) {
    console.error('Error updating venue parameter:', error)
    return NextResponse.json(
      { error: 'Failed to update parameter' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/venues/parameters/[id] - частично обновить параметр (например, статус)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params

    const body = await request.json()
    const parameterId = id

    const parameter = await prisma.venueParameter.update({
      where: { id: parseInt(parameterId) },
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

    return NextResponse.json(parameter)
  } catch (error) {
    console.error('Error updating venue parameter:', error)
    return NextResponse.json(
      { error: 'Failed to update parameter' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/venues/parameters/[id] - удалить параметр
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params

    const parameterId = id

    // Проверяем, что параметр существует
    const existingParameter = await prisma.venueParameter.findUnique({
      where: { id: parseInt(parameterId) },
      include: {
        partnerValues: true
      }
    })

    if (!existingParameter) {
      return NextResponse.json(
        { error: 'Parameter not found' },
        { status: 404 }
      )
    }

    // Проверяем, что у параметра нет значений от партнеров
    if (existingParameter.partnerValues.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete parameter with partner values' },
        { status: 400 }
      )
    }

    // Удаляем параметр
    await prisma.venueParameter.delete({
      where: { id: parseInt(parameterId) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue parameter:', error)
    return NextResponse.json(
      { error: 'Failed to delete parameter' },
      { status: 500 }
    )
  }
}
