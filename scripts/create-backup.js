#!/usr/bin/env node

/**
 * Скрипт для создания полного бекапа системы
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const BACKUP_DIR = '/Users/a.kenikh/Downloads/Kiddeo/Kiddeo33/backup_0410'
const PROJECT_DIR = '/Users/a.kenikh/Downloads/Kiddeo/Kiddeo33'

console.log('🔄 Создание полного бекапа системы...')

// Создаем директорию бекапа
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  console.log('✅ Создана директория бекапа')
}

// Функция для копирования директории
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️ Источник не найден: ${src}`)
    return
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const items = fs.readdirSync(src)
  
  for (const item of items) {
    const srcPath = path.join(src, item)
    const destPath = path.join(dest, item)
    
    const stat = fs.statSync(srcPath)
    
    if (stat.isDirectory()) {
      // Пропускаем node_modules и другие ненужные папки
      if (['node_modules', '.next', '.git', 'backup_0410', 'hydration-reports'].includes(item)) {
        console.log(`⏭️ Пропущена папка: ${item}`)
        continue
      }
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// Функция для создания архива
function createArchive() {
  try {
    console.log('📦 Создание архива...')
    const archiveName = `kiddeo_backup_${new Date().toISOString().split('T')[0]}.tar.gz`
    const archivePath = path.join(BACKUP_DIR, archiveName)
    
    // Создаем tar.gz архив
    execSync(`cd "${PROJECT_DIR}" && tar -czf "${archivePath}" --exclude=node_modules --exclude=.next --exclude=.git --exclude=backup_0410 --exclude=hydration-reports .`, { stdio: 'inherit' })
    
    console.log(`✅ Архив создан: ${archiveName}`)
    return archivePath
  } catch (error) {
    console.error('❌ Ошибка создания архива:', error.message)
    return null
  }
}

// Функция для создания отчета о бекапе
function createBackupReport() {
  const report = {
    timestamp: new Date().toISOString(),
    projectPath: PROJECT_DIR,
    backupPath: BACKUP_DIR,
    version: '1.0.0',
    description: 'Полный бекап системы Kiddeo',
    includes: [
      'Исходный код (src/)',
      'Конфигурационные файлы',
      'База данных (prisma/dev.db)',
      'Схема Prisma',
      'Документация',
      'Скрипты'
    ],
    excludes: [
      'node_modules/',
      '.next/',
      '.git/',
      'backup_0410/',
      'hydration-reports/'
    ],
    files: {
      total: 0,
      copied: 0,
      skipped: 0
    }
  }
  
  // Подсчитываем файлы
  function countFiles(dir, baseDir = '') {
    const items = fs.readdirSync(dir)
    let count = 0
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativePath = path.join(baseDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        if (['node_modules', '.next', '.git', 'backup_0410', 'hydration-reports'].includes(item)) {
          continue
        }
        count += countFiles(fullPath, relativePath)
      } else {
        count++
      }
    }
    
    return count
  }
  
  report.files.total = countFiles(PROJECT_DIR)
  
  fs.writeFileSync(
    path.join(BACKUP_DIR, 'backup_report.json'), 
    JSON.stringify(report, null, 2)
  )
  
  console.log('📋 Создан отчет о бекапе')
  return report
}

// Основная функция
async function main() {
  try {
    console.log('📁 Копирование файлов...')
    
    // Копируем основные директории
    const dirsToCopy = [
      'src',
      'prisma', 
      'public',
      'scripts',
      'styles'
    ]
    
    for (const dir of dirsToCopy) {
      const srcPath = path.join(PROJECT_DIR, dir)
      const destPath = path.join(BACKUP_DIR, dir)
      
      if (fs.existsSync(srcPath)) {
        console.log(`📂 Копирование ${dir}/...`)
        copyDir(srcPath, destPath)
      }
    }
    
    // Копируем конфигурационные файлы
    const configFiles = [
      'package.json',
      'package-lock.json',
      'next.config.ts',
      'tailwind.config.mjs',
      'postcss.config.mjs',
      'tsconfig.json',
      'eslint.config.mjs',
      '.env.example',
      'README.md'
    ]
    
    for (const file of configFiles) {
      const srcPath = path.join(PROJECT_DIR, file)
      const destPath = path.join(BACKUP_DIR, file)
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath)
        console.log(`📄 Скопирован ${file}`)
      }
    }
    
    // Копируем базу данных
    const dbPath = path.join(PROJECT_DIR, 'prisma', 'dev.db')
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, path.join(BACKUP_DIR, 'dev.db'))
      console.log('🗄️ Скопирована база данных')
    }
    
    // Создаем архив
    const archivePath = createArchive()
    
    // Создаем отчет
    const report = createBackupReport()
    
    // Создаем README для бекапа
    const readmeContent = `# Бекап системы Kiddeo

**Дата создания:** ${new Date().toLocaleString('ru-RU')}
**Версия:** ${report.version}

## Содержимое бекапа

- **Исходный код:** src/
- **База данных:** prisma/dev.db
- **Схема Prisma:** prisma/
- **Публичные файлы:** public/
- **Конфигурация:** package.json, next.config.ts, и др.
- **Скрипты:** scripts/

## Восстановление

1. Скопируйте файлы из этой папки в новую директорию
2. Установите зависимости: \`npm install\`
3. Запустите миграции: \`npx prisma migrate dev\`
4. Запустите проект: \`npm run dev\`

## Архив

Полный архив: \`${archivePath ? path.basename(archivePath) : 'не создан'}\`

## Исключения

- node_modules/
- .next/
- .git/
- backup_0410/
- hydration-reports/

---
Создано автоматически скриптом create-backup.js
`
    
    fs.writeFileSync(path.join(BACKUP_DIR, 'README.md'), readmeContent)
    
    console.log('\n🎉 Бекап успешно создан!')
    console.log(`📁 Директория: ${BACKUP_DIR}`)
    console.log(`📦 Архив: ${archivePath || 'не создан'}`)
    console.log(`📋 Отчет: backup_report.json`)
    console.log(`📖 README: README.md`)
    
  } catch (error) {
    console.error('❌ Ошибка создания бекапа:', error.message)
    process.exit(1)
  }
}

main()
