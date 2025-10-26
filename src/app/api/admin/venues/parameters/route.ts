// src/app/api/admin/venues/parameters/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/venues/parameters - получить все параметры
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const { searchParams } = new URL(request.url)
    const subcategoryId = searchParams.get('subcategoryId')

    const where = subcategoryId ? { subcategoryId: parseInt(subcategoryId) } : {}

    const parameters = await prisma.venueParameter.findMany({
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

    return NextResponse.json(parameters)
  } catch (error) {
    console.error('Error fetching venue parameters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parameters' },
      { status: 500 }
    )
  }
}

// POST /api/admin/venues/parameters - создать новый параметр
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

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

    // Проверяем, что параметр с таким именем не существует в этой подкатегории
    const existingParameter = await prisma.venueParameter.findFirst({
      where: { 
        name,
        subcategoryId
      }
    })

    if (existingParameter) {
      return NextResponse.json(
        { error: 'Parameter with this name already exists in this subcategory' },
        { status: 400 }
      )
    }

    // Получаем следующий порядок
    const lastParameter = await prisma.venueParameter.findFirst({
      where: { subcategoryId },
      orderBy: { order: 'desc' }
    })

    const order = (lastParameter?.order || 0) + 1

    // Создаем параметр
    const parameter = await prisma.venueParameter.create({
      data: {
        name,
        type,
        config: config ? JSON.stringify(config) : null,
        isFree: isFree || false,
        isOptimal: isOptimal || false,
        isMaximum: isMaximum || false,
        isActive: isActive ?? true,
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

    return NextResponse.json(parameter, { status: 201 })
  } catch (error) {
    console.error('Error creating venue parameter:', error)
    return NextResponse.json(
      { error: 'Failed to create parameter' },
      { status: 500 }
    )
  }
}
