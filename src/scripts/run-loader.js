#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('📤 Запускаем загрузку данных в базу...\n');

try {
  // Компилируем TypeScript файл
  console.log('🔨 Компилируем TypeScript...');
  execSync('npx tsc src/scripts/data-loader.ts --outDir ./dist --target es2020 --module commonjs --esModuleInterop', { stdio: 'inherit' });
  
  // Запускаем загрузку
  console.log('\n📊 Запускаем загрузку...');
  execSync('node dist/scripts/data-loader.js', { stdio: 'inherit' });
  
  console.log('\n✅ Загрузка завершена!');
  
} catch (error) {
  console.error('❌ Ошибка при загрузке:', error.message);
  process.exit(1);
}
