// create-categories.js - Создание категорий для мероприятий
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createCategories() {
  try {
    console.log('=== СОЗДАНИЕ КАТЕГОРИЙ ===')
    
    // Создаем категорию "Театры"
    const theaterCategory = await prisma.category.upsert({
      where: { slug: 'teatry' },
      update: {},
      create: {
        slug: 'teatry',
        name: 'Театры',
        icon: '🎭',
        color: '#8B5CF6',
        isActive: true
      }
    })
    
    console.log('✅ Создана категория "Театры":', theaterCategory)
    
    // Создаем еще несколько категорий для полноты
    const categories = [
      { slug: 'muzyka', name: 'Музыка', icon: '🎵', color: '#F59E0B' },
      { slug: 'sport', name: 'Спорт', icon: '⚽', color: '#10B981' },
      { slug: 'obrazovanie', name: 'Образование', icon: '📚', color: '#3B82F6' },
      { slug: 'razvlecheniya', name: 'Развлечения', icon: '🎪', color: '#EF4444' },
      { slug: 'vystavki', name: 'Выставки', icon: '🖼️', color: '#8B5CF6' }
    ]
    
    for (const cat of categories) {
      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          ...cat,
          isActive: true
        }
      })
      console.log(`✅ Создана категория "${cat.name}":`, category.id)
    }
    
    // Обновляем мероприятия, чтобы связать их с категориями
    const theaterEvents = await prisma.afishaEvent.findMany({
      where: {
        status: 'active',
        category: 'Театры'
      }
    })
    
    console.log(`\n=== ОБНОВЛЕНИЕ МЕРОПРИЯТИЙ ===`)
    console.log(`Найдено мероприятий с категорией "Театры": ${theaterEvents.length}`)
    
    for (const event of theaterEvents) {
      await prisma.afishaEvent.update({
        where: { id: event.id },
        data: { categoryId: theaterCategory.id }
      })
      console.log(`✅ Обновлено мероприятие: ${event.title}`)
    }
    
    // Проверяем результат
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true }
    })
    
    console.log(`\n=== ИТОГОВЫЕ КАТЕГОРИИ ===`)
    console.log(`Всего категорий: ${allCategories.length}`)
    allCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`)
    })
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCategories()
