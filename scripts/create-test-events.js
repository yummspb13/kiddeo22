const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const testEvents = [
  {
    title: "Мастер-класс по рисованию",
    slug: "master-klass-po-risovaniyu",
    description: "Учимся рисовать акварелью и гуашью",
    venue: "Арт-студия 'Кисточка'",
    organizer: "Детская художественная школа",
    startDate: new Date('2024-12-15T15:00:00Z'),
    endDate: new Date('2024-12-15T17:00:00Z'),
    city: "Москва",
    citySlug: "moskva",
    category: "Мастер-классы",
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    minPrice: 150000, // 1500 рублей в копейках
    ageFrom: 5,
    ageTo: 12,
    isPopular: true,
    isPromoted: false,
    viewCount: 45
  },
  {
    title: "Спектакль 'Золушка'",
    slug: "spektakl-zolushka",
    description: "Классическая сказка в современной постановке",
    venue: "Театр кукол им. Образцова",
    organizer: "Московский театр кукол",
    startDate: new Date('2024-12-20T18:00:00Z'),
    endDate: new Date('2024-12-20T19:30:00Z'),
    city: "Москва",
    citySlug: "moskva",
    category: "Театр",
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    minPrice: 800000, // 8000 рублей в копейках
    ageFrom: 3,
    ageTo: 10,
    isPopular: true,
    isPromoted: true,
    viewCount: 120
  },
  {
    title: "Научное шоу 'Магия физики'",
    slug: "nauchnoe-shou-magiya-fiziki",
    description: "Интерактивные эксперименты и опыты",
    venue: "Музей занимательных наук 'Экспериментаниум'",
    organizer: "Научно-просветительский центр",
    startDate: new Date('2024-12-22T14:00:00Z'),
    endDate: new Date('2024-12-22T15:30:00Z'),
    city: "Москва",
    citySlug: "moskva",
    category: "Наука",
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    minPrice: 600000, // 6000 рублей в копейках
    ageFrom: 6,
    ageTo: 14,
    isPopular: false,
    isPromoted: false,
    viewCount: 23
  },
  {
    title: "Концерт детской музыки",
    slug: "koncert-detskoy-muzyki",
    description: "Живая музыка для детей и родителей",
    venue: "Концертный зал 'Зарядье'",
    organizer: "Московская филармония",
    startDate: new Date('2024-12-25T16:00:00Z'),
    endDate: new Date('2024-12-25T17:30:00Z'),
    city: "Москва",
    citySlug: "moskva",
    category: "Музыка",
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    minPrice: 500000, // 5000 рублей в копейках
    ageFrom: 4,
    ageTo: 12,
    isPopular: true,
    isPromoted: false,
    viewCount: 67
  },
  {
    title: "Спортивная секция 'Юный футболист'",
    slug: "sportivnaya-sekciya-yunyy-futbolist",
    description: "Тренировки по футболу для детей",
    venue: "Спорткомплекс 'Олимпийский'",
    organizer: "Детско-юношеская спортивная школа",
    startDate: new Date('2024-12-18T17:00:00Z'),
    endDate: new Date('2024-12-18T18:30:00Z'),
    city: "Москва",
    citySlug: "moskva",
    category: "Спорт",
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    minPrice: 200000, // 2000 рублей в копейках
    ageFrom: 6,
    ageTo: 16,
    isPopular: false,
    isPromoted: false,
    viewCount: 34
  },
  {
    title: "Экскурсия в зоопарк",
    slug: "ekskursiya-v-zoopark",
    description: "Знакомство с животными и их повадками",
    venue: "Московский зоопарк",
    organizer: "Московский зоопарк",
    startDate: new Date('2024-12-28T11:00:00Z'),
    endDate: new Date('2024-12-28T13:00:00Z'),
    city: "Москва",
    citySlug: "moskva",
    category: "Экскурсии",
    status: "active",
    coverImage: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    minPrice: 300000, // 3000 рублей в копейках
    ageFrom: 3,
    ageTo: 12,
    isPopular: true,
    isPromoted: true,
    viewCount: 89
  }
]

async function createTestEvents() {
  try {
    console.log('Создание тестовых событий...')
    
    for (const eventData of testEvents) {
      const event = await prisma.afishaEvent.create({
        data: eventData
      })
      console.log(`Создано событие: ${event.title}`)
    }
    
    console.log('Все тестовые события созданы успешно!')
  } catch (error) {
    console.error('Ошибка при создании событий:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestEvents()
