import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Интерфейсы для данных из файла
interface EventData {
  title: string;
  description?: string;
  image: string;
  gallery?: string; // Галерея фотографий
  tickets?: string; // Билеты (JSON строка)
  startDate: string;
  endDate?: string;
  location: string;
  organizer: string;
  minPrice?: number;
  maxPrice?: number;
  isPaid: boolean;
  city: string;
  citySlug?: string; // Слаг города
  category: string;
  categoryId?: number; // ID категории
  coordinates?: string;
  ageFrom?: number;
  ageTo?: number;
  ageGroups?: string[];
  isPopular?: boolean;
  isPromoted?: boolean;
  priority?: number;
  status?: string; // Статус мероприятия
  order?: number; // Порядок сортировки
  quickFilterIds?: string; // ID быстрых фильтров
  richDescription?: string;
  // Билеты как отдельные объекты
  ticketTypes?: {
    name: string;
    price: number;
    currency?: string;
  }[];
}

interface VenueData {
  name: string;
  description?: string;
  image: string;
  additionalImages?: string; // Дополнительные фотографии
  location: string;
  district?: string;
  metro?: string;
  priceFrom?: number;
  priceTo?: number;
  city: string;
  citySlug?: string; // Слаг города
  subcategory: string;
  subcategoryId?: number; // ID подкатегории
  coordinates?: string;
  ageFrom?: number;
  ageTo?: number;
  tariff?: 'FREE' | 'SUPER' | 'MAXIMUM'; // Тариф
  status?: 'ACTIVE' | 'MODERATION' | 'HIDDEN'; // Статус
  moderationReason?: string; // Причина модерации
  timezone?: string; // Часовой пояс
  fiasId?: string; // ФИАС ID
  kladrId?: string; // КЛАДР ID
  workingHours?: string; // Рабочие часы
  richDescription?: string;
}

// Функция для загрузки мероприятий
export async function loadEventsFromFile(filePath: string) {
  try {
    console.log(`📅 Загружаем мероприятия из файла: ${filePath}`);
    
    // Читаем файл
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const eventsData: EventData[] = JSON.parse(fileContent);
    
    console.log(`📊 Найдено ${eventsData.length} мероприятий для загрузки`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const eventData of eventsData) {
      try {
        // Генерируем уникальный slug
        let slug = eventData.title
          .toLowerCase()
          .replace(/[^a-z0-9а-я\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        
        // Проверяем уникальность slug
        let counter = 1;
        let originalSlug = slug;
        while (await prisma.afishaEvent.findUnique({ where: { slug } })) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
        
        // Создаем мероприятие
        const event = await prisma.afishaEvent.create({
          data: {
            title: eventData.title,
            slug: slug,
            description: eventData.description || null,
            coverImage: eventData.image,
            gallery: eventData.gallery || null,
            tickets: eventData.tickets || null,
            venue: eventData.location,
            organizer: eventData.organizer,
            startDate: eventData.startDate ? new Date(eventData.startDate) : null,
            endDate: eventData.endDate ? new Date(eventData.endDate) : null,
            minPrice: eventData.minPrice || null,
            isPaid: eventData.isPaid,
            city: eventData.city,
            citySlug: eventData.citySlug || null,
            categoryName: eventData.category,
            categoryId: eventData.categoryId || null,
            coordinates: eventData.coordinates || null,
            ageFrom: eventData.ageFrom || null,
            ageTo: eventData.ageTo || null,
            ageGroups: eventData.ageGroups ? JSON.stringify(eventData.ageGroups) : null,
            isPopular: eventData.isPopular || false,
            isPromoted: eventData.isPromoted || false,
            priority: eventData.priority || 5,
            status: eventData.status || 'active',
            order: eventData.order || 0,
            quickFilterIds: eventData.quickFilterIds || null,
            richDescription: eventData.richDescription || null,
            viewCount: 0,
            searchText: `${eventData.title} ${eventData.description || ''} ${eventData.location}`.toLowerCase(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        // Создаем типы билетов, если они есть
        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
          for (const ticketType of eventData.ticketTypes) {
            await prisma.eventTicketType.create({
              data: {
                eventId: event.id,
                name: ticketType.name,
                price: ticketType.price,
                currency: ticketType.currency || 'RUB',
              }
            });
          }
        }
        
        console.log(`✅ Мероприятие создано: ${event.title}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Ошибка при создании мероприятия "${eventData.title}":`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Результат загрузки мероприятий:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке мероприятий:', error);
  }
}

// Функция для загрузки мест
export async function loadVenuesFromFile(filePath: string) {
  try {
    console.log(`🏢 Загружаем места из файла: ${filePath}`);
    
    // Читаем файл
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const venuesData: VenueData[] = JSON.parse(fileContent);
    
    console.log(`📊 Найдено ${venuesData.length} мест для загрузки`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const venueData of venuesData) {
      try {
        // Парсим координаты
        let lat = null;
        let lng = null;
        if (venueData.coordinates) {
          const coords = venueData.coordinates.split(',');
          if (coords.length === 2) {
            lat = parseFloat(coords[0].trim());
            lng = parseFloat(coords[1].trim());
          }
        }
        
        // Генерируем slug из названия
        const slug = venueData.name
          .toLowerCase()
          .replace(/[^a-z0-9а-я\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
        
        // Находим или создаем vendor (используем существующего)
        const existingVendor = await prisma.vendor.findFirst();
        if (!existingVendor) {
          console.error('❌ Не найден ни один vendor в базе данных. Создайте vendor перед загрузкой мест.');
          continue;
        }
        
        // Находим subcategoryId (используем существующую)
        const existingSubcategory = await prisma.venueSubcategory.findFirst();
        if (!existingSubcategory) {
          console.error('❌ Не найдена ни одна subcategory в базе данных. Создайте subcategory перед загрузкой мест.');
          continue;
        }
        
        // Находим city (используем существующий)
        const existingCity = await prisma.city.findFirst();
        if (!existingCity) {
          console.error('❌ Не найден ни один city в базе данных. Создайте city перед загрузкой мест.');
          continue;
        }
        
        // Создаем место
        const venue = await prisma.venuePartner.create({
          data: {
            name: venueData.name,
            slug: slug,
            description: venueData.description || null,
            coverImage: venueData.image,
            additionalImages: venueData.additionalImages || null,
            address: venueData.location,
            district: venueData.district || null,
            metro: venueData.metro || null,
            priceFrom: venueData.priceFrom || null,
            priceTo: venueData.priceTo || null,
            tariff: venueData.tariff || 'FREE',
            status: venueData.status || 'ACTIVE',
            moderationReason: venueData.moderationReason || null,
            timezone: venueData.timezone || null,
            fiasId: venueData.fiasId || null,
            kladrId: venueData.kladrId || null,
            workingHours: venueData.workingHours || null,
            city: {
              connect: { id: existingCity.id }
            },
            subcategory: {
              connect: { id: existingSubcategory.id }
            },
            vendor: {
              connect: { id: existingVendor.id }
            },
            lat: lat,
            lng: lng,
            ageFrom: venueData.ageFrom || null,
            ageTo: venueData.ageTo || null,
            richDescription: venueData.richDescription || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        console.log(`✅ Место создано: ${venue.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Ошибка при создании места "${venueData.name}":`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Результат загрузки мест:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке мест:', error);
  }
}

// Функция для очистки данных
export async function clearEventsAndVenues() {
  try {
    console.log('🧹 Очищаем существующие данные...');
    
    // Удаляем мероприятия
    const deletedEvents = await prisma.afishaEvent.deleteMany();
    console.log(`🗑️ Удалено мероприятий: ${deletedEvents.count}`);
    
    // Удаляем места
    const deletedVenues = await prisma.venuePartner.deleteMany();
    console.log(`🗑️ Удалено мест: ${deletedVenues.count}`);
    
  } catch (error) {
    console.error('❌ Ошибка при очистке данных:', error);
  }
}

// Функция для определения типа файла
function detectFileType(filePath: string): 'events' | 'venues' {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    
    // Проверяем поля, характерные для мероприятий
    if (firstItem.title && (firstItem.startDate || firstItem.organizer)) {
      return 'events';
    }
    
    // Проверяем поля, характерные для мест
    if (firstItem.name && (firstItem.location || firstItem.address)) {
      return 'venues';
    }
  }
  
  // По умолчанию считаем файлом мест
  return 'venues';
}

// Основная функция загрузки
export async function loadDataFromFiles(eventsFile?: string, venuesFile?: string, clearFirst = false) {
  try {
    if (clearFirst) {
      await clearEventsAndVenues();
    }
    
    // Если передан только один файл, определяем его тип автоматически
    if (eventsFile && !venuesFile) {
      const fileType = detectFileType(eventsFile);
      console.log(`🔍 Определен тип файла: ${fileType}`);
      
      if (fileType === 'events') {
        await loadEventsFromFile(eventsFile);
      } else {
        await loadVenuesFromFile(eventsFile);
      }
    } else {
      if (eventsFile) {
        await loadEventsFromFile(eventsFile);
      }
      
      if (venuesFile) {
        await loadVenuesFromFile(venuesFile);
      }
    }
    
    console.log('\n🎉 Загрузка данных завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск загрузки (если файл запускается напрямую)
if (require.main === module) {
  const eventsFile = process.argv[2];
  const venuesFile = process.argv[3];
  const clearFirst = process.argv[4] === '--clear';
  
  loadDataFromFiles(eventsFile, venuesFile, clearFirst);
}
