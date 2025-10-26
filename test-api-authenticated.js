#!/usr/bin/env node

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Импортируем функции для работы с токенами
const { generateTestToken } = require('./scripts/generate-test-token');

// Категории API endpoints
const API_CATEGORIES = {
  public: [
    '/api/health',
    '/api/_ping', 
    '/api/cities',
    '/api/collections',
    '/api/venues',
    '/api/events',
    '/api/analytics',
    '/api/notifications',
    '/api/public/cities',
    '/api/public/venues',
    '/api/search',
    '/api/search-simple',
    '/api/hero-slots-public'
  ],
  authenticated: [
    '/api/profile',
    '/api/profile/children',
    '/api/profile/orders',
    '/api/profile/favorites',
    '/api/profile/reviews',
    '/api/profile/points',
    '/api/profile/notifications',
    '/api/profile/settings',
    '/api/orders',
    '/api/cart',
    '/api/venue-reviews',
    '/api/venue-review-replies',
    '/api/vendor',
    '/api/vendor/venues',
    '/api/vendor/onboarding'
  ],
  admin: [
    '/api/admin/users',
    '/api/admin/venues',
    '/api/admin/collections',
    '/api/admin/afisha',
    '/api/admin/afisha/events',
    '/api/admin/afisha/categories',
    '/api/admin/notifications',
    '/api/admin/audit-log',
    '/api/admin/roles',
    '/api/admin/vendors',
    '/api/admin/analytics'
  ]
};

// Функция для измерения времени загрузки API
async function measureApiLoad(url, method = 'GET', headers = {}) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    const request = http.request(url, options, (response) => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          loadTime: Math.round(loadTime),
          contentLength: data.length,
          headers: response.headers,
          success: response.statusCode >= 200 && response.statusCode < 400,
          method: method
        });
      });
    });
    
    request.on('error', (error) => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      resolve({
        status: 0,
        loadTime: Math.round(loadTime),
        contentLength: 0,
        error: error.message,
        success: false,
        method: method
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      resolve({
        status: 0,
        loadTime: Math.round(loadTime),
        contentLength: 0,
        error: 'Timeout',
        success: false,
        method: method
      });
    });
    
    request.end();
  });
}

// Функция для тестирования API с аутентификацией
async function testApiWithAuth(endpoint, token) {
  const results = [];
  const methods = ['GET', 'POST'];
  
  for (const method of methods) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const result = await measureApiLoad(url, method, headers);
    results.push({
      ...result,
      endpoint: endpoint,
      method: method,
      authenticated: !!token
    });
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Основная функция тестирования
async function runAuthenticatedApiTest() {
  console.log('🚀 Запуск тестирования API с аутентификацией...\n');
  
  let testToken = null;
  
  try {
    // Генерируем тестовый токен
    console.log('🔑 Генерация тестового токена...');
    testToken = await generateTestToken();
    console.log('✅ Токен получен\n');
  } catch (error) {
    console.log('⚠️  Не удалось получить токен, тестируем без аутентификации\n');
  }
  
  const allResults = [];
  let totalTests = 0;
  let successfulTests = 0;
  let totalLoadTime = 0;
  
  // Тестируем каждую категорию
  for (const [categoryName, endpoints] of Object.entries(API_CATEGORIES)) {
    console.log(`\n🔍 Тестирование ${categoryName.toUpperCase()} API...`);
    console.log('=' * 60);
    
    let categoryResults = [];
    let categorySuccessful = 0;
    let categoryTotal = 0;
    
    for (const endpoint of endpoints) {
      console.log(`\n📡 ${endpoint}`);
      
      // Определяем, нужна ли аутентификация
      const needsAuth = categoryName !== 'public' && testToken;
      const token = needsAuth ? testToken : null;
      
      const results = await testApiWithAuth(endpoint, token);
      allResults.push(...results);
      categoryResults.push(...results);
      
      // Анализируем результаты для этого endpoint
      const successfulMethods = results.filter(r => r.success);
      const failedMethods = results.filter(r => !r.success);
      
      if (successfulMethods.length > 0) {
        console.log(`  ✅ Работающие методы: ${successfulMethods.map(r => r.method).join(', ')}`);
        successfulMethods.forEach(result => {
          const time = result.loadTime > 1000 ? `🔴 ${result.loadTime}ms` : 
                       result.loadTime > 500 ? `🟡 ${result.loadTime}ms` : 
                       `🟢 ${result.loadTime}ms`;
          console.log(`    ${result.method}: ${time} | ${result.status} | ${result.contentLength} bytes`);
        });
      }
      
      if (failedMethods.length > 0) {
        console.log(`  ❌ Не работающие методы: ${failedMethods.map(r => r.method).join(', ')}`);
        failedMethods.forEach(result => {
          const error = result.error || `HTTP ${result.status}`;
          console.log(`    ${result.method}: ${error}`);
        });
      }
      
      totalTests += results.length;
      successfulTests += successfulMethods.length;
      totalLoadTime += results.reduce((sum, r) => sum + r.loadTime, 0);
      
      categoryTotal += results.length;
      categorySuccessful += successfulMethods.length;
      
      // Пауза между endpoints
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Статистика по категории
    const categorySuccessRate = categoryTotal > 0 ? ((categorySuccessful / categoryTotal) * 100).toFixed(1) : 0;
    const categoryAvgTime = categorySuccessful > 0 ? 
      Math.round(categoryResults.filter(r => r.success).reduce((sum, r) => sum + r.loadTime, 0) / categorySuccessful) : 0;
    
    console.log(`\n📊 Статистика ${categoryName}:`);
    console.log(`   Успешность: ${categorySuccessful}/${categoryTotal} (${categorySuccessRate}%)`);
    console.log(`   Среднее время: ${categoryAvgTime}ms`);
  }
  
  // Общая статистика
  console.log('\n' + '=' * 80);
  console.log('📊 ОБЩАЯ СТАТИСТИКА API');
  console.log('=' * 80);
  
  const successRate = totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0;
  const avgLoadTime = successfulTests > 0 ? Math.round(totalLoadTime / successfulTests) : 0;
  
  console.log(`📈 Всего тестов: ${totalTests}`);
  console.log(`✅ Успешных: ${successfulTests} (${successRate}%)`);
  console.log(`❌ Неудачных: ${totalTests - successfulTests}`);
  console.log(`⏱️  Среднее время ответа: ${avgLoadTime}ms`);
  
  // Топ-10 самых медленных API
  const slowApis = allResults
    .filter(r => r.success)
    .sort((a, b) => b.loadTime - a.loadTime)
    .slice(0, 10);
  
  if (slowApis.length > 0) {
    console.log('\n🐌 Топ-10 самых медленных API:');
    slowApis.forEach((api, index) => {
      console.log(`${index + 1}. ${api.method} ${api.endpoint}: ${api.loadTime}ms`);
    });
  }
  
  // Статистика по методам HTTP
  const methodStats = {};
  allResults.forEach(result => {
    if (!methodStats[result.method]) {
      methodStats[result.method] = { total: 0, success: 0, avgTime: 0 };
    }
    methodStats[result.method].total++;
    if (result.success) {
      methodStats[result.method].success++;
      methodStats[result.method].avgTime += result.loadTime;
    }
  });
  
  console.log('\n📊 Статистика по HTTP методам:');
  Object.entries(methodStats).forEach(([method, stats]) => {
    const successRate = ((stats.success / stats.total) * 100).toFixed(1);
    const avgTime = stats.success > 0 ? Math.round(stats.avgTime / stats.success) : 0;
    console.log(`  ${method}: ${stats.success}/${stats.total} (${successRate}%) | ${avgTime}ms`);
  });
  
  // Рекомендации
  console.log('\n💡 РЕКОМЕНДАЦИИ:');
  
  if (successRate < 80) {
    console.log('⚠️  Низкий процент успешных API вызовов - требуется диагностика');
  }
  
  if (avgLoadTime > 1000) {
    console.log('⚠️  Среднее время ответа превышает 1 секунду - рекомендуется оптимизация');
  }
  
  const verySlowApis = allResults.filter(r => r.success && r.loadTime > 2000);
  if (verySlowApis.length > 0) {
    console.log(`⚠️  ${verySlowApis.length} API вызовов выполняются дольше 2 секунд`);
  }
  
  console.log('\n✅ Тестирование API с аутентификацией завершено!');
  
  // Сохраняем результаты в файл
  const reportData = {
    timestamp: new Date().toISOString(),
    totalTests: totalTests,
    successfulTests: successfulTests,
    successRate: parseFloat(successRate),
    avgLoadTime: avgLoadTime,
    slowApis: slowApis.slice(0, 5),
    methodStats: methodStats,
    authenticated: !!testToken
  };
  
  fs.writeFileSync('api-test-authenticated-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Результаты сохранены в api-test-authenticated-results.json');
}

// Запуск тестирования
runAuthenticatedApiTest().catch(console.error);
