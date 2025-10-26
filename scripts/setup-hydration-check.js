#!/usr/bin/env node

/**
 * Скрипт для настройки системы проверки hydration mismatch
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Настройка системы проверки hydration mismatch...')

// Проверяем, что мы в корне проекта
if (!fs.existsSync('package.json')) {
  console.error('❌ Запустите скрипт из корня проекта')
  process.exit(1)
}

// Устанавливаем puppeteer для проверки страниц
try {
  console.log('📦 Устанавливаем puppeteer...')
  execSync('npm install --save-dev puppeteer', { stdio: 'inherit' })
  console.log('✅ Puppeteer установлен')
} catch (error) {
  console.error('❌ Ошибка установки puppeteer:', error.message)
  process.exit(1)
}

// Создаем директорию для отчетов
const reportsDir = './hydration-reports'
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
  console.log('✅ Создана директория для отчетов')
}

// Создаем .gitignore для отчетов
const gitignorePath = './hydration-reports/.gitignore'
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, `# Hydration reports
*.json
!README.md
`)
  console.log('✅ Создан .gitignore для отчетов')
}

// Создаем README для отчетов
const readmePath = './hydration-reports/README.md'
if (!fs.existsSync(readmePath)) {
  const readmeContent = `# Hydration Reports

Эта директория содержит отчеты о проверке hydration mismatch на страницах сайта.

## Запуск проверки

\`\`\`bash
npm run check-hydration
\`\`\`

## Структура отчета

- \`hydration-report-YYYY-MM-DDTHH-mm-ss.json\` - JSON отчет с детальной информацией
- \`summary.json\` - Краткая сводка последней проверки

## Интерпретация результатов

- \`hasHydrationMismatch: true\` - на странице обнаружены hydration ошибки
- \`status: "error"\` - ошибка загрузки страницы
- \`hydrationErrors\` - количество ошибок hydration в консоли
- \`pageErrors\` - количество ошибок на странице

## Исправление проблем

1. Используйте \`HydrationBoundary\` для обертки проблемных компонентов
2. Избегайте использования \`window\`, \`document\`, \`localStorage\` в server components
3. Используйте \`useEffect\` для клиентской логики
4. Проверяйте \`typeof window !== 'undefined'\` перед использованием браузерных API
`
  fs.writeFileSync(readmePath, readmeContent)
  console.log('✅ Создан README для отчетов')
}

// Добавляем скрипт в package.json
try {
  const packageJsonPath = './package.json'
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }
  
  packageJson.scripts['check-hydration'] = 'node scripts/check-hydration.js'
  packageJson.scripts['check-hydration:dev'] = 'NODE_ENV=development node scripts/check-hydration.js'
  packageJson.scripts['check-hydration:prod'] = 'NODE_ENV=production node scripts/check-hydration.js'
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('✅ Добавлены скрипты в package.json')
} catch (error) {
  console.error('❌ Ошибка обновления package.json:', error.message)
}

// Создаем конфигурационный файл
const configPath = './hydration.config.js'
if (!fs.existsSync(configPath)) {
  const configContent = `module.exports = {
  // Базовый URL для проверки
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000',
  
  // Таймаут для загрузки страниц (мс)
  timeout: 30000,
  
  // Директория для сохранения отчетов
  outputDir: './hydration-reports',
  
  // Паттерны для исключения из проверки
  excludePatterns: [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/sw.js',
    '/manifest.json'
  ],
  
  // Дополнительные страницы для проверки
  additionalPages: [
    // Добавьте сюда дополнительные страницы
  ],
  
  // Настройки браузера
  browserOptions: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
}
`
  fs.writeFileSync(configPath, configContent)
  console.log('✅ Создан конфигурационный файл')
}

console.log('\n🎉 Настройка завершена!')
console.log('\n📋 Доступные команды:')
console.log('  npm run check-hydration        - Проверить все страницы')
console.log('  npm run check-hydration:dev    - Проверить в режиме разработки')
console.log('  npm run check-hydration:prod   - Проверить в продакшене')
console.log('\n📖 Документация: ./hydration-reports/README.md')
console.log('\n🔧 Конфигурация: ./hydration.config.js')
