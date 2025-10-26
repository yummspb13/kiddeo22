#!/bin/bash

# quick-restore.sh - Быстрое восстановление базы данных Kiddeo
# Использование: ./quick-restore.sh

echo "🚀 Быстрое восстановление базы данных Kiddeo"
echo "⚠️  ВНИМАНИЕ: Все существующие данные будут удалены!"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Проверяем наличие файла экспорта
if [ ! -f "database-export.json" ]; then
    echo "⚠️  Файл database-export.json не найден"
    echo "📤 Создаем экспорт текущих данных..."
    node export-sqlite.js
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка при создании экспорта"
        exit 1
    fi
fi

# Останавливаем приложение (если запущено)
echo "🛑 Останавливаем приложение..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Ждем немного
sleep 2

# Восстанавливаем базу данных
echo "🔄 Восстанавливаем базу данных..."
node restore-from-export.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Восстановление завершено успешно!"
    echo ""
    echo "📋 Следующие шаги:"
    echo "   1. Запустите миграции: npx prisma db push"
    echo "   2. Запустите приложение: npm run dev"
    echo ""
    echo "🎉 База данных готова к использованию!"
else
    echo ""
    echo "❌ Ошибка при восстановлении базы данных"
    echo "📞 Обратитесь к разработчику"
    exit 1
fi
