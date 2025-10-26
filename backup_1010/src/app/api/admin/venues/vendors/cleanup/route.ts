import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'

// POST /api/admin/venues/vendors/cleanup - автоматическое удаление неактивных вендоров
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    console.log(`🧹 Начинаем очистку вендоров, созданных до ${thirtyDaysAgo.toISOString()}`)

    // Находим вендоров, которые:
    // 1. Созданы более 30 дней назад
    // 2. Не имеют ни одного партнера
    // 3. Статус не DELETED
    const inactiveVendors = await prisma.venueVendor.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        status: {
          not: 'DELETED'
        },
        // Проверяем, что у вендора нет партнеров
        vendor: {
          venuePartners: {
            none: {}
          }
        }
      },
      include: {
        vendor: {
          include: {
            venuePartners: true
          }
        }
      }
    })

    console.log(`📊 Найдено ${inactiveVendors.length} неактивных вендоров для удаления`)

    const deletedVendors = []
    const errors = []

    for (const venueVendor of inactiveVendors) {
      try {
        // Обновляем статус вендора на DELETED
        await prisma.venueVendor.update({
          where: { id: venueVendor.id },
          data: {
            status: 'DELETED',
            updatedAt: new Date()
          }
        })

        // Также обновляем базового вендора
        await prisma.vendor.update({
          where: { id: venueVendor.vendorId },
          data: {
            canPostEvents: false,
            canPostCatalog: false,
            updatedAt: new Date()
          }
        })

        deletedVendors.push({
          id: venueVendor.id,
          vendorId: venueVendor.vendorId,
          fullName: venueVendor.fullName || venueVendor.vendor?.displayName,
          createdAt: venueVendor.createdAt,
          daysSinceCreation: Math.floor((new Date().getTime() - venueVendor.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        })

        console.log(`✅ Удален вендор: ${venueVendor.fullName || venueVendor.vendor?.displayName} (ID: ${venueVendor.id})`)

      } catch (error) {
        console.error(`❌ Ошибка при удалении вендора ${venueVendor.id}:`, error)
        errors.push({
          vendorId: venueVendor.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Очистка завершена. Удалено ${deletedVendors.length} вендоров`,
      deletedVendors,
      errors,
      summary: {
        totalFound: inactiveVendors.length,
        successfullyDeleted: deletedVendors.length,
        errors: errors.length
      }
    })

  } catch (error) {
    console.error('Error during vendor cleanup:', error)
    return NextResponse.json({ 
      error: 'Failed to cleanup vendors',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/admin/venues/vendors/cleanup - получить статистику неактивных вендоров
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Находим вендоров, которые будут удалены
    const inactiveVendors = await prisma.venueVendor.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        status: {
          not: 'DELETED'
        },
        vendor: {
          venuePartners: {
            none: {}
          }
        }
      },
      include: {
        vendor: {
          include: {
            venuePartners: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Группируем по дням до удаления
    const vendorsByDays = inactiveVendors.reduce((acc, vendor) => {
      const daysSinceCreation = Math.floor((new Date().getTime() - vendor.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const daysUntilDeletion = 30 - daysSinceCreation
      
      if (!acc[daysUntilDeletion]) {
        acc[daysUntilDeletion] = []
      }
      acc[daysUntilDeletion].push(vendor)
      
      return acc
    }, {} as Record<number, any[]>)

    return NextResponse.json({
      totalInactiveVendors: inactiveVendors.length,
      vendorsByDays,
      cutoffDate: thirtyDaysAgo,
      vendors: inactiveVendors.map(vendor => ({
        id: vendor.id,
        vendorId: vendor.vendorId,
        fullName: vendor.fullName || vendor.vendor?.displayName,
        createdAt: vendor.createdAt,
        daysSinceCreation: Math.floor((new Date().getTime() - vendor.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        daysUntilDeletion: 30 - Math.floor((new Date().getTime() - vendor.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      }))
    })

  } catch (error) {
    console.error('Error getting cleanup stats:', error)
    return NextResponse.json({ 
      error: 'Failed to get cleanup stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
