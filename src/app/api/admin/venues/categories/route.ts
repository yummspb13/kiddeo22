// src/app/api/admin/venues/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'
import { slugify, generateUniqueSlug, checkSlugExistsUniversal } from '@/lib/slug-utils'
export const runtime = 'nodejs'

// Функция для проверки slug категорий мест
async function checkVenueCategorySlugExists(slug: string, excludeId?: number): Promise<boolean> {
  return checkSlugExistsUniversal(slug, 'VenueCategory', excludeId)
}

// GET /api/admin/venues/categories - получить все категории
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const url = request.url
  
  try {
    console.log(`🔍 API: GET ${url} - Started at ${new Date().toISOString()}`)
    console.log('Starting to fetch venue categories...')
    console.log('Prisma object:', typeof prisma, prisma)
    
    console.log(`🔍 API: Checking admin permissions...`)
    await requireAdminOrDevKey({})
    console.log('Admin check passed')

    console.log(`🔍 API: Starting Prisma query...`)
    const prismaStartTime = Date.now()
    
    const categories = await prisma.venueCategory.findMany({
      include: {
        cityCategories: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const prismaDuration = Date.now() - prismaStartTime
    const totalDuration = Date.now() - startTime
    
    console.log(`🔍 API: Prisma query completed in ${prismaDuration}ms`)
    console.log('Categories fetched:', categories.length)
    console.log(`🔍 API: GET ${url} - Completed in ${totalDuration}ms`)
    
    return NextResponse.json(categories)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`🔍 API: GET ${url} - Error after ${duration}ms:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/venues/categories - создать новую категорию
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const body = await request.json()
    const { name, icon, color, cityIds } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Проверяем, что категория с таким именем не существует
    const existingCategory = await prisma.venueCategory.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      )
    }

    // Генерируем slug
    const generatedSlug = await generateUniqueSlug(name, checkVenueCategorySlugExists)
    console.log('Generated slug for name "' + name + '":', generatedSlug)
    
    // Создаем категорию
    const category = await prisma.venueCategory.create({
      data: {
        name,
        slug: generatedSlug,
        icon,
        color,
        cityCategories: {
          create: cityIds?.map((cityId: number) => ({
            cityId
          })) || []
        }
      },
      include: {
        cityCategories: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating venue category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
