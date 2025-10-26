#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🔍 Starting server diagnostics...');

// Функция для проверки HTTP запроса
function checkEndpoint(url, timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          success: true,
          status: res.statusCode,
          duration,
          size: data.length,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: error.message,
        duration
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: 'Timeout',
        duration
      });
    });
  });
}

// Проверяем различные эндпоинты
async function runDiagnostics() {
  console.log('\n📊 Testing endpoints...');
  
  const endpoints = [
    'http://localhost:3000/',
    'http://localhost:3000/city/moskva',
    'http://localhost:3000/city/moskva/cat/razvlecheniya/zoo',
    'http://localhost:3000/city/moskva/venue/popugaynya',
    'http://localhost:3000/api/simple-venue-reviews?venueId=1',
    'http://localhost:3000/api/simple-user'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint}`);
    const result = await checkEndpoint(endpoint, 10000);
    
    if (result.success) {
      console.log(`✅ Status: ${result.status}, Duration: ${result.duration}ms, Size: ${result.size} bytes`);
    } else {
      console.log(`❌ Error: ${result.error}, Duration: ${result.duration}ms`);
    }
  }
  
  console.log('\n🏁 Diagnostics complete');
}

// Проверяем, запущен ли сервер
async function checkServerStatus() {
  console.log('🔍 Checking if server is running...');
  
  const result = await checkEndpoint('http://localhost:3000/', 3000);
  
  if (result.success) {
    console.log('✅ Server is running and responding');
    return true;
  } else {
    console.log('❌ Server is not responding:', result.error);
    return false;
  }
}

// Запускаем диагностику
async function main() {
  const serverRunning = await checkServerStatus();
  
  if (serverRunning) {
    await runDiagnostics();
  } else {
    console.log('\n💡 Server is not running. Please start it with: npm run dev');
  }
}

main().catch(console.error);
