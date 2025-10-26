import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding collections...')

  // Получаем существующие категории и подкатегории
  const categories = await prisma.venueCategory.findMany({
    include: {
      subcategories: true
    }
  })

  if (categories.length === 0) {
    console.log('❌ No categories found. Please run seed-categories.ts first.')
    return
  }

  const collections = [
    {
      title: 'Лучшие развлечения для детей в Москве',
      slug: 'best-entertainment-moscow',
      description: 'Топ-10 самых интересных мест для развлечения детей в столице',
      coverImage: '/images/collections/entertainment-moscow.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: true,
      showInBlog: false,
      order: 1,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Популярные события',
      eventsDescription: 'Самые интересные события для детей',
      venuesTitle: 'Рекомендуемые места',
      venuesDescription: 'Лучшие места для развлечений'
    },
    {
      title: 'Образовательные программы',
      slug: 'educational-programs',
      description: 'Развивающие курсы и программы для детей разных возрастов',
      coverImage: '/images/collections/education.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: true,
      showInBlog: true,
      order: 2,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Образовательные события',
      eventsDescription: 'Семинары, мастер-классы и лекции',
      venuesTitle: 'Центры развития',
      venuesDescription: 'Места для обучения и развития'
    },
    {
      title: 'Спортивные секции',
      slug: 'sports-sections',
      description: 'Спортивные занятия для детей всех возрастов',
      coverImage: '/images/collections/sports.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: false,
      showInBlog: false,
      order: 3,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Спортивные события',
      eventsDescription: 'Турниры, соревнования и тренировки',
      venuesTitle: 'Спортивные центры',
      venuesDescription: 'Секции и клубы для занятий спортом'
    },
    {
      title: 'Творческие мастерские',
      slug: 'creative-workshops',
      description: 'Места для развития творческих способностей',
      coverImage: '/images/collections/creativity.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: true,
      showInBlog: true,
      order: 4,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Творческие события',
      eventsDescription: 'Мастер-классы и выставки',
      venuesTitle: 'Студии и мастерские',
      venuesDescription: 'Места для творческого развития'
    },
    {
      title: 'Детская медицина',
      slug: 'children-medicine',
      description: 'Медицинские услуги и консультации для детей',
      coverImage: '/images/collections/medicine.jpg',
      isActive: true,
      hideFromAfisha: true,
      showInVenues: true,
      showInMain: false,
      showInBlog: true,
      order: 5,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Медицинские события',
      eventsDescription: 'Лекции и семинары о здоровье',
      venuesTitle: 'Медицинские центры',
      venuesDescription: 'Клиники и кабинеты для детей'
    },
    {
      title: 'Санкт-Петербург для детей',
      slug: 'spb-children',
      description: 'Лучшие места для детей в Санкт-Петербурге',
      coverImage: '/images/collections/spb.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: true,
      showInBlog: false,
      order: 6,
      city: 'saint-petersburg',
      citySlug: 'saint-petersburg',
      eventsTitle: 'События в СПб',
      eventsDescription: 'Интересные события для детей в Петербурге',
      venuesTitle: 'Места в СПб',
      venuesDescription: 'Рекомендуемые места для детей'
    },
    {
      title: 'Бесплатные мероприятия',
      slug: 'free-events',
      description: 'Бесплатные события и активности для детей',
      coverImage: '/images/collections/free.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: false,
      showInMain: true,
      showInBlog: true,
      order: 7,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Бесплатные события',
      eventsDescription: 'События без вступительной платы',
      venuesTitle: 'Бесплатные места',
      venuesDescription: 'Места с бесплатным входом'
    },
    {
      title: 'Выходные с детьми',
      slug: 'weekend-with-kids',
      description: 'Идеи для активного отдыха с детьми в выходные',
      coverImage: '/images/collections/weekend.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: true,
      showInBlog: true,
      order: 8,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Выходные события',
      eventsDescription: 'События на выходные дни',
      venuesTitle: 'Выходные места',
      venuesDescription: 'Места для семейного отдыха'
    },
    {
      title: 'Летние активности',
      slug: 'summer-activities',
      description: 'Летние программы и активности для детей',
      coverImage: '/images/collections/summer.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: false,
      showInBlog: true,
      order: 9,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'Летние события',
      eventsDescription: 'События в летний период',
      venuesTitle: 'Летние лагеря',
      venuesDescription: 'Места для летнего отдыха'
    },
    {
      title: 'Развитие малышей',
      slug: 'toddler-development',
      description: 'Программы для детей от 1 до 3 лет',
      coverImage: '/images/collections/toddlers.jpg',
      isActive: true,
      hideFromAfisha: false,
      showInVenues: true,
      showInMain: true,
      showInBlog: false,
      order: 10,
      city: 'moscow',
      citySlug: 'moscow',
      eventsTitle: 'События для малышей',
      eventsDescription: 'Развивающие события для маленьких детей',
      venuesTitle: 'Центры для малышей',
      venuesDescription: 'Места для развития самых маленьких'
    }
  ]

  for (const collectionData of collections) {
    const collection = await prisma.collection.upsert({
      where: { slug: collectionData.slug },
      update: collectionData,
      create: collectionData
    })

    console.log(`✅ Created collection: ${collection.title}`)

    // Пока не создаем связанные места, так как нужны Vendor и City
    // Это будет сделано в следующих этапах оптимизации
    console.log(`  📝 Collection created (venues will be linked later)`)
  }

  console.log('🎉 Collections seeded successfully!')
}

function getRandomSubcategories(categories: any[], count: number) {
  const allSubcategories = categories.flatMap(cat => cat.subcategories)
  const shuffled = allSubcategories.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding collections:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
