const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Проверяем данные в базе...')
  
  // Проверяем города
  const cities = await prisma.city.findMany()
  console.log('Города:', cities.length, cities.map(c => c.name))
  
  // Проверяем подборки
  const collections = await prisma.collection.findMany()
  console.log('Подборки:', collections.length, collections.map(c => ({ title: c.title, city: c.city, isActive: c.isActive })))
  
  // Проверяем события
  const events = await prisma.afishaEvent.findMany()
  console.log('События:', events.length, events.map(e => ({ title: e.title, collectionId: e.collectionId })))
  
  // Проверяем подборки с событиями
  const collectionsWithEvents = await prisma.collection.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          events: {
            where: { status: 'active' }
          }
        }
      }
    }
  })
  
  console.log('Активные подборки с событиями:', collectionsWithEvents.length)
  collectionsWithEvents.forEach(c => {
    console.log(`- ${c.title}: ${c._count.events} событий`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
