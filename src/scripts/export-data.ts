import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Функция для выгрузки мероприятий
export async function exportEventsToFile(outputPath: string) {
  try {
    console.log('📅 Выгружаем мероприятия...');
    
    const events = await prisma.afishaEvent.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        startDate: true,
        endDate: true,
        venue: true,
        organizer: true,
        minPrice: true,
        isPaid: true,
        city: true,
        categoryName: true,
        coordinates: true,
        ageFrom: true,
        ageTo: true,
        ageGroups: true,
        isPopular: true,
        isPromoted: true,
        priority: true,
        richDescription: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Найдено ${events.length} мероприятий`);
    
    // Преобразуем данные для экспорта
    const exportData = events.map(event => ({
      title: event.title,
      description: event.description,
      image: event.coverImage,
      startDate: event.startDate ? event.startDate.toISOString() : null,
      endDate: event.endDate ? event.endDate.toISOString() : null,
      location: event.venue,
      organizer: event.organizer,
      minPrice: event.minPrice,
      isPaid: event.isPaid,
      city: event.city,
      category: event.categoryName,
      coordinates: event.coordinates,
      ageFrom: event.ageFrom,
      ageTo: event.ageTo,
      ageGroups: event.ageGroups ? JSON.parse(event.ageGroups) : null,
      isPopular: event.isPopular,
      isPromoted: event.isPromoted,
      priority: event.priority,
      richDescription: event.richDescription,
      viewCount: event.viewCount,
      createdAt: event.createdAt ? event.createdAt.toISOString() : null,
      updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
    }));
    
    // Создаем директорию если не существует
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Записываем в файл
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    
    console.log(`✅ Мероприятия экспортированы в: ${outputPath}`);
    console.log(`📄 Размер файла: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    return exportData;
    
  } catch (error) {
    console.error('❌ Ошибка при экспорте мероприятий:', error);
    throw error;
  }
}

// Функция для выгрузки мест
export async function exportVenuesToFile(outputPath: string) {
  try {
    console.log('🏢 Выгружаем места...');
    
    const venues = await prisma.venuePartner.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        address: true,
        district: true,
        metro: true,
        priceFrom: true,
        priceTo: true,
        city: true,
        subcategory: true,
        lat: true,
        lng: true,
        ageFrom: true,
        ageTo: true,
        richDescription: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Найдено ${venues.length} мест`);
    
    // Преобразуем данные для экспорта
    const exportData = venues.map(venue => ({
      name: venue.name,
      description: venue.description,
      image: venue.coverImage,
      location: venue.address,
      district: venue.district,
      metro: venue.metro,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      city: venue.city,
      subcategory: venue.subcategory,
      coordinates: venue.lat && venue.lng ? `${venue.lat},${venue.lng}` : null,
      ageFrom: venue.ageFrom,
      ageTo: venue.ageTo,
      richDescription: venue.richDescription,
      createdAt: venue.createdAt ? venue.createdAt.toISOString() : null,
      updatedAt: venue.updatedAt ? venue.updatedAt.toISOString() : null,
    }));
    
    // Создаем директорию если не существует
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Записываем в файл
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
    
    console.log(`✅ Места экспортированы в: ${outputPath}`);
    console.log(`📄 Размер файла: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    return exportData;
    
  } catch (error) {
    console.error('❌ Ошибка при экспорте мест:', error);
    throw error;
  }
}

// Функция для экспорта всех данных
export async function exportAllData(eventsPath?: string, venuesPath?: string) {
  try {
    console.log('📤 Начинаем экспорт данных...\n');
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (eventsPath) {
      await exportEventsToFile(eventsPath);
      console.log('');
    }
    
    if (venuesPath) {
      await exportVenuesToFile(venuesPath);
      console.log('');
    }
    
    console.log('🎉 Экспорт данных завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка при экспорте данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск экспорта (если файл запускается напрямую)
if (require.main === module) {
  const eventsPath = process.argv[2] || `./src/data/exported-events-${new Date().toISOString().split('T')[0]}.json`;
  const venuesPath = process.argv[3] || `./src/data/exported-venues-${new Date().toISOString().split('T')[0]}.json`;
  
  exportAllData(eventsPath, venuesPath);
}
