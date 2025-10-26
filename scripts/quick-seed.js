const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function quickSeed() {
  try {
    console.log('🚀 Быстрая загрузка данных...');
    
    // 1. Загружаем основные данные
    console.log('📊 Загружаем города и категории...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    // 2. Загружаем тестовые события
    console.log('🎭 Загружаем тестовые события...');
    execSync('node scripts/create-test-events.js', { stdio: 'inherit' });
    
    // 3. Проверяем результат
    const cityCount = await prisma.city.count();
    const categoryCount = await prisma.category.count();
    const eventCount = await prisma.afishaEvent.count();
    const venueCount = await prisma.venuePartner.count();
    
    console.log('\n✅ Загрузка завершена!');
    console.log(`🏙️ Городов: ${cityCount}`);
    console.log(`📂 Категорий: ${categoryCount}`);
    console.log(`🎭 Событий: ${eventCount}`);
    console.log(`🏢 Мест: ${venueCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();
