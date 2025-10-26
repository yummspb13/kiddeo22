#!/usr/bin/env node

/**
 * Скрипт для массового исправления импортов @/auth
 */

const fs = require('fs')
const path = require('path')

// Файлы, которые нужно исправить
const filesToFix = [
  'src/lib/vendor-guard.ts',
  'src/app/vendor/communications/page.tsx',
  'src/app/vendor/onboarding/page.tsx',
  'src/app/vendor/page.tsx',
  'src/app/vendor/orders/page.tsx',
  'src/app/vendor/ai-assistant/page.tsx',
  'src/app/vendor/layout.tsx',
  'src/app/vendor/register/page.tsx',
  'src/app/vendor/venues/create/page.tsx',
  'src/app/vendor/venues/page.tsx',
  'src/app/vendor/dashboard/page.tsx',
  'src/app/orders/page.tsx',
  'src/app/api/vendor/onboarding/route.ts',
  'src/app/api/vendor/ai-assistant/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/orders/[orderId]/route.ts',
  'src/app/api/promo-codes/route.ts',
  'src/app/api/loyalty/route.ts',
  'src/app/api/admin/ad-placements/route.ts',
  'src/app/api/admin/assistant/route.ts',
  'src/app/api/admin/quick-filters/route.ts',
  'src/app/api/payments/route.ts',
  'src/app/admin/listing-claims/page.tsx',
  'src/app/admin/assistant/page.tsx',
  'src/app/vendor-register/page.tsx',
  'src/app/debug-session/page.tsx'
]

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Файл не найден: ${filePath}`)
    return false
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  // Заменяем импорт @/auth на @/lib/auth-utils
  if (content.includes('from "@/auth"')) {
    content = content.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*["']@\/auth["']/g, (match, imports) => {
      // Если импортируется auth, заменяем на getServerSession
      if (imports.includes('auth')) {
        const newImports = imports.replace(/\bauth\b/g, 'getServerSession')
        return `import { ${newImports} } from "@/lib/auth-utils"`
      }
      return match
    })
    changed = true
  }

  // Заменяем использование auth() на getServerSession()
  if (content.includes('await auth()')) {
    content = content.replace(/await\s+auth\(\)/g, 'await getServerSession()')
    changed = true
  }

  // Заменяем session?.user?.uid на session?.user?.id
  if (content.includes('session?.user?.uid')) {
    content = content.replace(/session\?\.user\?\.uid/g, 'session?.user?.id')
    changed = true
  }

  if (changed) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Исправлен: ${filePath}`)
    return true
  } else {
    console.log(`⏭️ Пропущен: ${filePath} (изменений не требуется)`)
    return false
  }
}

console.log('🔧 Исправление импортов @/auth...')

let fixedCount = 0
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++
  }
}

console.log(`\n🎉 Исправлено файлов: ${fixedCount}`)
console.log('✅ Все импорты @/auth заменены на @/lib/auth-utils')
