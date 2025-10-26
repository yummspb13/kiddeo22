const https = require('https');
const http = require('http');

// Отключаем проверку SSL для локального тестирования
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const baseUrl = 'http://localhost:3000';
const venueId = 3;

// Вкладки из левого меню дашборда
const tabs = [
  { id: 'overview', name: 'Обзор' },
  { id: 'edit', name: 'Редактирование' },
  { id: 'analytics', name: 'Аналитика' },
  { id: 'reviews', name: 'Отзывы' },
  { id: 'qa', name: 'Вопросы/Ответы' },
  { id: 'chat', name: 'Чат с клиентами' },
  { id: 'news', name: 'Новости' },
  { id: 'products', name: 'Товары/Услуги' }
];

// Функция для измерения времени загрузки
function measureLoadTime(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        resolve({
          status: response.statusCode,
          time: loadTime,
          size: data.length,
          headers: response.headers
        });
      });
    });
    
    request.on('error', (error) => {
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      resolve({
        status: 'ERROR',
        time: loadTime,
        error: error.message
      });
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      resolve({
        status: 'TIMEOUT',
        time: 30000,
        error: 'Request timeout'
      });
    });
  });
}

// Основная функция тестирования
async function testVenueDashboardPerformance() {
  console.log('🚀 Тестирование производительности дашборда места\n');
  console.log('=' * 60);
  
  // Тестируем основную страницу дашборда
  console.log('\n📊 Основная страница дашборда:');
  const mainPageResult = await measureLoadTime(`${baseUrl}/vendor/venues/${venueId}`);
  console.log(`   URL: ${baseUrl}/vendor/venues/${venueId}`);
  console.log(`   Статус: ${mainPageResult.status}`);
  console.log(`   Время загрузки: ${mainPageResult.time}ms`);
  if (mainPageResult.error) {
    console.log(`   Ошибка: ${mainPageResult.error}`);
  }
  
  // Тестируем API endpoints для каждой вкладки
  console.log('\n📊 API endpoints для вкладок:');
  
  const apiEndpoints = [
    { name: 'Отзывы', url: `${baseUrl}/api/vendor/venues/${venueId}/reviews` },
    { name: 'Аналитика', url: `${baseUrl}/api/vendor/venues/${venueId}/analytics` },
    { name: 'Вопросы/Ответы', url: `${baseUrl}/api/vendor/venues/${venueId}/qa` },
    { name: 'Новости', url: `${baseUrl}/api/vendor/venues/${venueId}/news` },
    { name: 'Обновление места', url: `${baseUrl}/api/vendor/venues/${venueId}/update` }
  ];
  
  for (const endpoint of apiEndpoints) {
    console.log(`\n   🔍 ${endpoint.name}:`);
    const result = await measureLoadTime(endpoint.url);
    console.log(`      URL: ${endpoint.url}`);
    console.log(`      Статус: ${result.status}`);
    console.log(`      Время загрузки: ${result.time}ms`);
    if (result.error) {
      console.log(`      Ошибка: ${result.error}`);
    }
  }
  
  // Тестируем другие связанные страницы
  console.log('\n📊 Связанные страницы:');
  
  const relatedPages = [
    { name: 'Список мест вендора', url: `${baseUrl}/vendor/venues` },
    { name: 'Создание места', url: `${baseUrl}/vendor/venues/create` },
    { name: 'Дашборд вендора', url: `${baseUrl}/vendor/dashboard` }
  ];
  
  for (const page of relatedPages) {
    console.log(`\n   🔍 ${page.name}:`);
    const result = await measureLoadTime(page.url);
    console.log(`      URL: ${page.url}`);
    console.log(`      Статус: ${result.status}`);
    console.log(`      Время загрузки: ${result.time}ms`);
    if (result.error) {
      console.log(`      Ошибка: ${result.error}`);
    }
  }
  
  console.log('\n' + '=' * 60);
  console.log('✅ Тестирование завершено');
}

// Запускаем тестирование
testVenueDashboardPerformance().catch(console.error);
