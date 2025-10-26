# Загрузчик данных для мероприятий и мест

Этот набор скриптов позволяет экспортировать и импортировать данные мероприятий и мест из/в базу данных.

## Структура файлов

- `export-data.ts` - Скрипт для экспорта данных из базы в JSON файлы
- `data-loader.ts` - Скрипт для загрузки данных из JSON файлов в базу
- `run-export.js` - Удобный запуск экспорта
- `run-loader.js` - Удобный запуск загрузки

## ✅ Готовые примеры файлов

- `src/data/events-example.json` - Пример файла с мероприятиями
- `src/data/venues-example.json` - Пример файла с местами
- `src/data/exported-events-2025-10-25.json` - Экспортированные мероприятия
- `src/data/exported-venues-2025-10-25.json` - Экспортированные места

## Экспорт данных

### Автоматический экспорт
```bash
# Экспорт всех данных с автоматическими именами файлов
npx tsx src/scripts/export-data.ts

# Или через удобный скрипт
node src/scripts/run-export.js
```

### Ручной экспорт
```bash
# Экспорт с указанием путей к файлам
npx tsx src/scripts/export-data.ts ./my-events.json ./my-venues.json
```

## Загрузка данных

### Загрузка из экспортированных файлов
```bash
# Загрузка мероприятий
npx tsx src/scripts/data-loader.ts ./src/data/exported-events-2025-10-25.json

# Загрузка мест
npx tsx src/scripts/data-loader.ts ./src/data/exported-venues-2025-10-25.json

# Загрузка и мероприятий, и мест
npx tsx src/scripts/data-loader.ts ./src/data/exported-events-2025-10-25.json ./src/data/exported-venues-2025-10-25.json

# Загрузка с очисткой существующих данных
npx tsx src/scripts/data-loader.ts ./src/data/exported-events-2025-10-25.json ./src/data/exported-venues-2025-10-25.json --clear
```

### Через удобный скрипт
```bash
node src/scripts/run-loader.js
```

## Структура данных

### Мероприятия (AfishaEvent)
```json
{
  "title": "Название мероприятия",
  "description": "Описание",
  "image": "/path/to/image.jpg",
  "startDate": "2025-02-15T10:00:00.000Z",
  "endDate": "2025-02-15T12:00:00.000Z",
  "location": "Место проведения",
  "organizer": "Организатор",
  "minPrice": 500,
  "isPaid": true,
  "city": "Москва",
  "category": "Театры",
  "coordinates": "55.7558,37.6176",
  "ageFrom": 6,
  "ageTo": 12,
  "ageGroups": ["6-8", "9-12"],
  "isPopular": true,
  "isPromoted": false,
  "priority": 5,
  "richDescription": "<p>HTML описание</p>"
}
```

### Места (VenuePartner)
```json
{
  "name": "Название места",
  "description": "Описание",
  "image": "/path/to/image.jpg",
  "location": "Адрес",
  "district": "Район",
  "metro": "Станция метро",
  "priceFrom": 1000,
  "priceTo": 2000,
  "city": "Москва",
  "subcategory": "Зоопарки",
  "coordinates": "55.7558,37.6176",
  "ageFrom": 3,
  "ageTo": 16,
  "richDescription": "<p>HTML описание</p>"
}
```

## Переменные в таблицах

### AfishaEvent (мероприятия)
- `id` - Уникальный ID
- `title` - Название мероприятия
- `description` - Описание
- `coverImage` - Путь к изображению
- `venue` - Место проведения
- `organizer` - Организатор
- `startDate` - Дата начала
- `endDate` - Дата окончания
- `minPrice` - Минимальная цена
- `isPaid` - Платное ли мероприятие
- `city` - Город
- `categoryName` - Название категории
- `coordinates` - Координаты
- `ageFrom` - Возраст от
- `ageTo` - Возраст до
- `ageGroups` - Возрастные группы (JSON)
- `isPopular` - Популярное ли
- `isPromoted` - Продвигаемое ли
- `priority` - Приоритет
- `richDescription` - Богатое описание (HTML)
- `viewCount` - Количество просмотров
- `searchText` - Текст для поиска
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

### VenuePartner (места)
- `id` - Уникальный ID
- `name` - Название места
- `description` - Описание
- `coverImage` - Путь к изображению
- `address` - Адрес
- `district` - Район
- `metro` - Метро
- `priceFrom` - Цена от
- `priceTo` - Цена до
- `city` - Город
- `subcategory` - Подкатегория
- `lat` - Широта
- `lng` - Долгота
- `ageFrom` - Возраст от
- `ageTo` - Возраст до
- `richDescription` - Богатое описание (HTML)
- `createdAt` - Дата создания
- `updatedAt` - Дата обновления

## Примеры использования

### 1. Экспорт текущих данных
```bash
npx tsx src/scripts/export-data.ts
```

### 2. Загрузка новых данных с очисткой старых
```bash
npx tsx src/scripts/data-loader.ts ./new-events.json ./new-venues.json --clear
```

### 3. Загрузка только мероприятий
```bash
npx tsx src/scripts/data-loader.ts ./events.json
```

### 4. Загрузка только мест
```bash
npx tsx src/scripts/data-loader.ts ./venues.json
```

## Примечания

- Все даты должны быть в формате ISO 8601
- Координаты должны быть в формате "широта,долгота"
- Возрастные группы должны быть массивом строк
- Богатое описание может содержать HTML
- При загрузке существующие данные можно очистить флагом `--clear`
