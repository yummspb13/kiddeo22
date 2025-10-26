import prisma from '@/lib/db'

// Функция для автоматической очистки неактивных вендоров
export async function cleanupInactiveVendors() {
  try {
    console.log('🕐 Запуск автоматической очистки вендоров...')
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Находим неактивных вендоров
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
      }
    })

    console.log(`📊 Найдено ${inactiveVendors.length} неактивных вендоров`)

    let deletedCount = 0
    let errorCount = 0

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

        // Отключаем возможности базового вендора
        await prisma.vendor.update({
          where: { id: venueVendor.vendorId },
          data: {
            canPostEvents: false,
            canPostCatalog: false,
            updatedAt: new Date()
          }
        })

        deletedCount++
        console.log(`✅ Удален вендор: ${venueVendor.fullName || venueVendor.vendor?.displayName}`)

      } catch (error) {
        errorCount++
        console.error(`❌ Ошибка при удалении вендора ${venueVendor.id}:`, error)
      }
    }

    console.log(`🎯 Очистка завершена: удалено ${deletedCount}, ошибок ${errorCount}`)
    
    return {
      success: true,
      deletedCount,
      errorCount,
      totalFound: inactiveVendors.length
    }

  } catch (error) {
    console.error('❌ Критическая ошибка при очистке вендоров:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Функция для обновления статусов вендоров (предупреждения)
export async function updateVendorWarnings() {
  try {
    console.log('⚠️ Обновление предупреждений для вендоров...')
    
    const now = new Date()
    const twentyFiveDaysAgo = new Date()
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25)
    
    const twentyEightDaysAgo = new Date()
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28)

    // Вендоры, которым осталось 5 дней (25 дней с момента создания)
    const warningVendors = await prisma.venueVendor.findMany({
      where: {
        createdAt: {
          gte: twentyEightDaysAgo,
          lt: twentyFiveDaysAgo
        },
        status: {
          not: 'DELETED'
        },
        vendor: {
          venuePartners: {
            none: {}
          }
        }
      }
    })

    // Вендоры, которым осталось 2 дня (28 дней с момента создания)
    const criticalVendors = await prisma.venueVendor.findMany({
      where: {
        createdAt: {
          gte: twentyFiveDaysAgo,
          lt: now
        },
        status: {
          not: 'DELETED'
        },
        vendor: {
          venuePartners: {
            none: {}
          }
        }
      }
    })

    console.log(`⚠️ Найдено ${warningVendors.length} вендоров с предупреждением (5 дней)`)
    console.log(`🚨 Найдено ${criticalVendors.length} вендоров в критическом состоянии (2 дня)`)

    return {
      success: true,
      warningCount: warningVendors.length,
      criticalCount: criticalVendors.length
    }

  } catch (error) {
    console.error('❌ Ошибка при обновлении предупреждений:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
