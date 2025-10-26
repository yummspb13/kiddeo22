// create-test-ads.js - Создание тестовых рекламных объявлений
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestAds() {
  try {
    console.log('=== СОЗДАНИЕ ТЕСТОВЫХ РЕКЛАМНЫХ ОБЪЯВЛЕНИЙ ===')
    
    // Создаем город Москва если его нет
    const moscow = await prisma.city.upsert({
      where: { slug: 'moskva' },
      update: {},
      create: {
        slug: 'moskva',
        name: 'Москва',
        isPublic: true
      }
    })
    
    console.log('✅ Город Москва:', moscow.id)
    
    // Создаем рекламные объявления для каждого типа
    const adPlacements = [
      // HERO_BELOW - Херо категории
      {
        page: 'afisha',
        position: 'HERO_BELOW',
        title: 'Реклама в блоке категорий',
        imageUrl: '/ads/hero-1.jpg',
        hrefUrl: '/city/moskva/cat/events?categories=Театры',
        isActive: true,
        cityId: moscow.id,
        order: 1,
        weight: 10
      },
      
      // HEADER_BANNER - Полоска над "Все события"
      {
        page: 'afisha',
        position: 'HEADER_BANNER',
        title: 'Реклама над событиями',
        imageUrl: '/ads/hero-1.svg',
        hrefUrl: '/city/moskva/cat/events',
        isActive: true,
        cityId: moscow.id,
        order: 1,
        weight: 10
      },
      
      // SIDEBAR - Слева под фильтрами
      {
        page: 'afisha',
        position: 'SIDEBAR',
        title: 'Реклама в боковой панели',
        imageUrl: '/ads/sidebar-1.jpg',
        hrefUrl: '/city/moskva/cat/events',
        isActive: true,
        cityId: moscow.id,
        order: 1,
        weight: 10
      },
      
      // INLINE - Внутри мероприятий
      {
        page: 'afisha',
        position: 'INLINE',
        title: 'Реклама внутри контента',
        imageUrl: '/ads/inline-1.jpg',
        hrefUrl: '/city/moskva/cat/events',
        isActive: true,
        cityId: moscow.id,
        order: 1,
        weight: 10
      }
    ]
    
    for (const adData of adPlacements) {
      const ad = await prisma.adPlacement.create({
        data: adData
      })
      console.log(`✅ Создано рекламное объявление "${adData.title}" (${adData.position}):`, ad.id)
    }
    
    // Создаем несколько дополнительных объявлений для тестирования
    const additionalAds = [
      {
        page: 'afisha',
        position: 'HEADER_BANNER',
        title: 'Второе объявление над событиями',
        imageUrl: '/ads/hero-1.svg',
        hrefUrl: '/city/moskva/cat/events',
        isActive: false, // Неактивное для тестирования
        cityId: moscow.id,
        order: 2,
        weight: 5
      },
      {
        page: 'afisha',
        position: 'SIDEBAR',
        title: 'Второе объявление в боковой панели',
        imageUrl: '/ads/sidebar-1.jpg',
        hrefUrl: '/city/moskva/cat/events',
        isActive: true,
        cityId: moscow.id,
        order: 2,
        weight: 5
      }
    ]
    
    for (const adData of additionalAds) {
      const ad = await prisma.adPlacement.create({
        data: adData
      })
      console.log(`✅ Создано дополнительное объявление "${adData.title}":`, ad.id)
    }
    
    // Проверяем результат
    const allAds = await prisma.adPlacement.findMany({
      where: { page: 'afisha' },
      include: { City: true },
      orderBy: [{ position: 'asc' }, { order: 'asc' }]
    })
    
    console.log(`\n=== ИТОГОВЫЕ РЕКЛАМНЫЕ ОБЪЯВЛЕНИЯ ===`)
    console.log(`Всего объявлений: ${allAds.length}`)
    
    const groupedAds = allAds.reduce((acc, ad) => {
      if (!acc[ad.position]) acc[ad.position] = []
      acc[ad.position].push(ad)
      return acc
    }, {})
    
    Object.entries(groupedAds).forEach(([position, ads]) => {
      console.log(`\n${position}:`)
      ads.forEach(ad => {
        console.log(`  - ${ad.title} (${ad.isActive ? 'активно' : 'неактивно'}) - ${ad.City?.name || 'Все города'}`)
      })
    })
    
  } catch (error) {
    console.error('Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAds()
