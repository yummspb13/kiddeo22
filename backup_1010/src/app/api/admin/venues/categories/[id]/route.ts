import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { generateUniqueSlug, checkSlugExistsUniversal } from '@/lib/slug-utils'

// GET /api/admin/venues/categories/[id] - получить категорию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const categoryId = id

    const category = await prisma.venueCategory.findUnique({
      where: { id: parseInt(categoryId) },
      include: {
        cityCategories: {
          include: {
            city: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PATCH /api/admin/venues/categories/[id] - обновить категорию
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const categoryId = id

    const body = await request.json()
    const { name, icon, color, cityIds } = body

    // Функция для проверки slug категорий мест
    async function checkVenueCategorySlugExists(slug: string, excludeId?: number): Promise<boolean> {
      return checkSlugExistsUniversal(slug, 'VenueCategory', excludeId)
    }

    // Генерируем правильный slug
    const generatedSlug = await generateUniqueSlug(name, (slug) => checkVenueCategorySlugExists(slug, parseInt(categoryId)))
    console.log('Generated slug for update name "' + name + '":', generatedSlug)

    // Обновляем категорию
    const updatedCategory = await prisma.venueCategory.update({
      where: { id: parseInt(categoryId) },
      data: {
        name,
        icon,
        color,
        slug: generatedSlug
      }
    })

    // Обновляем связи с городами
    if (cityIds && Array.isArray(cityIds)) {
      // Удаляем старые связи
      await prisma.venueCategoryCity.deleteMany({
        where: { categoryId: parseInt(categoryId) }
      })

      // Создаем новые связи
      await prisma.venueCategoryCity.createMany({
        data: cityIds.map((cityId: number) => ({
          categoryId: parseInt(categoryId),
          cityId: cityId
        }))
      })
    }

    // Получаем обновленную категорию с городами
    const category = await prisma.venueCategory.findUnique({
      where: { id: parseInt(categoryId) },
      include: {
        cityCategories: {
          include: {
            city: true
          }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ 
      error: 'Failed to update category',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/venues/categories/[id] - удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const categoryId = id

    // Удаляем связи с городами
    await prisma.venueCategoryCity.deleteMany({
      where: { categoryId: parseInt(categoryId) }
    })

    // Удаляем категорию
    await prisma.venueCategory.delete({
      where: { id: parseInt(categoryId) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ 
      error: 'Failed to delete category',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}