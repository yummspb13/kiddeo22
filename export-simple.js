#!/usr/bin/env node

/**
 * export-simple.js - Простой экспорт данных из базы данных
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportData() {
  console.log('📤 Экспорт данных из базы данных...')
  
  try {
    // Экспортируем основные таблицы
    const data = {
      cities: await prisma.city.findMany(),
      users: await prisma.user.findMany(),
      vendors: await prisma.vendor.findMany(),
      venues: await prisma.venue.findMany(),
      categories: await prisma.category.findMany(),
      subcategories: await prisma.subcategory.findMany(),
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

async function main() {
  console.log('🚀 Запуск экспорта данных...')
  
  try {
    await exportData()
    console.log('\n✅ Экспорт завершен успешно!')
    
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

module.exports = { exportData }
