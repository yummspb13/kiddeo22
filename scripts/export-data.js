const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('📤 Экспортируем данные...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = `exports/export-${timestamp}`;
    
    // Создаем директорию
    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports');
    }
    fs.mkdirSync(exportDir);
    
    // Экспортируем города
    const cities = await prisma.city.findMany();
    fs.writeFileSync(
      path.join(exportDir, 'cities.json'), 
      JSON.stringify(cities, null, 2)
    );
    
    // Экспортируем категории
    const categories = await prisma.category.findMany();
    fs.writeFileSync(
      path.join(exportDir, 'categories.json'), 
      JSON.stringify(categories, null, 2)
    );
    
    // Экспортируем события
    const events = await prisma.afishaEvent.findMany();
    fs.writeFileSync(
      path.join(exportDir, 'events.json'), 
      JSON.stringify(events, null, 2)
    );
    
    // Экспортируем места
    const venues = await prisma.venuePartner.findMany();
    fs.writeFileSync(
      path.join(exportDir, 'venues.json'), 
      JSON.stringify(venues, null, 2)
    );
    
    console.log(`✅ Данные экспортированы в ${exportDir}/`);
    console.log(`📁 Файлы: cities.json, categories.json, events.json, venues.json`);
    
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
