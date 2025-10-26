// src/app/api/admin/venues/filters/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
import { slugify } from '@/lib/slug'

// GET /api/admin/venues/filters - получить все фильтры
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const { searchParams } = new URL(request.url)
    const subcategoryId = searchParams.get('subcategoryId')

    const where = subcategoryId ? { subcategoryId: parseInt(subcategoryId) } : {}

    const filters = await prisma.venueFilter.findMany({
      where,
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
      },
      orderBy: subcategoryId ? { order: 'asc' } : [
        { subcategory: { name: 'asc' } },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(filters)
  } catch (error) {
    console.error('Error fetching venue filters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    )
  }
}

// POST /api/admin/venues/filters - создать новый фильтр
export async function POST(request: NextRequest) {
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

    // Проверяем, что фильтр с таким ключом не существует в этой подкатегории
    const existingFilter = await prisma.venueFilter.findFirst({
      where: { 
        key,
        subcategoryId
      }
    })

    if (existingFilter) {
      return NextResponse.json(
        { error: 'Filter with this key already exists in this subcategory' },
        { status: 400 }
      )
    }

    // Получаем следующий порядок
    const lastFilter = await prisma.venueFilter.findFirst({
      where: { subcategoryId },
      orderBy: { order: 'desc' }
    })

    const order = (lastFilter?.order || 0) + 1

    // Создаем фильтр
    const filter = await prisma.venueFilter.create({
      data: {
        name,
        key,
        isVisible: isVisible ?? true,
        config: config || {},
        order,
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

    return NextResponse.json(filter, { status: 201 })
  } catch (error) {
    console.error('Error creating venue filter:', error)
    return NextResponse.json(
      { error: 'Failed to create filter' },
      { status: 500 }
    )
  }
}
