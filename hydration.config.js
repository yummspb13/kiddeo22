module.exports = {
  // Базовый URL для проверки
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000',
  
  // Таймаут для загрузки страниц (мс)
  timeout: 30000,
  
  // Директория для сохранения отчетов
  outputDir: './hydration-reports',
  
  // Паттерны для исключения из проверки
  excludePatterns: [
    '/api/',
    '/_next/',
    '/favicon.ico',
    '/sw.js',
    '/manifest.json'
  ],
  
  // Дополнительные страницы для проверки
  additionalPages: [
    // Добавьте сюда дополнительные страницы
  ],
  
  // Настройки браузера
  browserOptions: {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
}
