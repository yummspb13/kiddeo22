#!/usr/bin/env node

/**
 * restore-from-export.js - Восстановление базы данных из экспортированных данных
 * 
 * Этот скрипт восстанавливает базу данных из файла database-export.json
 * Используется когда Prisma предупреждает об опасных операциях
 * или когда нужно полностью очистить и восстановить БД
 * 
 * Использование:
 * node restore-from-export.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Загружаем экспортированные данные
let databaseData = {}

try {
  const exportPath = path.join(__dirname, 'database-export.json')
  if (fs.existsSync(exportPath)) {
    const exportData = fs.readFileSync(exportPath, 'utf8')
    databaseData = JSON.parse(exportData)
    console.log('📁 Загружены экспортированные данные')
  } else {
    console.log('⚠️  Файл database-export.json не найден, используем базовые данные')
    // Базовые данные для восстановления
    databaseData = {
      City: [
        { id: 1, slug: 'moscow', name: 'Москва', isPublic: true },
        { id: 2, slug: 'spb', name: 'Санкт-Петербург', isPublic: true },
        { id: 3, slug: 'ekaterinburg', name: 'Екатеринбург', isPublic: true }
      ],
      User: [
        {
          id: 1,
          email: 'admin@kiddeo.ru',
          name: 'Администратор',
          role: 'ADMIN',
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      Vendor: [],
      VenuePartner: [],
      VenueReview: [],
      Category: [],
      VenueCategory: [],
      VenueSubcategory: [],
      VendorTariffPlan: [],
      PopularCategory: []
    }
  }
} catch (error) {
  console.error('❌ Ошибка загрузки данных:', error)
  process.exit(1)
}

async function clearDatabase() {
  console.log('🧹 Очистка базы данных...')
  
  try {
    // Получаем список всех таблиц
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
      ORDER BY name
    `
    
    // Удаляем данные из всех таблиц
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table.name}"`)
        console.log(`✅ Очищена таблица: ${table.name}`)
      } catch (error) {
        console.log(`⚠️  Пропущена таблица: ${table.name} (${error.message})`)
      }
    }
    
    console.log('✅ База данных очищена')
    
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error)
    throw error
  }
}

async function restoreData() {
  console.log('📥 Восстановление данных...')
  
  try {
    let totalRestored = 0
    
    // Восстанавливаем данные по таблицам
    for (const [tableName, records] of Object.entries(databaseData)) {
      if (!Array.isArray(records) || records.length === 0) {
        console.log(`⏭️  Пропущена таблица ${tableName}: нет данных`)
        continue
      }
      
      try {
        // Определяем модель Prisma для таблицы
        const modelName = getModelName(tableName)
        if (!modelName) {
          console.log(`⚠️  Неизвестная таблица: ${tableName}`)
          continue
        }
        
        // Восстанавливаем записи
        for (const record of records) {
          try {
            // Очищаем поля от null значений и приводим к правильным типам
            const cleanRecord = cleanRecordData(record)
            
            // Создаем запись
            await prisma[modelName].create({ data: cleanRecord })
            totalRestored++
            
          } catch (recordError) {
            console.log(`⚠️  Ошибка записи в ${tableName}: ${recordError.message}`)
          }
        }
        
        console.log(`✅ ${tableName}: ${records.length} записей`)
        
      } catch (tableError) {
        console.log(`❌ Ошибка таблицы ${tableName}: ${tableError.message}`)
      }
    }
    
    console.log(`\n🎉 Восстановлено ${totalRestored} записей!`)
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении данных:', error)
    throw error
  }
}

function getModelName(tableName) {
  // Маппинг имен таблиц на модели Prisma
  const modelMap = {
    'City': 'city',
    'User': 'user',
    'Vendor': 'vendor',
    'VenuePartner': 'venuePartner',
    'VenueReview': 'venueReview',
    'Category': 'category',
    'VenueCategory': 'venueCategory',
    'VenueSubcategory': 'venueSubcategory',
    'VendorTariffPlan': 'vendorTariffPlan',
    'PopularCategory': 'popularCategory',
    'EventReview': 'eventReview',
    'UserSession': 'userSession',
    'VendorOnboarding': 'vendorOnboarding',
    'VendorRole': 'vendorRole',
    'VendorSubscription': 'vendorSubscription',
    'VenueClaim': 'venueClaim',
    'ListingClaim': 'listingClaim',
    'AdEvent': 'adEvent',
    'AdPlacement': 'adPlacement',
    'AfishaCategory': 'afishaCategory',
    'AfishaEvent': 'afishaEvent',
    'AuditLog': 'auditLog',
    'BankAccount': 'bankAccount',
    'TaxProfile': 'taxProfile',
    'Cart': 'cart',
    'UserBehaviorEvent': 'userBehaviorEvent',
    'UserChild': 'userChild',
    'UserInvite': 'userInvite',
    'UserNotificationSettings': 'userNotificationSettings',
    'UserPoints': 'userPoints',
    'UserSettings': 'userSettings',
    'Document': 'document',
    'EventView': 'eventView',
    'Favorite': 'favorite',
    'PointsTransaction': 'pointsTransaction',
    'ReviewReaction': 'reviewReaction',
    'ReviewReply': 'reviewReply',
    'VenueCategoryCity': 'venueCategoryCity',
    'VenueSubcategoryCity': 'venueSubcategoryCity',
    'VenueView': 'venueView'
  }
  
  return modelMap[tableName] || null
}

function cleanRecordData(record) {
  const cleaned = { ...record }
  
  // Удаляем поля с null значениями
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === null) {
      delete cleaned[key]
    }
  })
  
  // Приводим даты к правильному формату
  const dateFields = ['createdAt', 'updatedAt', 'emailVerified', 'moderatedAt', 'expiresAt']
  dateFields.forEach(field => {
    if (cleaned[field] && typeof cleaned[field] === 'string') {
      cleaned[field] = new Date(cleaned[field])
    }
  })
  
  // Приводим JSON поля
  const jsonFields = ['features', 'workingHours', 'coordinates', 'proofData', 'agreements', 'options']
  jsonFields.forEach(field => {
    if (cleaned[field] && typeof cleaned[field] === 'string') {
      try {
        cleaned[field] = JSON.parse(cleaned[field])
      } catch (e) {
        // Если не JSON, оставляем как есть
      }
    }
  })
  
  return cleaned
}

async function main() {
  console.log('🚀 Запуск восстановления базы данных Kiddeo...')
  console.log('⚠️  ВНИМАНИЕ: Все существующие данные будут удалены!')
  
  try {
    await clearDatabase()
    await restoreData()
    
    console.log('\n✅ Восстановление завершено успешно!')
    console.log('📊 Статистика восстановления:')
    
    let totalRecords = 0
    Object.entries(databaseData).forEach(([table, records]) => {
      if (Array.isArray(records)) {
        console.log(`   - ${table}: ${records.length} записей`)
        totalRecords += records.length
      }
    })
    console.log(`   - Всего записей: ${totalRecords}`)
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск скрипта
if (require.main === module) {
  main()
}

module.exports = { clearDatabase, restoreData, databaseData }
