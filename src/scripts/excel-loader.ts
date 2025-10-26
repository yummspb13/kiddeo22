import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Интерфейсы для данных из Excel
interface EventData {
  title: string;
  description?: string;
  image: string;
  gallery?: string;
  tickets?: string;
  startDate: string;
  endDate?: string;
  location: string;
  organizer: string;
  minPrice?: number;
  maxPrice?: number;
  isPaid: boolean;
  city: string;
  citySlug?: string;
  category: string;
  categoryId?: number;
  coordinates?: string;
  ageFrom?: number;
  ageTo?: number;
  ageGroups?: string;
  isPopular?: boolean;
  isPromoted?: boolean;
  priority?: number;
  status?: string;
  order?: number;
  quickFilterIds?: string;
  richDescription?: string;
  // Билеты как отдельные колонки
  ticketName1?: string;
  ticketPrice1?: number;
  ticketCurrency1?: string;
  ticketName2?: string;
  ticketPrice2?: number;
  ticketCurrency2?: string;
  ticketName3?: string;
  ticketPrice3?: number;
  ticketCurrency3?: string;
}

interface VenueData {
  name: string;
  description?: string;
  image: string;
  additionalImages?: string;
  location: string;
  district?: string;
  metro?: string;
  priceFrom?: number;
  priceTo?: number;
  city: string;
  citySlug?: string;
  subcategory: string;
  subcategoryId?: number;
  coordinates?: string;
  ageFrom?: number;
  ageTo?: number;
  tariff?: string;
  status?: string;
  moderationReason?: string;
  timezone?: string;
  fiasId?: string;
  kladrId?: string;
  workingHours?: string;
  richDescription?: string;
}

// Функция для загрузки мероприятий из Excel
export async function loadEventsFromExcel(filePath: string) {
  try {
    console.log(`📅 Загружаем мероприятия из Excel файла: ${filePath}`);
    
    // Читаем Excel файл
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Берем первый лист
    const worksheet = workbook.Sheets[sheetName];
    const eventsData: EventData[] = XLSX.utils.sheet_to_json(worksheet);
    
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
        
        // Парсим ageGroups если это строка
        let ageGroupsArray = null;
        if (eventData.ageGroups) {
          try {
            ageGroupsArray = JSON.parse(eventData.ageGroups);
          } catch {
            // Если не JSON, то разделяем по запятой
            ageGroupsArray = eventData.ageGroups.split(',').map(g => g.trim());
          }
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
            ageGroups: ageGroupsArray ? JSON.stringify(ageGroupsArray) : null,
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
        const ticketTypes = [
          { name: eventData.ticketName1, price: eventData.ticketPrice1, currency: eventData.ticketCurrency1 },
          { name: eventData.ticketName2, price: eventData.ticketPrice2, currency: eventData.ticketCurrency2 },
          { name: eventData.ticketName3, price: eventData.ticketPrice3, currency: eventData.ticketCurrency3 }
        ].filter(ticket => ticket.name && ticket.price);
        
        for (const ticketType of ticketTypes) {
          await prisma.eventTicketType.create({
            data: {
              eventId: event.id,
              name: ticketType.name!,
              price: ticketType.price!,
              currency: ticketType.currency || 'RUB',
            }
          });
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

// Функция для загрузки мест из Excel
export async function loadVenuesFromExcel(filePath: string) {
  try {
    console.log(`🏢 Загружаем места из Excel файла: ${filePath}`);
    
    // Читаем Excel файл
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const venuesData: VenueData[] = XLSX.utils.sheet_to_json(worksheet);
    
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
            tariff: (venueData.tariff as any) || 'FREE',
            status: (venueData.status as any) || 'ACTIVE',
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

// Функция для экспорта в Excel
export async function exportToExcel(eventsOutputPath?: string, venuesOutputPath?: string) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const defaultEventsPath = path.join(process.cwd(), 'src', 'data', `events-${timestamp}.xlsx`);
  const defaultVenuesPath = path.join(process.cwd(), 'src', 'data', `venues-${timestamp}.xlsx`);
  
  try {
    console.log('📤 Экспортируем данные в Excel...');
    
    // Экспорт мероприятий
    const events = await prisma.afishaEvent.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        gallery: true,
        tickets: true,
        startDate: true,
        endDate: true,
        venue: true,
        organizer: true,
        minPrice: true,
        isPaid: true,
        city: true,
        citySlug: true,
        categoryName: true,
        categoryId: true,
        coordinates: true,
        ageFrom: true,
        ageTo: true,
        ageGroups: true,
        isPopular: true,
        isPromoted: true,
        priority: true,
        status: true,
        order: true,
        quickFilterIds: true,
        richDescription: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Преобразуем данные для Excel
    const eventsForExcel = events.map(event => ({
      title: event.title,
      description: event.description,
      image: event.coverImage,
      gallery: event.gallery,
      tickets: event.tickets,
      startDate: event.startDate ? event.startDate.toISOString() : null,
      endDate: event.endDate ? event.endDate.toISOString() : null,
      location: event.venue,
      organizer: event.organizer,
      minPrice: event.minPrice,
      isPaid: event.isPaid,
      city: event.city,
      citySlug: event.citySlug,
      category: event.categoryName,
      categoryId: event.categoryId,
      coordinates: event.coordinates,
      ageFrom: event.ageFrom,
      ageTo: event.ageTo,
      ageGroups: event.ageGroups,
      isPopular: event.isPopular,
      isPromoted: event.isPromoted,
      priority: event.priority,
      status: event.status,
      order: event.order,
      quickFilterIds: event.quickFilterIds,
      richDescription: event.richDescription,
      createdAt: event.createdAt ? event.createdAt.toISOString() : null,
      updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
    }));
    
    // Создаем Excel файл для мероприятий
    const eventsWorkbook = XLSX.utils.book_new();
    const eventsSheet = XLSX.utils.json_to_sheet(eventsForExcel);
    XLSX.utils.book_append_sheet(eventsWorkbook, eventsSheet, 'Events');
    XLSX.writeFile(eventsWorkbook, eventsOutputPath || defaultEventsPath);
    console.log(`✅ Мероприятия экспортированы в: ${eventsOutputPath || defaultEventsPath}`);
    
    // Экспорт мест
    const venues = await prisma.venuePartner.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        additionalImages: true,
        address: true,
        district: true,
        metro: true,
        priceFrom: true,
        priceTo: true,
        tariff: true,
        status: true,
        moderationReason: true,
        timezone: true,
        fiasId: true,
        kladrId: true,
        workingHours: true,
        lat: true,
        lng: true,
        ageFrom: true,
        ageTo: true,
        richDescription: true,
        createdAt: true,
        updatedAt: true,
        city: {
          select: {
            name: true,
            slug: true,
          }
        },
        subcategory: {
          select: {
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Преобразуем данные для Excel
    const venuesForExcel = venues.map(venue => ({
      name: venue.name,
      description: venue.description,
      image: venue.coverImage,
      additionalImages: venue.additionalImages,
      location: venue.address,
      district: venue.district,
      metro: venue.metro,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      city: venue.city.name,
      citySlug: venue.city.slug,
      subcategory: venue.subcategory.name,
      coordinates: venue.lat && venue.lng ? `${venue.lat},${venue.lng}` : null,
      ageFrom: venue.ageFrom,
      ageTo: venue.ageTo,
      tariff: venue.tariff,
      status: venue.status,
      moderationReason: venue.moderationReason,
      timezone: venue.timezone,
      fiasId: venue.fiasId,
      kladrId: venue.kladrId,
      workingHours: venue.workingHours,
      richDescription: venue.richDescription,
      createdAt: venue.createdAt ? venue.createdAt.toISOString() : null,
      updatedAt: venue.updatedAt ? venue.updatedAt.toISOString() : null,
    }));
    
    // Создаем Excel файл для мест
    const venuesWorkbook = XLSX.utils.book_new();
    const venuesSheet = XLSX.utils.json_to_sheet(venuesForExcel);
    XLSX.utils.book_append_sheet(venuesWorkbook, venuesSheet, 'Venues');
    XLSX.writeFile(venuesWorkbook, venuesOutputPath || defaultVenuesPath);
    console.log(`✅ Места экспортированы в: ${venuesOutputPath || defaultVenuesPath}`);
    
    console.log('\n🎉 Экспорт в Excel завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка при экспорте в Excel:', error);
  } finally {
    await prisma.$disconnect();
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

// Основная функция загрузки
export async function loadDataFromExcel(eventsFile?: string, venuesFile?: string, clearFirst = false) {
  try {
    if (clearFirst) {
      await clearEventsAndVenues();
    }
    
    if (eventsFile) {
      await loadEventsFromExcel(eventsFile);
    }
    
    if (venuesFile) {
      await loadVenuesFromExcel(venuesFile);
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
  const args = process.argv.slice(2);
  const clearFirst = args.includes('--clear');
  const isExport = args.includes('--export');
  
  if (isExport) {
    const eventsFile = args.find(arg => arg.endsWith('.xlsx') && !arg.includes('venues'));
    const venuesFile = args.find(arg => arg.endsWith('.xlsx') && arg.includes('venues'));
    exportToExcel(eventsFile, venuesFile);
  } else {
    const eventsFile = args.find(arg => arg.endsWith('.xlsx') && !arg.includes('venues'));
    const venuesFile = args.find(arg => arg.endsWith('.xlsx') && arg.includes('venues'));
    loadDataFromExcel(eventsFile, venuesFile, clearFirst);
  }
}
