#!/usr/bin/env node

/**
 * export-sqlite.js - Экспорт данных через sqlite3
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function exportData() {
  console.log('📤 Экспорт данных из базы данных через sqlite3...')
  
  try {
    // Получаем список всех таблиц
    const tablesOutput = execSync('sqlite3 prisma/dev.db ".tables"', { encoding: 'utf8' })
    const tables = tablesOutput.trim().split(/\s+/).filter(table => 
      table && 
      !table.startsWith('sqlite_') && 
      !table.startsWith('_prisma_') &&
      table !== 'new_VenueView' // Пропускаем временные таблицы
    )
    
    console.log('📋 Найденные таблицы:')
    tables.forEach(table => console.log(`   - ${table}`))
    
    const data = {}
    let totalRecords = 0
    
    // Экспортируем каждую таблицу
    for (const table of tables) {
      try {
        // Получаем данные из таблицы
        const recordsOutput = execSync(`sqlite3 prisma/dev.db -json "SELECT * FROM ${table}"`, { encoding: 'utf8' })
        const records = JSON.parse(recordsOutput)
        
        data[table] = records
        totalRecords += records.length
        console.log(`✅ ${table}: ${records.length} записей`)
        
      } catch (error) {
        console.log(`⚠️  Пропущена таблица ${table}: ${error.message}`)
        data[table] = []
      }
    }

    // Сохраняем в JSON файл
    const exportPath = path.join(__dirname, 'database-export.json')
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2))
    
    console.log(`\n✅ Данные экспортированы в: ${exportPath}`)
    
    // Выводим общую статистику
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
  }
}

// Запуск скрипта
if (require.main === module) {
  main()
}

module.exports = { exportData }
