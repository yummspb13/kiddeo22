# 🚀 Руководство по настройке сервисов для продакшена

## 📁 1. ЗАГРУЗКА ФАЙЛОВ - Cloudinary

### Настройка Cloudinary:

1. **Регистрация**: Перейдите на [cloudinary.com](https://cloudinary.com)
2. **Создание аккаунта**: Зарегистрируйтесь (бесплатный план: 25GB хранилища, 25GB трафика)
3. **Получение ключей**: В Dashboard найдите:
   - `Cloud Name`
   - `API Key` 
   - `API Secret`

### Добавление в переменные окружения:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Установка пакета:
```bash
npm install cloudinary
```

### Интеграция:
- Файл `src/lib/cloudinary.ts` уже подготовлен
- Замените вызовы `/api/upload` на Cloudinary API
- Обновите компоненты загрузки файлов

---

## 💳 2. ПЛАТЕЖИ - API Точки

### Настройка API Точки:

1. **Регистрация**: Перейдите на [developers.tochka.com](https://developers.tochka.com)
2. **Создание приложения**: Создайте новое приложение в Pro API
3. **Получение ключей**: Получите:
   - `Client ID`
   - `Client Secret`

### Добавление в переменные окружения:
```env
TOCHKA_API_URL="https://api.tochka.com"
TOCHKA_CLIENT_ID="your-client-id"
TOCHKA_CLIENT_SECRET="your-client-secret"
```

### Интеграция:
- Файл `src/lib/tochka-api.ts` уже подготовлен
- Замените `createYooKassaPayment` на `createTochkaPayment`
- Настройте webhook для обработки платежей

---

## 📧 3. EMAIL - SendGrid

### Настройка SendGrid:

1. **Регистрация**: Перейдите на [sendgrid.com](https://sendgrid.com)
2. **Создание аккаунта**: Зарегистрируйтесь (100 писем/день бесплатно)
3. **Создание API ключа**: Settings → API Keys → Create API Key
4. **Верификация отправителя**: Settings → Sender Authentication

### Добавление в переменные окружения:
```env
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@kiddeo.ru"
```

### Установка пакета:
```bash
npm install @sendgrid/mail
```

### Интеграция:
- Файл `src/lib/email-service.ts` уже подготовлен
- Замените вызовы `sendEmail` на новый сервис
- Настройте шаблоны писем

---

## 🔄 4. АЛЬТЕРНАТИВЫ

### Email - SMTP (Gmail):
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="KidsReview <noreply@kiddeo.ru>"
```

### Файлы - AWS S3:
```env
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="kiddeo-uploads"
```

---

## ⚙️ 5. ПОРЯДОК НАСТРОЙКИ

### Приоритет 1 (критично):
1. ✅ Создать `.gitignore`
2. ✅ Создать `vercel.json`
3. ✅ Обновить Prisma schema
4. ✅ Добавить предупреждения в upload API

### Приоритет 2 (важно):
1. Настроить Cloudinary для файлов
2. Настроить SendGrid для email
3. Подготовить API Точки для платежей

### Приоритет 3 (желательно):
1. Настроить мониторинг (Sentry)
2. Настроить CDN
3. Оптимизировать производительность

---

## 🚨 6. ВАЖНЫЕ ЗАМЕЧАНИЯ

### Безопасность:
- ❌ НЕ коммитьте `.env` файлы
- ✅ Используйте `.env.production` только локально
- ✅ Добавляйте переменные в Vercel Dashboard

### Тестирование:
- 🧪 Тестируйте каждый сервис отдельно
- 🔍 Проверяйте логи в Vercel Dashboard
- 📊 Мониторьте использование квот

### Резервные планы:
- 📧 Email: SMTP как fallback
- 📁 Файлы: Временно отключены в продакшене
- 💳 Платежи: Mock режим до настройки API Точки

---

## 📞 7. ПОДДЕРЖКА

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь в правильности переменных окружения
3. Проверьте квоты сервисов
4. Обратитесь к документации сервисов

**Готово к деплою!** 🎉
