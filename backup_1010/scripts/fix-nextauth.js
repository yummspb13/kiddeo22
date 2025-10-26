#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Поиск файлов с NextAuth...\n');

// Паттерны для поиска NextAuth импортов
const nextAuthPatterns = [
  /from ['"]next-auth['"]/g,
  /from ['"]next-auth\/react['"]/g,
  /from ['"]next-auth\/jwt['"]/g,
  /import.*next-auth/g,
  /getServerSession.*next-auth/g,
  /useSession.*next-auth/g,
  /signIn.*next-auth/g,
  /signOut.*next-auth/g,
  /getToken.*next-auth/g,
  /authOptions/g,
  /SessionProvider/g,
  /Session.*next-auth/g
];

// Замены для NextAuth импортов
const replacements = {
  "from 'next-auth'": "from '@/lib/auth-server'",
  'from "next-auth"': 'from "@/lib/auth-server"',
  "from 'next-auth/react'": "from '@/modules/auth/useAuthBridge'",
  'from "next-auth/react"': 'from "@/modules/auth/useAuthBridge"',
  "from 'next-auth/jwt'": "from '@/lib/auth-server'",
  'from "next-auth/jwt"': 'from "@/lib/auth-server"',
  "getServerSession(authOptions)": "getServerSession(request)",
  "getServerSession()": "getServerSession(request)",
  "useSession()": "useAuthBridge()",
  "signIn(": "// signIn(",
  "signOut(": "// signOut(",
  "SessionProvider": "// SessionProvider",
  "Session": "// Session"
};

// Функция для поиска файлов с NextAuth
function findNextAuthFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Пропускаем node_modules и .next
        if (!['node_modules', '.next', '.git'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Функция для проверки файла на наличие NextAuth
function hasNextAuth(content) {
  return nextAuthPatterns.some(pattern => pattern.test(content));
}

// Функция для замены NextAuth импортов
function replaceNextAuth(content) {
  let newContent = content;
  
  Object.entries(replacements).forEach(([search, replace]) => {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    newContent = newContent.replace(regex, replace);
  });
  
  return newContent;
}

// Функция для анализа файла
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!hasNextAuth(content)) {
      return null;
    }
    
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      nextAuthPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString()
          });
        }
      });
    });
    
    return {
      file: filePath,
      issues: issues,
      content: content
    };
  } catch (error) {
    console.error(`❌ Ошибка при чтении файла ${filePath}:`, error.message);
    return null;
  }
}

// Основная функция
function main() {
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Папка src не найдена!');
    process.exit(1);
  }
  
  console.log(`📁 Сканирую папку: ${srcDir}\n`);
  
  const files = findNextAuthFiles(srcDir);
  console.log(`📄 Найдено файлов для проверки: ${files.length}\n`);
  
  const problematicFiles = [];
  
  files.forEach(file => {
    const analysis = analyzeFile(file);
    if (analysis) {
      problematicFiles.push(analysis);
    }
  });
  
  if (problematicFiles.length === 0) {
    console.log('✅ Отлично! Файлы с NextAuth не найдены.\n');
    return;
  }
  
  console.log(`🚨 Найдено файлов с NextAuth: ${problematicFiles.length}\n`);
  
  // Выводим детали
  problematicFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}`);
    file.issues.forEach(issue => {
      console.log(`   Строка ${issue.line}: ${issue.content}`);
    });
    console.log('');
  });
  
  // Создаем отчет
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    problematicFiles: problematicFiles.length,
    files: problematicFiles.map(f => ({
      file: f.file,
      issuesCount: f.issues.length,
      issues: f.issues
    }))
  };
  
  const reportPath = path.join(process.cwd(), 'nextauth-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📊 Отчет сохранен в: ${reportPath}\n`);
  
  // Предлагаем автоматическое исправление
  console.log('🔧 Хотите автоматически исправить файлы? (y/n)');
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const input = data.toString().trim().toLowerCase();
    
    if (input === 'y' || input === 'yes') {
      console.log('\n🔧 Исправляю файлы...\n');
      
      problematicFiles.forEach((file, index) => {
        try {
          const newContent = replaceNextAuth(file.content);
          fs.writeFileSync(file.file, newContent, 'utf8');
          console.log(`✅ Исправлен: ${file.file}`);
        } catch (error) {
          console.error(`❌ Ошибка при исправлении ${file.file}:`, error.message);
        }
      });
      
      console.log('\n🎉 Исправление завершено!');
      console.log('💡 Рекомендуется проверить исправленные файлы вручную.\n');
    } else {
      console.log('\n👋 Исправление отменено.\n');
    }
    
    process.exit(0);
  });
}

// Запуск
main();
