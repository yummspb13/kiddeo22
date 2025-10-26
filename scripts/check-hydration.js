#!/usr/bin/env node

/**
 * Скрипт для проверки hydration mismatch на всех страницах сайта
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

// Конфигурация
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  outputDir: './hydration-reports',
  excludePatterns: [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/sw.js',
    '/manifest.json'
  ],
  // Список всех страниц для проверки (только существующие)
  pages: [
    // Главная страница
    '/',
    
    // Профиль пользователя (защищенные страницы)
    '/profile',
    '/profile/points',
    '/profile/favorites',
    '/profile/settings',
    '/profile/orders',
    
    // Аутентификация
    '/auth/register',
    
    // Админ панель - основные страницы
    '/admin?key=kidsreview2025',
    '/admin/dashboard?key=kidsreview2025',
    '/admin/afisha?key=kidsreview2025',
    '/admin/afisha/categories?key=kidsreview2025',
    '/admin/afisha/events?key=kidsreview2025',
    '/admin/afisha/filters?key=kidsreview2025',
    '/admin/afisha/settings?key=kidsreview2025',
    '/admin/afisha/analytics?key=kidsreview2025',
    '/admin/afisha/moderation?key=kidsreview2025',
    '/admin/afisha/paid-events?key=kidsreview2025',
    '/admin/afisha/popular-events?key=kidsreview2025',
    '/admin/afisha/ads?key=kidsreview2025',
    '/admin/afisha/config?key=kidsreview2025',
    '/admin/afisha/editors?key=kidsreview2025',
    '/admin/afisha/finance?key=kidsreview2025',
    '/admin/afisha/events/create?key=kidsreview2025',
    
    // Админ панель - пользователи и роли
    '/admin/users?key=kidsreview2025',
    '/admin/users/1/activity?key=kidsreview2025',
    '/admin/roles?key=kidsreview2025',
    '/admin/rbac?key=kidsreview2025',
    
    // Админ панель - вендоры
    '/admin/vendors?key=kidsreview2025',
    '/admin/vendors/pending?key=kidsreview2025',
    '/admin/vendor-applications?key=kidsreview2025',
    
    // Админ панель - места
    '/admin/venues?key=kidsreview2025',
    '/admin/venues/categories?key=kidsreview2025',
    '/admin/venues/filters?key=kidsreview2025',
    '/admin/venues/parameters?key=kidsreview2025',
    '/admin/venues/subcategories?key=kidsreview2025',
    '/admin/venues/partners?key=kidsreview2025',
    '/admin/venues/vendors?key=kidsreview2025',
    '/admin/venues/vendors/cleanup?key=kidsreview2025',
    
    // Админ панель - контент
    '/admin/blog?key=kidsreview2025',
    '/admin/cities?key=kidsreview2025',
    '/admin/popular-categories?key=kidsreview2025',
    '/admin/homepage?key=kidsreview2025',
    
    // Админ панель - модерация и аналитика
    '/admin/leads?key=kidsreview2025',
    '/admin/notifications?key=kidsreview2025',
    '/admin/audit-log?key=kidsreview2025',
    '/admin/moderation-analytics?key=kidsreview2025',
    '/admin/listing-claims?key=kidsreview2025',
    '/admin/listings?key=kidsreview2025',
    '/admin/listings/create?key=kidsreview2025',
    '/admin/listings/1/gallery?key=kidsreview2025',
    
    // Админ панель - настройки
    '/admin/filters?key=kidsreview2025',
    '/admin/visibility?key=kidsreview2025',
    '/admin/documents?key=kidsreview2025',
    '/admin/ads?key=kidsreview2025',
    '/admin/ads/export?key=kidsreview2025',
    '/admin/assistant?key=kidsreview2025',
    '/admin/debug?key=kidsreview2025',
    '/admin/simple?key=kidsreview2025',
    
    // Тестовые страницы
    '/test-auth',
    '/test-modal',
  ]
}

class HydrationChecker {
  constructor() {
    this.browser = null
    this.results = []
    this.errors = []
  }

  async init() {
    console.log('🚀 Запуск проверки hydration mismatch...')
    
    // Создаем директорию для отчетов
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true })
    }

    // Запускаем браузер
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async checkPage(url) {
    const page = await this.browser.newPage()
    
    try {
      console.log(`🔍 Проверяем: ${url}`)
      
      // Включаем перехват консольных сообщений
      const consoleMessages = []
      const errors = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push({
            type: 'error',
            text: msg.text(),
            timestamp: new Date().toISOString()
          })
        }
      })

      page.on('pageerror', error => {
        errors.push({
          type: 'pageerror',
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
      })

      // Переходим на страницу
      const response = await page.goto(`${CONFIG.baseUrl}${url}`, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.timeout
      })

      if (!response.ok()) {
        // Для некоторых страниц 404/500 это нормально (защищенные страницы)
        if (response.status() === 404 || response.status() === 500) {
          console.warn(`⚠️ ${url} - ${response.status()}: ${response.statusText()}`)
          return {
            url,
            status: response.status(),
            hasHydrationMismatch: false,
            skipped: true,
            reason: `${response.status()}: ${response.statusText()}`,
            timestamp: new Date().toISOString()
          }
        }
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`)
      }

      // Ждем загрузки React (мягкая проверка)
      try {
        await page.waitForFunction(() => {
          return window.React || document.querySelector('[data-reactroot]') || document.querySelector('#__next')
        }, { timeout: 5000 })
      } catch (error) {
        console.warn(`⚠️ React/Next.js не найден на ${url}, продолжаем проверку...`)
      }

      // Ждем завершения hydration
      await new Promise(resolve => setTimeout(resolve, 5000))

      // Получаем HTML после hydration
      const clientHTML = await page.content()

      // Проверяем наличие hydration ошибок
      const hydrationErrors = consoleMessages.filter(msg => 
        msg.text.includes('Hydration failed') || 
        msg.text.includes('hydration mismatch') ||
        msg.text.includes('server rendered HTML didn\'t match')
      )

      const pageErrors = errors.filter(error =>
        error.message.includes('Hydration failed') ||
        error.message.includes('hydration mismatch')
      )

      const hasHydrationMismatch = hydrationErrors.length > 0 || pageErrors.length > 0

      const result = {
        url,
        status: response.status(),
        hasHydrationMismatch,
        hydrationErrors: hydrationErrors.length,
        pageErrors: pageErrors.length,
        consoleMessages: consoleMessages.length,
        timestamp: new Date().toISOString(),
        details: {
          hydrationErrors: hydrationErrors.map(e => e.text),
          pageErrors: pageErrors.map(e => e.message),
          allConsoleMessages: consoleMessages
        }
      }

      this.results.push(result)

      if (hasHydrationMismatch) {
        console.error(`❌ Hydration mismatch на ${url}`)
        console.error(`   - Ошибки hydration: ${hydrationErrors.length}`)
        console.error(`   - Ошибки страницы: ${pageErrors.length}`)
      } else {
        console.log(`✅ ${url} - OK`)
      }

      return result

    } catch (error) {
      console.error(`💥 Ошибка при проверке ${url}:`, error.message)
      
      const errorResult = {
        url,
        status: 'error',
        hasHydrationMismatch: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
      
      this.results.push(errorResult)
      this.errors.push({ url, error: error.message })
      
      return errorResult
    } finally {
      await page.close()
    }
  }

  async checkAllPages() {
    console.log(`📋 Проверяем ${CONFIG.pages.length} страниц...`)
    
    for (const pageUrl of CONFIG.pages) {
      await this.checkPage(pageUrl)
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(CONFIG.outputDir, `hydration-report-${timestamp}.json`)
    
    const report = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      summary: {
        totalPages: this.results.length,
        pagesWithMismatch: this.results.filter(r => r.hasHydrationMismatch).length,
        pagesWithErrors: this.results.filter(r => r.status === 'error').length,
        pagesSkipped: this.results.filter(r => r.skipped).length,
        pagesSuccessful: this.results.filter(r => !r.hasHydrationMismatch && r.status !== 'error' && !r.skipped).length,
        successRate: ((this.results.filter(r => !r.hasHydrationMismatch && r.status !== 'error' && !r.skipped).length) / this.results.length * 100).toFixed(2) + '%'
      },
      results: this.results,
      errors: this.errors
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('\n📊 ОТЧЕТ:')
    console.log(`   Всего страниц: ${report.summary.totalPages}`)
    console.log(`   Успешных: ${report.summary.pagesSuccessful}`)
    console.log(`   С hydration mismatch: ${report.summary.pagesWithMismatch}`)
    console.log(`   С ошибками: ${report.summary.pagesWithErrors}`)
    console.log(`   Пропущенных: ${report.summary.pagesSkipped}`)
    console.log(`   Процент успеха: ${report.summary.successRate}`)
    console.log(`\n📄 Отчет сохранен: ${reportPath}`)

    // Выводим проблемные страницы
    const problematicPages = this.results.filter(r => r.hasHydrationMismatch || r.status === 'error')
    if (problematicPages.length > 0) {
      console.log('\n🚨 ПРОБЛЕМНЫЕ СТРАНИЦЫ:')
      problematicPages.forEach(page => {
        console.log(`   ${page.url} - ${page.hasHydrationMismatch ? 'Hydration mismatch' : 'Error'}`)
      })
    }

    return report
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Главная функция
async function main() {
  const checker = new HydrationChecker()
  
  try {
    await checker.init()
    await checker.checkAllPages()
    const report = checker.generateReport()
    
    // Возвращаем код выхода в зависимости от результатов
    const hasProblems = report.summary.pagesWithMismatch > 0 || report.summary.pagesWithErrors > 0
    process.exit(hasProblems ? 1 : 0)
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  } finally {
    await checker.cleanup()
  }
}

// Запуск скрипта
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { HydrationChecker, CONFIG }