# Система мониторинга API Kiddeo

## 🚀 Быстрый старт

### 1. Инициализация системы логирования
```bash
npm run init:logging
```

### 2. Запуск сервера с защитой от зависания
```bash
npm run dev:timeout
```

### 3. Открытие мониторинга
- **Мониторинг**: http://localhost:3000/monitor
- **Админ панель**: http://localhost:3000/admin?key=kidsreview2025
- **API Health**: http://localhost:3000/api/health

## 📊 Возможности системы

### Автоматическое логирование
- ✅ Все API запросы логируются автоматически
- ✅ Измерение времени выполнения
- ✅ Сохранение в SQLite с оптимизацией
- ✅ Отслеживание ошибок и статус кодов

### Мониторинг в реальном времени
- 📈 Статистика запросов
- ⏱️ Среднее время выполнения
- 🚨 Процент ошибок
- 📊 Самые медленные роуты
- 💾 Использование памяти

### Оптимизация SQLite
- ⚡ WAL режим для лучшей производительности
- 🔍 Индексы для быстрых запросов
- 🧹 Автоматическая очистка старых логов
- 📊 Анализ производительности

## 🛠️ API Endpoints

### Мониторинг
- `GET /api/monitor?type=memory` - Данные из памяти (быстро)
- `GET /api/monitor?type=database` - Данные из БД (полно)
- `GET /api/monitor?type=health` - Здоровье системы
- `POST /api/monitor` - Управление логами

### Оптимизация
- `GET /api/optimize?action=stats` - Статистика БД
- `GET /api/optimize?action=optimize` - Оптимизация БД
- `GET /api/optimize?action=cleanup&days=30` - Очистка логов

### Инициализация
- `GET /api/init?action=health` - Проверка здоровья
- `GET /api/init?action=init` - Инициализация системы

## 🔧 Настройка

### Переменные окружения
```bash
# Порт сервера
PORT=3000

# Хост сервера
HOST=localhost

# URL базы данных
DATABASE_URL="file:./dev.db"
```

### Таймауты
- **Запуск сервера**: 15 секунд
- **API запросы**: без ограничений (можно настроить)
- **Автообновление мониторинга**: 5 секунд

## 📈 Мониторинг производительности

### Метрики
- **Total Requests**: Общее количество запросов
- **Avg Duration**: Среднее время выполнения
- **Error Rate**: Процент ошибок
- **Status Codes**: Распределение по статус кодам
- **Slowest Routes**: Самые медленные роуты

### Индексы базы данных
Созданы индексы для:
- `User` (email, role, createdAt)
- `Vendor` (userId, cityId, type, kycStatus)
- `Listing` (vendorId, cityId, categoryId, isActive, createdAt)
- `AfishaEvent` (city, status, startDate, isPopular)
- `VenuePartner` (vendorId, cityId, status, subcategoryId)
- `Order` (userId, vendorId, status, createdAt)
- `Payment` (userId, status, createdAt)
- `Notification` (userId, isRead, createdAt)
- `api_logs` (timestamp, pathname, status_code, duration, method)

## 🚨 Устранение неполадок

### Сервер не запускается
1. Проверьте порт 3000 (может быть занят)
2. Запустите `npm run init:logging`
3. Проверьте подключение к БД

### Медленные запросы
1. Откройте мониторинг: http://localhost:3000/monitor
2. Проверьте вкладку "Slowest Routes"
3. Запустите оптимизацию: `GET /api/optimize?action=optimize`

### Ошибки в логах
1. Проверьте вкладку "Recent Logs"
2. Фильтруйте по статус кодам
3. Проверьте детали ошибок

## 📝 Логирование

### Уровни логирования
- **INFO**: Обычные запросы
- **WARN**: Медленные запросы (>1000ms)
- **ERROR**: Ошибки сервера (4xx, 5xx)

### Ротация логов
- Логи хранятся в памяти (1000 записей)
- Старые логи сохраняются в БД
- Автоматическая очистка через 30 дней

## 🔒 Безопасность

### Защита мониторинга
- Страница мониторинга доступна всем
- Админ панель защищена ключом: `kidsreview2025`
- API endpoints не требуют авторизации

### Заголовки безопасности
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📚 Дополнительные команды

```bash
# Проверка здоровья системы
curl http://localhost:3000/api/health

# Статистика базы данных
curl http://localhost:3000/api/optimize?action=stats

# Оптимизация базы данных
curl -X POST http://localhost:3000/api/optimize -d '{"action":"optimize"}'

# Очистка старых логов
curl -X POST http://localhost:3000/api/optimize -d '{"action":"cleanup","daysToKeep":7}'
```

## 🎯 Следующие шаги

1. **Запустите систему**: `npm run dev:timeout`
2. **Откройте мониторинг**: http://localhost:3000/monitor
3. **Проверьте админ панель**: http://localhost:3000/admin?key=kidsreview2025
4. **Протестируйте API**: Сделайте несколько запросов
5. **Наблюдайте за метриками**: Следите за производительностью

---

**Примечание**: Система автоматически логирует все API запросы и предоставляет детальную статистику производительности. Используйте мониторинг для выявления узких мест и оптимизации приложения.
