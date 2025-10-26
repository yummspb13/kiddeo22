#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('📤 Запускаем экспорт данных из базы...\n');

try {
  // Компилируем TypeScript файл
  console.log('🔨 Компилируем TypeScript...');
  execSync('npx tsc src/scripts/export-data.ts --outDir ./dist --target es2020 --module commonjs --esModuleInterop', { stdio: 'inherit' });
  
  // Запускаем экспорт
  console.log('\n📊 Запускаем экспорт...');
  execSync('node dist/scripts/export-data.js', { stdio: 'inherit' });
  
  console.log('\n✅ Экспорт завершен!');
  console.log('📁 Файлы сохранены в папке src/data/');
  
} catch (error) {
  console.error('❌ Ошибка при экспорте:', error.message);
  process.exit(1);
}
