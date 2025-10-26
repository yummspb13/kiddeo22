const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Создание тестовых данных для подборок...')

  // Создаем город Москва
  const moscow = await prisma.city.upsert({
    where: { slug: 'moscow' },
    update: {},
    create: {
      slug: 'moscow',
      name: 'Москва',
      isPublic: true
    }
  })
  console.log('✅ Город Москва создан:', moscow.name)

  // Создаем категории
  const categories = [
    { slug: 'events', name: 'События', icon: '🎭', color: '#3B82F6' },
    { slug: 'venues', name: 'Места', icon: '🏛️', color: '#10B981' },
    { slug: 'kids', name: 'Детские', icon: '👶', color: '#F59E0B' }
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
    console.log(`✅ Категория ${cat.name} создана`)
  }

  // Создаем подборки
  const collections = [
    {
      title: 'Елки в Москве: 20 новогодних представлений для детей',
      slug: 'elki-v-moskve-2025',
      description: 'Волшебные новогодние представления для всей семьи. От классических сказок до современных мюзиклов.',
      coverImage: '/ads/hero-1.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      order: 1
    },
    {
      title: 'Фабрика мультфильмов запускает мастер-классы',
      slug: 'fabrika-multfilmov-master-klassy',
      description: 'Учитесь создавать мультфильмы вместе с профессионалами. Анимация, рисование, озвучка.',
      coverImage: '/ads/sidebar-1.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      order: 2
    },
    {
      title: 'Лучшие спектакли октября',
      slug: 'luchshie-spektakli-oktyabrya',
      description: 'Подборка самых интересных театральных постановок для детей и взрослых.',
      coverImage: '/ads/inline-1.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      order: 3
    }
  ]

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {},
      create: collection
    })
    console.log(`✅ Подборка "${collection.title}" создана`)
  }

  // Создаем события и привязываем их к подборкам
  const events = [
    {
      title: 'Богатыри',
      slug: 'bogatyr',
      description: 'Грандиозное представление для всей семьи',
      venue: 'Театр на Цветном',
      organizer: 'Московский театр',
      startDate: new Date('2025-10-15T19:00:00Z'),
      endDate: new Date('2025-10-15T21:00:00Z'),
      coverImage: '/uploads/upload_1759532381800.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      category: 'Спектакль',
      minPrice: 99000, // 990 рублей в копейках
      collectionSlug: 'elki-v-moskve-2025'
    },
    {
      title: 'Изумрудный город',
      slug: 'izumrudnyy-gorod',
      description: 'Музыкальная сказка по мотивам "Волшебника страны Оз"',
      venue: 'Планета КВН',
      organizer: 'Детский музыкальный театр',
      startDate: new Date('2025-10-20T16:00:00Z'),
      endDate: new Date('2025-10-20T18:00:00Z'),
      coverImage: '/uploads/upload_1759532381800.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      category: 'Спектакль',
      minPrice: 110000, // 1100 рублей в копейках
      collectionSlug: 'luchshie-spektakli-oktyabrya'
    },
    {
      title: 'Мастер-класс по анимации',
      slug: 'master-klass-po-animacii',
      description: 'Создайте свой первый мультфильм за 2 часа',
      venue: 'Фабрика мультфильмов',
      organizer: 'Студия анимации',
      startDate: new Date('2025-10-25T14:00:00Z'),
      endDate: new Date('2025-10-25T16:00:00Z'),
      coverImage: '/uploads/upload_1759532381800.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      category: 'Мастер-класс',
      minPrice: 150000, // 1500 рублей в копейках
      collectionSlug: 'fabrika-multfilmov-master-klassy'
    },
    {
      title: 'Щелкунчик на льду',
      slug: 'shchelkunchik-na-ldu',
      description: 'Симфонический оркестр и фигурное катание',
      venue: 'Ледовый дворец',
      organizer: 'Московская филармония',
      startDate: new Date('2025-11-10T19:30:00Z'),
      endDate: new Date('2025-11-10T21:30:00Z'),
      coverImage: '/uploads/upload_1759532381800.jpg',
      city: 'Москва',
      citySlug: 'moscow',
      category: 'Концерт',
      minPrice: 50000, // 500 рублей в копейках
      collectionSlug: 'elki-v-moskve-2025'
    }
  ]

  for (const eventData of events) {
    // Находим подборку по slug
    const collection = await prisma.collection.findUnique({
      where: { slug: eventData.collectionSlug }
    })

    const { collectionSlug, ...eventCreateData } = eventData

    await prisma.afishaEvent.upsert({
      where: { slug: eventData.slug },
      update: {},
      create: {
        ...eventCreateData,
        collectionId: collection?.id
      }
    })
    console.log(`✅ Событие "${eventData.title}" создано и привязано к подборке "${collection?.title}"`)
  }

  console.log('🎉 Все тестовые данные созданы успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при создании тестовых данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
