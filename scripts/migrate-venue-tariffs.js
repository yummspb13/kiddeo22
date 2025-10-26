const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateVenueTariffs() {
  console.log('🚀 Starting venue tariffs migration...')

  try {
    // 1. Получаем все существующие места
    const venues = await prisma.venuePartner.findMany({
      select: {
        id: true,
        name: true,
        tariff: true
      }
    })

    console.log(`📊 Found ${venues.length} venues to migrate`)

    let migrated = 0
    let errors = 0

    // 2. Обновляем все места, устанавливая FREE тариф по умолчанию
    for (const venue of venues) {
      try {
        // Создаем запись в истории тарифов для текущего тарифа
        await prisma.venueTariffHistory.create({
          data: {
            venueId: venue.id,
            tariff: venue.tariff || 'FREE',
            startedAt: new Date(),
            price: null,
            autoRenewed: false
          }
        })

        // Обновляем место, устанавливая значения по умолчанию
        await prisma.venuePartner.update({
          where: { id: venue.id },
          data: {
            tariff: 'FREE',
            tariffExpiresAt: null,
            tariffAutoRenew: false,
            tariffGracePeriodEndsAt: null,
            tariffPrice: null,
            newsCountThisMonth: 0,
            newsResetAt: new Date() // Устанавливаем текущую дату для сброса счетчика
          }
        })

        migrated++
        console.log(`✅ Migrated venue ${venue.id}: ${venue.name}`)
      } catch (error) {
        errors++
        console.error(`❌ Error migrating venue ${venue.id}: ${error.message}`)
      }
    }

    // 3. Создаем несколько тестовых мест с OPTIMAL тарифом для демонстрации
    const testVenues = [
      {
        name: 'Тестовое место - Супер',
        slug: 'test-venue-super',
        description: 'Тестовое место с тарифом Супер',
        subcategoryId: 1, // Предполагаем, что есть подкатегория с ID 1
        vendorId: 1, // Предполагаем, что есть вендор с ID 1
        cityId: 1, // Предполагаем, что есть город с ID 1
        tariff: 'OPTIMAL',
        tariffExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
        tariffAutoRenew: true,
        tariffPrice: 690
      }
    ]

    console.log('🧪 Creating test venues with OPTIMAL tariff...')
    
    for (const testVenue of testVenues) {
      try {
        const createdVenue = await prisma.venuePartner.create({
          data: testVenue
        })

        // Создаем запись в истории
        await prisma.venueTariffHistory.create({
          data: {
            venueId: createdVenue.id,
            tariff: 'OPTIMAL',
            startedAt: new Date(),
            price: 690,
            autoRenewed: false
          }
        })

        console.log(`✅ Created test venue: ${createdVenue.name}`)
      } catch (error) {
        console.error(`❌ Error creating test venue: ${error.message}`)
      }
    }

    console.log('📈 Migration completed!')
    console.log(`✅ Successfully migrated: ${migrated} venues`)
    console.log(`❌ Errors: ${errors}`)

    // 4. Выводим статистику
    const stats = await prisma.venuePartner.groupBy({
      by: ['tariff'],
      _count: {
        tariff: true
      }
    })

    console.log('\n📊 Tariff distribution:')
    stats.forEach(stat => {
      console.log(`  ${stat.tariff}: ${stat._count.tariff} venues`)
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем миграцию
migrateVenueTariffs()
  .then(() => {
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })
