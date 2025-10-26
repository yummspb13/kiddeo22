# Excel загрузчик данных для мероприятий и мест

Этот набор скриптов позволяет экспортировать и импортировать данные мероприятий и мест из/в Excel файлы.

## Структура файлов

- `excel-loader.ts` - Основной скрипт для работы с Excel файлами
- `run-excel.js` - Удобный запуск Excel загрузчика

## ✅ Готовые Excel файлы с текущими данными

- `src/data/events-2025-10-25.xlsx` - Текущие мероприятия из базы данных
- `src/data/venues-2025-10-25.xlsx` - Текущие места из базы данных

## Экспорт данных в Excel

### Автоматический экспорт
```bash
npm run excel-export
```
(или `npx tsx src/scripts/excel-loader.ts --export`)

Это создаст файлы `events-YYYY-MM-DD.xlsx` и `venues-YYYY-MM-DD.xlsx` в директории `src/data`.

### Экспорт с указанием файлов
```bash
npm run excel-export -- src/data/my-events.xlsx src/data/my-venues.xlsx
```
(или `npx tsx src/scripts/excel-loader.ts --export src/data/my-events.xlsx src/data/my-venues.xlsx`)

## Загрузка данных из Excel

### Загрузка мероприятий
```bash
npm run excel-load -- src/data/events-2025-10-25.xlsx
```
(или `npx tsx src/scripts/excel-loader.ts src/data/events-2025-10-25.xlsx`)

### Загрузка мест
```bash
npm run excel-load -- src/data/venues-2025-10-25.xlsx
```
(или `npx tsx src/scripts/excel-loader.ts src/data/venues-2025-10-25.xlsx`)

### Загрузка с очисткой существующих данных
```bash
npm run excel-load -- src/data/events-2025-10-25.xlsx src/data/venues-2025-10-25.xlsx --clear
```

## Структура Excel файлов

### Мероприятия (events-2025-10-25.xlsx)

**Основные поля:**
- `title` - Название мероприятия
- `description` - Описание
- `image` - Основное изображение
- `gallery` - Галерея изображений (через запятую)
- `tickets` - Билеты (JSON строка)
- `startDate` - Дата начала (ISO формат)
- `endDate` - Дата окончания (ISO формат)
- `location` - Место проведения
- `organizer` - Организатор
- `minPrice` - Минимальная цена
- `isPaid` - Платное ли мероприятие (true/false)
- `city` - Город
- `citySlug` - Слаг города
- `category` - Категория
- `categoryId` - ID категории
- `coordinates` - Координаты (широта,долгота)
- `ageFrom` - Возраст от
- `ageTo` - Возраст до
- `ageGroups` - Возрастные группы (JSON массив)
- `isPopular` - Популярное (true/false)
- `isPromoted` - Продвигаемое (true/false)
- `priority` - Приоритет
- `status` - Статус (active/inactive)
- `order` - Порядок сортировки
- `quickFilterIds` - ID быстрых фильтров
- `richDescription` - HTML описание

**Билеты (отдельные колонки):**
- `ticketName1` - Название билета 1
- `ticketPrice1` - Цена билета 1
- `ticketCurrency1` - Валюта билета 1
- `ticketName2` - Название билета 2
- `ticketPrice2` - Цена билета 2
- `ticketCurrency2` - Валюта билета 2
- `ticketName3` - Название билета 3
- `ticketPrice3` - Цена билета 3
- `ticketCurrency3` - Валюта билета 3

### Места (venues-2025-10-25.xlsx)

**Основные поля:**
- `name` - Название места
- `description` - Описание
- `image` - Основное изображение
- `additionalImages` - Дополнительные изображения (через запятую)
- `location` - Адрес
- `district` - Район
- `metro` - Метро
- `priceFrom` - Цена от
- `priceTo` - Цена до
- `city` - Город
- `citySlug` - Слаг города
- `subcategory` - Подкатегория
- `subcategoryId` - ID подкатегории
- `coordinates` - Координаты (широта,долгота)
- `ageFrom` - Возраст от
- `ageTo` - Возраст до
- `tariff` - Тариф (FREE/SUPER/MAXIMUM)
- `status` - Статус (ACTIVE/MODERATION/HIDDEN)
- `moderationReason` - Причина модерации
- `timezone` - Часовой пояс
- `fiasId` - ФИАС ID
- `kladrId` - КЛАДР ID
- `workingHours` - Рабочие часы
- `richDescription` - HTML описание

## Преимущества Excel файлов

1. **Удобство редактирования** - Легко изменять данные в Excel
2. **Визуальная структура** - Все поля видны в таблице
3. **Валидация данных** - Excel может проверять типы данных
4. **Массовое редактирование** - Легко копировать и вставлять данные
5. **Фильтрация и сортировка** - Удобно работать с большими объемами данных

## Команды для package.json

Добавьте в `package.json`:

```json
{
  "scripts": {
    "excel-export": "node src/scripts/run-excel.js --export",
    "excel-load": "node src/scripts/run-excel.js"
  }
}
```

## Примеры использования

### 1. Экспорт текущих данных
```bash
npm run excel-export
```

### 2. Редактирование данных в Excel
Откройте созданные файлы в Excel, отредактируйте данные и сохраните.

### 3. Загрузка измененных данных
```bash
npm run excel-load -- src/data/events-2025-10-25.xlsx --clear
```

### 4. Загрузка только мест
```bash
npm run excel-load -- src/data/venues-2025-10-25.xlsx
```

## Важные замечания

1. **Обязательные поля** - `title` для мероприятий, `name` для мест
2. **Даты** - Используйте ISO формат (2025-02-15T10:00:00.000Z)
3. **Координаты** - Формат "широта,долгота" (55.7558,37.6176)
4. **JSON поля** - `ageGroups`, `tickets` должны быть в JSON формате
5. **Булевы значения** - Используйте true/false
6. **Связи** - `categoryId`, `subcategoryId` должны существовать в базе

## Ошибки и их решения

- **"Не найден vendor"** - Создайте vendor в базе данных
- **"Не найдена subcategory"** - Создайте subcategory в базе данных  
- **"Не найден city"** - Создайте city в базе данных
- **"Invalid date"** - Проверьте формат даты в ISO
- **"Unique constraint failed"** - Slug уже существует, будет добавлен суффикс
