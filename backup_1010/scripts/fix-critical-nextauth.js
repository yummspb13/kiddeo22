#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Исправляю критические файлы с NextAuth...\n');

// Список критичных файлов для исправления
const criticalFiles = [
  'src/app/api/points/route.ts',
  'src/app/api/points/spend/route.ts',
  'src/app/api/points/transactions/route.ts',
  'src/app/api/points/rewards/route.ts',
  'src/app/api/profile/settings/route.ts',
  'src/app/api/profile/upload-avatar/route.ts',
  'src/app/api/profile/orders/route.ts',
  'src/app/api/profile/notifications/route.ts',
  'src/app/api/profile/notifications/settings/route.ts',
  'src/app/api/profile/change-password/route.ts',
  'src/app/api/simple-user/route.ts',
  'src/app/api/debug-vendor/route.ts',
  'src/app/api/vendor/venues/route.ts',
  'src/app/api/vendor/venues/[id]/route.ts',
  'src/app/api/vendor/upload-document/route.ts',
  'src/app/api/vendors/start/route.ts',
  'src/app/api/vendors/resubmit/route.ts',
  'src/app/api/vendors/upgrade/route.ts',
  'src/app/api/listings/claim/route.ts',
  'src/app/api/admin/vendors/pending/route.ts',
  'src/app/api/admin/vendor-moderation-history/route.ts',
  'src/app/api/debug-session/route.ts'
];

// Функция для исправления файла
function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Заменяем импорты
    if (content.includes("from 'next-auth'")) {
      content = content.replace(/from 'next-auth'/g, "from '@/lib/auth-server'");
      modified = true;
    }
    if (content.includes('from "next-auth"')) {
      content = content.replace(/from "next-auth"/g, 'from "@/lib/auth-server"');
      modified = true;
    }
    if (content.includes("from 'next-auth/jwt'")) {
      content = content.replace(/from 'next-auth\/jwt'/g, "from '@/lib/auth-server'");
      modified = true;
    }
    if (content.includes('from "next-auth/jwt"')) {
      content = content.replace(/from "next-auth\/jwt"/g, 'from "@/lib/auth-server"');
      modified = true;
    }

    // Удаляем импорт authOptions
    if (content.includes("import { authOptions } from '@/auth'")) {
      content = content.replace(/import { authOptions } from '\/@\/auth'\n/g, '');
      modified = true;
    }
    if (content.includes('import { authOptions } from "@/auth"')) {
      content = content.replace(/import { authOptions } from "\/@\/auth"\n/g, '');
      modified = true;
    }

    // Заменяем getServerSession(authOptions) на getServerSession(request)
    if (content.includes('getServerSession(authOptions)')) {
      content = content.replace(/getServerSession\(authOptions\)/g, 'getServerSession(request)');
      modified = true;
    }

    // Заменяем getServerSession() на getServerSession(request) в API routes
    if (filePath.includes('/api/') && content.includes('getServerSession()')) {
      content = content.replace(/getServerSession\(\)/g, 'getServerSession(request)');
      modified = true;
    }

    // Исправляем доступ к user.id вместо user.uid
    if (content.includes('session?.user?.uid')) {
      content = content.replace(/session\?\.user\?\.uid/g, 'session?.user?.id');
      modified = true;
    }
    if (content.includes('session.user.uid')) {
      content = content.replace(/session\.user\.uid/g, 'session.user.id');
      modified = true;
    }

    // Исправляем parseInt для user.id
    if (content.includes('userId: session.user.id')) {
      content = content.replace(/userId: session\.user\.id/g, 'userId: parseInt(session.user.id)');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Исправлен: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Не требует изменений: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Ошибка при исправлении ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function main() {
  let fixedCount = 0;
  let totalCount = criticalFiles.length;

  console.log(`📄 Обрабатываю ${totalCount} критичных файлов...\n`);

  criticalFiles.forEach(filePath => {
    if (fixFile(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n🎉 Исправление завершено!`);
  console.log(`✅ Исправлено файлов: ${fixedCount}/${totalCount}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Рекомендации:');
    console.log('1. Проверьте исправленные файлы вручную');
    console.log('2. Запустите сервер и проверьте работу API');
    console.log('3. При необходимости исправьте оставшиеся файлы');
  }
}

// Запуск
main();
