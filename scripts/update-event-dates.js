const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateEventDates() {
  try {
    console.log('Обновление дат событий...')
    
    // Получаем все события
    const events = await prisma.afishaEvent.findMany({
      where: { status: 'active' }
    })
    
    console.log(`Найдено ${events.length} событий`)
    
    // Обновляем даты на будущие (начиная с завтра)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(15, 0, 0, 0) // 15:00
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      
      // Каждое событие через день
      const startDate = new Date(tomorrow)
      startDate.setDate(tomorrow.getDate() + i)
      startDate.setHours(15 + (i % 3), 0, 0, 0) // Разные часы: 15, 16, 17
      
      const endDate = new Date(startDate)
      endDate.setHours(startDate.getHours() + 2) // Длительность 2 часа
      
      await prisma.afishaEvent.update({
        where: { id: event.id },
        data: {
          startDate: startDate,
          endDate: endDate
        }
      })
      
      console.log(`Обновлено: ${event.title} - ${startDate.toISOString()}`)
    }
    
    console.log('Все даты обновлены успешно!')
  } catch (error) {
    console.error('Ошибка при обновлении дат:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateEventDates()
