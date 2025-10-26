// Простой тест для отладки
console.log('🔍 Starting debug test...');

// Проверяем, можем ли мы подключиться к серверу
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

console.log('🔍 Attempting to connect to localhost:3000...');

const req = http.request(options, (res) => {
  console.log('✅ Server responded!');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response length:', data.length);
    console.log('First 200 chars:', data.substring(0, 200));
  });
});

req.on('error', (error) => {
  console.log('❌ Connection error:', error.message);
});

req.on('timeout', () => {
  console.log('❌ Request timeout');
  req.destroy();
});

req.end();
