// check-db-state.js - Проверка состояния базы данных
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDbState() {
  try {
    console.log('=== ПРОВЕРКА СОСТОЯНИЯ БД ===')
    
    // Проверим категории
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    })
    console.log('Категории:', categories)
    
    // Проверим мероприятия
    const events = await prisma.afishaEvent.findMany({
      where: { status: 'active' },
      select: { id: true, title: true, category: true, categoryId: true }
    })
    console.log('Мероприятия:', events)
    
    // Попробуем обновить одно мероприятие
    console.log('\n=== ТЕСТ ОБНОВЛЕНИЯ ===')
    const firstEvent = events[0]
    if (firstEvent) {
      console.log('Пытаемся обновить:', firstEvent.title)
      try {
        await prisma.afishaEvent.update({
          where: { id: firstEvent.id },
          data: { categoryId: 1 }
        })
        console.log('✅ Обновление успешно')
      } catch (error) {
        console.log('❌ Ошибка обновления:', error.message)
        console.log('Код ошибки:', error.code)
      }
    }
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDbState()
