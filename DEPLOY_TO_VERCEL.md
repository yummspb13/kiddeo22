# 🚀 ДЕПЛОЙ НА VERCEL - ИНСТРУКЦИЯ

## 📋 **ПЕРЕД ДЕПЛОЕМ:**

### 1. **Подготовить репозиторий**
```bash
git add .
git commit -m "feat: add Cloudinary integration and admin settings panel"
git push origin main
```

### 2. **Переменные окружения для Vercel**

Добавить в Vercel Dashboard → Settings → Environment Variables:

#### **База данных:**
```
DATABASE_URL=postgresql://postgres:Rat60672793@db.flweimcadtsksqzyllno.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:Rat60672793@db.flweimcadtsksqzyllno.supabase.co:5432/postgres
```

#### **Cloudinary (готово):**
```
CLOUDINARY_CLOUD_NAME=dkbh2wihq
CLOUDINARY_API_KEY=246521541339249
CLOUDINARY_API_SECRET=ps0PRzY_Mxex1Kfl0OutqaH-98o
```

#### **App Config:**
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-secret-key-here
NODE_ENV=production
```

#### **API Keys (заполнить вашими):**
```
DADATA_API_KEY=your-dadata-key
YANDEX_MAPS_API_KEY=your-yandex-key
OPENAI_API_KEY=your-openai-key
```

#### **Email (опционально):**
```
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@kiddeo.ru
```

#### **Платежи (опционально):**
```
TOCHKA_API_URL=https://api.tochka.com
TOCHKA_CLIENT_ID=your-client-id
TOCHKA_CLIENT_SECRET=your-client-secret
```

## 🔧 **ПРОЦЕСС ДЕПЛОЯ:**

### 1. **Подключить GitHub к Vercel**
- Зайти на [vercel.com](https://vercel.com)
- Import Project → выбрать репозиторий `kiddeo22`
- Настроить переменные окружения

### 2. **Настройки проекта**
- **Framework Preset**: Next.js
- **Root Directory**: `./` (корень проекта)
- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`

### 3. **Деплой**
- Нажать "Deploy"
- Дождаться завершения

## 🧪 **ТЕСТИРОВАНИЕ ПОСЛЕ ДЕПЛОЯ:**

### 1. **Проверить основные страницы**
- Главная страница
- Админ-панель: `/admin/dashboard`
- Настройки сервисов: `/admin/settings`

### 2. **Протестировать Cloudinary**
- Зайти в админку → Настройки сервисов
- Включить Cloudinary
- Протестировать загрузку файла

### 3. **Проверить API**
- `/api/health` - статус системы
- `/api/upload` - загрузка файлов

## ⚠️ **ВОЗМОЖНЫЕ ПРОБЛЕМЫ:**

### 1. **База данных**
- Если ошибка подключения к PostgreSQL
- Проверить переменные DATABASE_URL и DIRECT_URL

### 2. **Build ошибки**
- Проверить все импорты
- Убедиться что все зависимости установлены

### 3. **Cloudinary**
- Если не работает загрузка файлов
- Проверить переменные CLOUDINARY_*

## 🎯 **ПОСЛЕ УСПЕШНОГО ДЕПЛОЯ:**

1. **Настроить Cloudinary** через админ-панель
2. **Протестировать загрузку файлов**
3. **Настроить остальные сервисы** по необходимости
4. **Показать проект** заказчику

## 📞 **ПОДДЕРЖКА:**

Если возникнут проблемы:
1. Проверить логи в Vercel Dashboard
2. Проверить переменные окружения
3. Проверить подключение к базе данных

**Готово к деплою!** 🚀
