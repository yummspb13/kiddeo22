const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateCollectionsData() {
  console.log('🔄 Starting collections data update...')
  
  try {
    // Удаляем все существующие связи
    await prisma.collectionEvent.deleteMany()
    console.log('✅ Cleared existing collection-event relationships')
    
    // Получаем все коллекции и события
    const collections = await prisma.collection.findMany()
    const events = await prisma.afishaEvent.findMany()
    
    console.log(`📊 Found ${collections.length} collections and ${events.length} events`)
    
    // Создаем реалистичные связи
    const relationships = [
      // Елки в Москве - новогодние события
      { collectionSlug: 'elki-v-moskve-2025', eventTitles: ['Богатыри', 'Изумрудный город'] },
      
      // Лучшие спектакли октября - театральные события
      { collectionSlug: 'luchshie-spektakli-oktyabrya', eventTitles: ['Щелкунчик на льду'] },
      
      // Фабрика мультфильмов - мастер-классы
      { collectionSlug: 'fabrika-multfilmov-master-klassy', eventTitles: ['Мастер-класс по анимации'] }
    ]
    
    for (const rel of relationships) {
      const collection = collections.find(c => c.slug === rel.collectionSlug)
      if (!collection) {
        console.log(`⚠️ Collection not found: ${rel.collectionSlug}`)
        continue
      }
      
      for (const eventTitle of rel.eventTitles) {
        const event = events.find(e => e.title === eventTitle)
        if (!event) {
          console.log(`⚠️ Event not found: ${eventTitle}`)
          continue
        }
        
        await prisma.collectionEvent.create({
          data: {
            collectionId: collection.id,
            eventId: event.id
          }
        })
        console.log(`✅ Linked "${eventTitle}" to "${collection.title}"`)
      }
    }
    
    // Добавляем некоторые события в несколько коллекций для демонстрации
    const multiCollectionEvent = events.find(e => e.title === 'Изумрудный город')
    const multiCollection = collections.find(c => c.slug === 'luchshie-spektakli-oktyabrya')
    
    if (multiCollectionEvent && multiCollection) {
      await prisma.collectionEvent.create({
        data: {
          collectionId: multiCollection.id,
          eventId: multiCollectionEvent.id
        }
      })
      console.log(`✅ Added "${multiCollectionEvent.title}" to multiple collections`)
    }
    
    console.log('🎉 Collections data update completed successfully!')
    
  } catch (error) {
    console.error('❌ Update failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCollectionsData()
