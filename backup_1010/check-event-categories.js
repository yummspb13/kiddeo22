// check-event-categories.js - Проверка категорий мероприятий
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkEventCategories() {
  try {
    console.log('=== ПРОВЕРКА КАТЕГОРИЙ МЕРОПРИЯТИЙ ===')
    
    // Проверим мероприятия с их категориями
    const events = await prisma.afishaEvent.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        city: true,
        category: true,
        categoryId: true,
        startDate: true
      }
    })
    
    console.log(`Всего активных мероприятий: ${events.length}`)
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.title}`)
      console.log(`   ID: ${event.id}`)
      console.log(`   Город: ${event.city}`)
      console.log(`   Категория (строка): ${event.category || 'НЕТ'}`)
      console.log(`   Category ID: ${event.categoryId || 'НЕТ'}`)
      console.log(`   Дата: ${new Date(event.startDate).toLocaleString('ru-RU')}`)
    })
    
    // Проверим, есть ли категории в базе
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true
      }
    })
    
    console.log(`\n=== КАТЕГОРИИ В БД ===`)
    console.log(`Всего категорий: ${categories.length}`)
    
    categories.forEach(cat => {
      console.log(`ID: ${cat.id}, Название: ${cat.name}, Слаг: ${cat.slug}, Активна: ${cat.isActive}`)
    })
    
    // Проверим, есть ли связь между мероприятиями и категориями
    const eventsWithCategories = await prisma.afishaEvent.findMany({
      where: {
        status: 'active',
        OR: [
          { category: { not: null } },
          { categoryId: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        category: true,
        categoryId: true
      }
    })
    
    console.log(`\n=== МЕРОПРИЯТИЯ С КАТЕГОРИЯМИ ===`)
    console.log(`Мероприятий с категориями: ${eventsWithCategories.length}`)
    
    if (eventsWithCategories.length === 0) {
      console.log('❌ ПРОБЛЕМА: Ни одно мероприятие не имеет категории!')
      console.log('Это может быть причиной того, что они не отображаются.')
    }
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEventCategories()
