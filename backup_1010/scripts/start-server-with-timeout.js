#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Настройки
const TIMEOUT_MS = 15000; // 15 секунд
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

console.log('🚀 Starting server with timeout protection...');
console.log(`⏱️  Timeout: ${TIMEOUT_MS}ms`);
console.log(`🌐 URL: http://${HOST}:${PORT}`);

// Запускаем Next.js сервер
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: PORT,
    HOST: HOST,
  }
});

// Таймер для принудительного завершения
let timeoutId;
let isServerReady = false;

const startTimeout = () => {
  timeoutId = setTimeout(() => {
    if (!isServerReady) {
      console.log('⏰ Server startup timeout reached!');
      console.log('🔄 Attempting to restart...');
      
      // Убиваем текущий процесс
      server.kill('SIGTERM');
      
      // Перезапускаем через 2 секунды
      setTimeout(() => {
        console.log('🔄 Restarting server...');
        startServer();
      }, 2000);
    }
  }, TIMEOUT_MS);
};

// Функция для запуска сервера
function startServer() {
  const newServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: PORT,
      HOST: HOST,
    }
  });

  // Обработка выхода
  newServer.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code} and signal ${signal}`);
    if (code !== 0 && !isServerReady) {
      console.log('🔄 Server failed to start, retrying...');
      setTimeout(() => startServer(), 3000);
    }
  });

  // Обработка ошибок
  newServer.on('error', (error) => {
    console.error('Server error:', error);
    if (!isServerReady) {
      console.log('🔄 Server error, retrying...');
      setTimeout(() => startServer(), 3000);
    }
  });

  // Проверяем готовность сервера
  const checkServer = () => {
    const http = require('http');
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 1000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        isServerReady = true;
        clearTimeout(timeoutId);
        console.log('✅ Server is ready!');
        console.log(`🌐 Open http://${HOST}:${PORT} in your browser`);
        console.log(`📊 Monitor: http://${HOST}:${PORT}/monitor`);
        console.log(`🔧 Admin: http://${HOST}:${PORT}/admin?key=kidsreview2025`);
      }
    });

    req.on('error', () => {
      // Сервер еще не готов, проверяем снова через 1 секунду
      setTimeout(checkServer, 1000);
    });

    req.on('timeout', () => {
      req.destroy();
      setTimeout(checkServer, 1000);
    });

    req.end();
  };

  // Начинаем проверку через 3 секунды
  setTimeout(checkServer, 3000);
  startTimeout();
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  clearTimeout(timeoutId);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  clearTimeout(timeoutId);
  process.exit(0);
});

// Запускаем сервер
startServer();
