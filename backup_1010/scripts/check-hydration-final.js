#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Список компонентов для проверки
const components = [
  'src/components/AuthButton.tsx',
  'src/components/PointsWidget.tsx',
  'src/modules/auth/useAuthBridge.ts',
  'src/hooks/useUser.ts',
  'src/hooks/useNotifications.ts',
  'src/components/ClaimButton.tsx',
  'src/components/TicketCalculator.tsx',
  'src/app/profile/ProfileLayoutClient.tsx',
  'src/app/profile/ProfileClient.tsx',
  'src/app/profile/settings/SettingsClient.tsx',
  'src/app/profile/points/PointsClient.tsx',
  'src/app/cart/page.tsx'
];

// Критические проблемы с гидратацией
const criticalPatterns = [
  {
    pattern: /Date\.now\(\)/g,
    message: 'Использование Date.now() вызывает проблемы с гидратацией',
    severity: 'error'
  },
  {
    pattern: /Math\.random\(\)/g,
    message: 'Использование Math.random() вызывает проблемы с гидратацией',
    severity: 'error'
  },
  {
    pattern: /new\s+Date\(\)(?!\s*\([^)]*\))/g,
    message: 'Использование new Date() без параметров может вызывать проблемы с гидратацией',
    severity: 'warning'
  }
];

// Проблемы с window/document
const windowPatterns = [
  {
    pattern: /window\.location(?!\.href\s*=\s*window\.location\.href)/g,
    message: 'Использование window.location может вызывать проблемы с гидратацией',
    severity: 'warning'
  },
  {
    pattern: /document\./g,
    message: 'Использование document может вызывать проблемы с гидратацией',
    severity: 'warning'
  },
  {
    pattern: /localStorage/g,
    message: 'Использование localStorage может вызывать проблемы с гидратацией',
    severity: 'warning'
  },
  {
    pattern: /sessionStorage/g,
    message: 'Использование sessionStorage может вызывать проблемы с гидратацией',
    severity: 'warning'
  }
];

// Хорошие практики
const goodPatterns = [
  {
    pattern: /useState\(false\)/g,
    message: 'Правильное использование useState для управления гидратацией',
    severity: 'good'
  },
  {
    pattern: /useEffect\(\(\)\s*=>\s*\{\s*setIsHydrated\(true\)/g,
    message: 'Правильное использование useEffect для установки isHydrated',
    severity: 'good'
  },
  {
    pattern: /if\s*\(\s*!isHydrated\s*\)/g,
    message: 'Правильная проверка isHydrated',
    severity: 'good'
  },
  {
    pattern: /if\s*\(\s*isHydrated\s*\)/g,
    message: 'Правильная проверка isHydrated',
    severity: 'good'
  }
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      file: filePath,
      exists: false,
      issues: []
    };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Проверяем критические проблемы
  criticalPatterns.forEach(({ pattern, message, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match, index) => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          type: 'critical',
          severity,
          message,
          match,
          line: lineNumber,
          pattern: pattern.toString()
        });
      });
    }
  });

  // Проверяем проблемы с window/document
  windowPatterns.forEach(({ pattern, message, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match, index) => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          type: 'window',
          severity,
          message,
          match,
          line: lineNumber,
          pattern: pattern.toString()
        });
      });
    }
  });

  // Проверяем хорошие практики
  goodPatterns.forEach(({ pattern, message, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match, index) => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          type: 'good',
          severity,
          message,
          match,
          line: lineNumber,
          pattern: pattern.toString()
        });
      });
    }
  });

  return {
    file: filePath,
    exists: true,
    issues
  };
}

function main() {
  console.log('🔍 Финальная проверка компонентов на проблемы с гидратацией...\n');

  const results = components.map(checkFile);
  const allIssues = [];
  let totalCritical = 0;
  let totalWarnings = 0;
  let totalGood = 0;

  results.forEach(result => {
    if (!result.exists) {
      console.log(`❌ Файл не найден: ${result.file}`);
      return;
    }

    const critical = result.issues.filter(issue => issue.type === 'critical');
    const warnings = result.issues.filter(issue => issue.type === 'window');
    const good = result.issues.filter(issue => issue.type === 'good');

    totalCritical += critical.length;
    totalWarnings += warnings.length;
    totalGood += good.length;

    if (critical.length > 0 || warnings.length > 0 || good.length > 0) {
      console.log(`\n📄 ${result.file}:`);
      
      if (critical.length > 0) {
        console.log('  🚨 Критические проблемы:');
        critical.forEach(issue => {
          console.log(`    - ${issue.severity.toUpperCase()}: ${issue.message} (строка ${issue.line})`);
          allIssues.push({
            file: result.file,
            ...issue
          });
        });
      }

      if (warnings.length > 0) {
        console.log('  ⚠️  Предупреждения:');
        warnings.forEach(issue => {
          console.log(`    - ${issue.severity.toUpperCase()}: ${issue.message} (строка ${issue.line})`);
          allIssues.push({
            file: result.file,
            ...issue
          });
        });
      }

      if (good.length > 0) {
        console.log('  ✅ Хорошие практики:');
        good.forEach(issue => {
          console.log(`    - ${issue.message} (строка ${issue.line})`);
        });
      }
    } else {
      console.log(`✅ ${result.file} - OK`);
    }
  });

  // Генерируем отчет
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: results.filter(r => r.exists).length,
    totalCritical,
    totalWarnings,
    totalGood,
    issues: allIssues
  };

  const reportPath = path.join(__dirname, '..', 'hydration-final-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📊 Результаты:`);
  console.log(`  Проверено файлов: ${results.filter(r => r.exists).length}`);
  console.log(`  Критических проблем: ${totalCritical}`);
  console.log(`  Предупреждений: ${totalWarnings}`);
  console.log(`  Хороших практик: ${totalGood}`);
  console.log(`  Отчет сохранен: ${reportPath}`);

  if (totalCritical > 0) {
    console.log('\n🚨 Найдены критические проблемы с гидратацией!');
    console.log('\n💡 Рекомендации:');
    console.log('  1. Замените Date.now() и Math.random() на статические значения');
    console.log('  2. Используйте useState для управления состоянием гидратации');
    console.log('  3. Используйте useEffect для установки isHydrated');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Найдены предупреждения, но критические проблемы отсутствуют');
    console.log('\n💡 Рекомендации:');
    console.log('  1. Используйте условный рендеринг с проверкой isHydrated');
    console.log('  2. Избегайте прямого обращения к window, document, localStorage');
    process.exit(0);
  } else {
    console.log('\n✅ Все компоненты работают корректно!');
    process.exit(0);
  }
}

main();
