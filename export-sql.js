#!/usr/bin/env node

/**
 * export-sql.js - Экспорт данных через SQL запросы
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportData() {
  console.log('📤 Экспорт данных из базы данных через SQL...')
  
  try {
    // Получаем список всех таблиц
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
      ORDER BY name
    `
    
    console.log('📋 Найденные таблицы:')
    tables.forEach(table => console.log(`   - ${table.name}`))
    
    const data = {}
    
    // Экспортируем каждую таблицу
    for (const table of tables) {
      try {
        const tableName = table.name
        const records = await prisma.$queryRaw`SELECT * FROM ${tableName}`
        data[tableName] = records
        console.log(`✅ ${tableName}: ${records.length} записей`)
      } catch (error) {
        console.log(`⚠️  Пропущена таблица ${table.name}: ${error.message}`)
        data[table.name] = []
      }
    }

    // Сохраняем в JSON файл
    const exportPath = path.join(__dirname, 'database-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2))
    
    console.log(`\n✅ Данные экспортированы в: ${exportPath}`)
    
    // Выводим общую статистику
    const totalRecords = Object.values(data).reduce((sum, records) => sum + records.length, 0)
    console.log(`\n📊 Общая статистика:`)
    console.log(`   - Таблиц: ${Object.keys(data).length}`)
    console.log(`   - Записей: ${totalRecords}`)

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
