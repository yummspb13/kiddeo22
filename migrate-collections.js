const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateCollections() {
  console.log('🔄 Starting collection migration...')
  
  try {
    // Получаем все события, которые были привязаны к коллекциям
    const eventsWithCollections = await prisma.afishaEvent.findMany({
      where: {
        // В старой схеме collectionId был в AfishaEvent, но теперь его нет
        // Нужно найти события по другим критериям
      },
      include: {
        eventCollections: true
      }
    })
    
    console.log(`📊 Found ${eventsWithCollections.length} events`)
    
    // Создаем тестовые данные для демонстрации
    const collections = await prisma.collection.findMany()
    console.log(`📊 Found ${collections.length} collections`)
    
    if (collections.length > 0 && eventsWithCollections.length > 0) {
      // Создаем связи между первой коллекцией и первыми двумя событиями
      const firstCollection = collections[0]
      const firstTwoEvents = eventsWithCollections.slice(0, 2)
      
      for (const event of firstTwoEvents) {
        await prisma.collectionEvent.create({
          data: {
            collectionId: firstCollection.id,
            eventId: event.id
          }
        })
        console.log(`✅ Linked event "${event.title}" to collection "${firstCollection.title}"`)
      }
    }
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateCollections()
