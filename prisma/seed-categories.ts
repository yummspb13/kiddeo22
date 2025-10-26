import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding categories and subcategories...')

  // Создаем категории
  const categories = [
    {
      name: 'Развлечения',
      slug: 'entertainment',
      icon: '🎪',
      color: '#FF6B6B',
      isActive: true
    },
    {
      name: 'Образование',
      slug: 'education',
      icon: '📚',
      color: '#4ECDC4',
      isActive: true
    },
    {
      name: 'Спорт',
      slug: 'sports',
      icon: '⚽',
      color: '#45B7D1',
      isActive: true
    },
    {
      name: 'Творчество',
      slug: 'creativity',
      icon: '🎨',
      color: '#96CEB4',
      isActive: true
    },
    {
      name: 'Медицина',
      slug: 'medicine',
      icon: '🏥',
      color: '#FFEAA7',
      isActive: true
    }
  ]

  for (const categoryData of categories) {
    const category = await prisma.venueCategory.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData
    })

    console.log(`✅ Created category: ${category.name}`)

    // Создаем подкатегории для каждой категории
    const subcategories = getSubcategoriesForCategory(categoryData.slug)
    
    for (const subcategoryData of subcategories) {
      const subcategory = await prisma.venueSubcategory.upsert({
        where: { 
          slug: subcategoryData.slug
        },
        update: {
          ...subcategoryData,
          categoryId: category.id
        },
        create: {
          ...subcategoryData,
          categoryId: category.id
        }
      })

      console.log(`  ✅ Created subcategory: ${subcategory.name}`)
    }
  }

  console.log('🎉 Categories and subcategories seeded successfully!')
}

function getSubcategoriesForCategory(categorySlug: string) {
  const subcategoriesMap: Record<string, any[]> = {
    entertainment: [
      { name: 'Аттракционы', slug: 'attractions', backgroundImage: '/images/attractions.jpg', isActive: true },
      { name: 'Игровые комнаты', slug: 'playrooms', backgroundImage: '/images/playrooms.jpg', isActive: true },
      { name: 'Квесты', slug: 'quests', backgroundImage: '/images/quests.jpg', isActive: true },
      { name: 'Кинотеатры', slug: 'cinemas', backgroundImage: '/images/cinemas.jpg', isActive: true },
      { name: 'Парки развлечений', slug: 'amusement-parks', backgroundImage: '/images/amusement-parks.jpg', isActive: true }
    ],
    education: [
      { name: 'Языковые курсы', slug: 'language-courses', backgroundImage: '/images/language-courses.jpg', isActive: true },
      { name: 'Подготовка к школе', slug: 'school-prep', backgroundImage: '/images/school-prep.jpg', isActive: true },
      { name: 'Робототехника', slug: 'robotics', backgroundImage: '/images/robotics.jpg', isActive: true },
      { name: 'Программирование', slug: 'programming', backgroundImage: '/images/programming.jpg', isActive: true },
      { name: 'Математика', slug: 'mathematics', backgroundImage: '/images/mathematics.jpg', isActive: true }
    ],
    sports: [
      { name: 'Футбол', slug: 'football', backgroundImage: '/images/football.jpg', isActive: true },
      { name: 'Плавание', slug: 'swimming', backgroundImage: '/images/swimming.jpg', isActive: true },
      { name: 'Танцы', slug: 'dancing', backgroundImage: '/images/dancing.jpg', isActive: true },
      { name: 'Гимнастика', slug: 'gymnastics', backgroundImage: '/images/gymnastics.jpg', isActive: true },
      { name: 'Боевые искусства', slug: 'martial-arts', backgroundImage: '/images/martial-arts.jpg', isActive: true }
    ],
    creativity: [
      { name: 'Рисование', slug: 'drawing', backgroundImage: '/images/drawing.jpg', isActive: true },
      { name: 'Лепка', slug: 'sculpting', backgroundImage: '/images/sculpting.jpg', isActive: true },
      { name: 'Музыка', slug: 'music', backgroundImage: '/images/music.jpg', isActive: true },
      { name: 'Театр', slug: 'theater', backgroundImage: '/images/theater.jpg', isActive: true },
      { name: 'Рукоделие', slug: 'handicrafts', backgroundImage: '/images/handicrafts.jpg', isActive: true }
    ],
    medicine: [
      { name: 'Педиатрия', slug: 'pediatrics', backgroundImage: '/images/pediatrics.jpg', isActive: true },
      { name: 'Стоматология', slug: 'dentistry', backgroundImage: '/images/dentistry.jpg', isActive: true },
      { name: 'Офтальмология', slug: 'ophthalmology', backgroundImage: '/images/ophthalmology.jpg', isActive: true },
      { name: 'Логопедия', slug: 'speech-therapy', backgroundImage: '/images/speech-therapy.jpg', isActive: true },
      { name: 'Психология', slug: 'psychology', backgroundImage: '/images/psychology.jpg', isActive: true }
    ]
  }

  return subcategoriesMap[categorySlug] || []
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
