#!/bin/bash

echo "🔍 Поиск файлов с NextAuth импортами..."
echo "================================================"

# Создаем папку scripts если её нет
mkdir -p scripts

# Поиск всех файлов с NextAuth импортами
echo "📄 Файлы с импортами next-auth:"
grep -r "from ['\"]next-auth" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l

echo ""
echo "📄 Файлы с getServerSession:"
grep -r "getServerSession" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l

echo ""
echo "📄 Файлы с useSession:"
grep -r "useSession" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l

echo ""
echo "📄 Файлы с authOptions:"
grep -r "authOptions" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l

echo ""
echo "📄 Файлы с SessionProvider:"
grep -r "SessionProvider" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l

echo ""
echo "================================================"
echo "📊 Статистика:"

echo "Всего файлов с next-auth импортами:"
grep -r "from ['\"]next-auth" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l | wc -l

echo "Всего файлов с getServerSession:"
grep -r "getServerSession" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l | wc -l

echo "Всего файлов с useSession:"
grep -r "useSession" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l | wc -l

echo ""
echo "✅ Поиск завершен!"
