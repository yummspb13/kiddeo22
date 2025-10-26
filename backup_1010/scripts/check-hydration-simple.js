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

// Паттерны для поиска проблем с гидратацией
const hydrationPatterns = [
  // Проблемные паттерны
  {
    pattern: /if\s*\(\s*typeof\s+window\s*!==\s*['"]undefined['"]\s*\)/g,
    message: 'Использование typeof window !== "undefined" может вызывать проблемы с гидратацией',
    severity: 'warning'
  },
  {
    pattern: /if\s*\(\s*typeof\s+window\s*===\s*['"]undefined['"]\s*\)/g,
    message: 'Использование typeof window === "undefined" может вызывать проблемы с гидратацией',
    severity: 'warning'
  },
  {
    pattern: /Date\.now\(\)/g,
    message: 'Использование Date.now() может вызывать проблемы с гидратацией',
    severity: 'error'
  },
  {
    pattern: /Math\.random\(\)/g,
    message: 'Использование Math.random() может вызывать проблемы с гидратацией',
    severity: 'error'
  },
  {
    pattern: /new\s+Date\(\)/g,
    message: 'Использование new Date() может вызывать проблемы с гидратацией',
    severity: 'warning'
  },
  {
    pattern: /window\.location/g,
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

// Хорошие паттерны для гидратации
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

  // Проверяем проблемные паттерны
  hydrationPatterns.forEach(({ pattern, message, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match, index) => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          type: 'problem',
          severity,
          message,
          match,
          line: lineNumber,
          pattern: pattern.toString()
        });
      });
    }
  });

  // Проверяем хорошие паттерны
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
  console.log('🔍 Проверка компонентов на проблемы с гидратацией...\n');

  const results = components.map(checkFile);
  const allIssues = [];
  let totalProblems = 0;
  let totalGood = 0;

  results.forEach(result => {
    if (!result.exists) {
      console.log(`❌ Файл не найден: ${result.file}`);
      return;
    }

    const problems = result.issues.filter(issue => issue.type === 'problem');
    const good = result.issues.filter(issue => issue.type === 'good');

    totalProblems += problems.length;
    totalGood += good.length;

    if (problems.length > 0 || good.length > 0) {
      console.log(`\n📄 ${result.file}:`);
      
      if (problems.length > 0) {
        console.log('  ❌ Проблемы:');
        problems.forEach(issue => {
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
    totalProblems,
    totalGood,
    issues: allIssues
  };

  const reportPath = path.join(__dirname, '..', 'hydration-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📊 Результаты:`);
  console.log(`  Проверено файлов: ${results.filter(r => r.exists).length}`);
  console.log(`  Проблем найдено: ${totalProblems}`);
  console.log(`  Хороших практик: ${totalGood}`);
  console.log(`  Отчет сохранен: ${reportPath}`);

  if (totalProblems > 0) {
    console.log('\n❌ Найдены проблемы с гидратацией!');
    console.log('\n💡 Рекомендации:');
    console.log('  1. Используйте useState для управления состоянием гидратации');
    console.log('  2. Используйте useEffect для установки isHydrated');
    console.log('  3. Избегайте прямого обращения к window, document, localStorage');
    console.log('  4. Используйте условный рендеринг с проверкой isHydrated');
    process.exit(1);
  } else {
    console.log('\n✅ Все компоненты работают корректно!');
    process.exit(0);
  }
}

main();
