// src/app/api/admin/venues/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'

// GET /api/admin/venues - получить статистику мест
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)

    // Получаем статистику из разных таблиц
    const [
      totalListings,
      venueCategories,
      venueSubcategories,
      venueFilters,
      venuePartners,
      venueVendors
    ] = await Promise.all([
      // Общие места из Listing
      prisma.listing.count({
        where: {
          type: {
            in: ['VENUE', 'SERVICE']
          }
        }
      }),
      // Специализированные категории мест
      prisma.venueCategory.count(),
      // Подкатегории мест
      prisma.venueSubcategory.count(),
      // Фильтры мест
      prisma.venueFilter.count(),
      // Партнеры мест
      prisma.venuePartner.count(),
      // Вендоры мест
      prisma.venueVendor.count()
    ])

    return NextResponse.json({
      totalListings,
      venueCategories,
      venueSubcategories,
      venueFilters,
      venuePartners,
      venueVendors,
      // Общая статистика
      stats: {
        totalPlaces: totalListings,
        categories: venueCategories,
        subcategories: venueSubcategories,
        filters: venueFilters
      }
    })
  } catch (error) {
    console.error('❌ Error fetching venues stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues statistics' },
      { status: 500 }
    )
  }
}
