// Скрипт для добавления тестовых данных в избранное
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestFavorites() {
  try {
    console.log('🔍 Adding test favorites...')
    
    // Найдем пользователя
    const user = await prisma.user.findFirst({
      where: { email: 'admin@kiddeo.ru' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:', user.email)
    
    // Добавим тестовые избранные события
    const testFavorites = [
      {
        userId: user.id,
        itemId: 'sense-pochuvstvuy-stihii',
        itemType: 'event',
        title: 'Sense. Почувствуй стихии',
        description: 'Впечатляющая выставка, синтезирующая знания учёных, философов, алхимиков разных времён и культур о природных феноменах',
        image: '/uploads/background/background_1760463522460.jpg',
        location: 'Центр «Марс» Пушкарев пер., 5',
        date: '2025-10-11T08:00:00.000Z',
        createdAt: new Date().toISOString()
      },
      {
        userId: user.id,
        itemId: 'arte-musicum-garri-potter-kosmicheskoe-fentezi',
        itemType: 'event',
        title: 'Arte Musicum. Гарри Поттер. Космическое фэнтези',
        description: 'Музыкальное представление по мотивам Гарри Поттера',
        image: '/uploads/background/background_1760462254651.png',
        location: 'Планетарий Садовая-Кудринская, 5, стр. 1',
        date: '2025-10-25T09:30:00.000Z',
        createdAt: new Date().toISOString()
      }
    ]
    
    // Очистим существующие избранные
    await prisma.favorite.deleteMany({
      where: { userId: user.id }
    })
    
    // Добавим новые
    for (const favorite of testFavorites) {
      await prisma.favorite.create({
        data: favorite
      })
    }
    
    console.log('✅ Test favorites added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding test favorites:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestFavorites()
