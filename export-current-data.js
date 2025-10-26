#!/usr/bin/env node

/**
 * export-current-data.js - Экспорт текущих данных из базы данных
 * 
 * Этот скрипт экспортирует все данные из текущей БД
 * и обновляет файл restore-database.js с актуальными данными
 * 
 * Использование:
 * node export-current-data.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportAllData() {
  console.log('📤 Экспорт данных из базы данных...')
  
  try {
    // Экспортируем все таблицы
    const data = {
      cities: await prisma.city.findMany(),
      users: await prisma.user.findMany(),
      vendors: await prisma.vendor.findMany(),
      venues: await prisma.venue.findMany(),
      categories: await prisma.category.findMany(),
      subcategories: await prisma.subcategory.findMany(),
      parameters: await prisma.venueParameter.findMany(),
      filters: await prisma.venueFilter.findMany(),
      tariffPlans: await prisma.vendorTariffPlan.findMany(),
      popularCategories: await prisma.popularCategory.findMany(),
      events: await prisma.event.findMany(),
      venueReviews: await prisma.venueReview.findMany(),
      eventReviews: await prisma.eventReview.findMany(),
      venueClaims: await prisma.venueClaim.findMany(),
      listingClaims: await prisma.listingClaim.findMany(),
      vendorSubscriptions: await prisma.vendorSubscription.findMany(),
      vendorOnboardings: await prisma.vendorOnboarding.findMany(),
      vendorRoles: await prisma.vendorRole.findMany(),
      venuePartners: await prisma.venuePartner.findMany(),
      userSessions: await prisma.userSession.findMany()
    }

    // Сохраняем в JSON файл
    const exportPath = path.join(__dirname, 'database-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2))
    
    console.log(`✅ Данные экспортированы в: ${exportPath}`)
    
    // Выводим статистику
    console.log('\n📊 Статистика экспорта:')
    Object.entries(data).forEach(([table, records]) => {
      console.log(`   - ${table}: ${records.length} записей`)
    })

    return data

  } catch (error) {
    console.error('❌ Ошибка при экспорте данных:', error)
    throw error
  }
}

async function updateRestoreScript(exportedData) {
  console.log('🔄 Обновление скрипта восстановления...')
  
  try {
    // Читаем текущий файл restore-database.js
    const restorePath = path.join(__dirname, 'restore-database.js')
    let content = fs.readFileSync(restorePath, 'utf8')
    
    // Обновляем данные в скрипте
    const dataString = JSON.stringify(exportedData, null, 2)
    
    // Заменяем секцию databaseData
    const regex = /const databaseData = \{[\s\S]*?\}/
    const newDataSection = `const databaseData = ${dataString}`
    
    content = content.replace(regex, newDataSection)
    
    // Сохраняем обновленный файл
    fs.writeFileSync(restorePath, content)
    
    console.log('✅ Скрипт восстановления обновлен!')
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении скрипта:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 Запуск экспорта данных...')
  
  try {
    const exportedData = await exportAllData()
    await updateRestoreScript(exportedData)
    
    console.log('\n✅ Экспорт завершен успешно!')
    console.log('📁 Созданные файлы:')
    console.log('   - database-export.json (полный экспорт)')
    console.log('   - restore-database.js (обновлен)')
    
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

module.exports = { exportAllData, updateRestoreScript }
