import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding blog posts...')

  // Создаем тестового автора
  const author = await prisma.user.upsert({
    where: { email: 'admin@kiddeo.ru' },
    update: {},
    create: {
      email: 'admin@kiddeo.ru',
      name: 'Администратор Kiddeo',
      image: '/images/admin-avatar.jpg',
      role: 'ADMIN'
    }
  })

  // Создаем категории для блога
  const blogCategories = [
    {
      name: 'Развитие детей',
      slug: 'child-development',
      description: 'Статьи о развитии и воспитании детей'
    },
    {
      name: 'Образование',
      slug: 'education',
      description: 'Образовательные материалы и советы'
    },
    {
      name: 'Здоровье',
      slug: 'health',
      description: 'Статьи о здоровье детей'
    },
    {
      name: 'Развлечения',
      slug: 'entertainment',
      description: 'Идеи для развлечений и досуга'
    },
    {
      name: 'Советы родителям',
      slug: 'parenting-tips',
      description: 'Полезные советы для родителей'
    }
  ]

  const createdCategories: any[] = []
  for (const categoryData of blogCategories) {
    const category = await prisma.contentCategory.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        updatedAt: new Date()
      }
    })
    createdCategories.push(category)
    console.log(`✅ Created blog category: ${category.name}`)
  }

  // Создаем города
  const cities = [
    { name: 'Москва', slug: 'moskva' },
    { name: 'Санкт-Петербург', slug: 'sankt-peterburg' }
  ]

  const createdCities: any[] = []
  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { slug: cityData.slug },
      update: cityData,
      create: cityData
    })
    createdCities.push(city)
    console.log(`✅ Created city: ${city.name}`)
  }

  // Создаем статьи блога
  const blogPosts = [
    {
      title: '10 лучших мест для детей в Москве',
      slug: '10-luchshih-mest-dlya-detej-v-moskve',
      excerpt: 'Подборка самых интересных и безопасных мест для семейного отдыха в столице',
      content: `
        <h2>Введение</h2>
        <p>Москва предлагает множество возможностей для семейного отдыха. В этой статье мы собрали 10 лучших мест, где дети смогут весело провести время, а родители - отдохнуть.</p>
        
        <h2>1. Парк Горького</h2>
        <p>Один из самых популярных парков Москвы с множеством развлечений для детей всех возрастов.</p>
        
        <h2>2. Московский зоопарк</h2>
        <p>Старейший зоопарк России, где можно увидеть животных со всего мира.</p>
        
        <h2>Заключение</h2>
        <p>Эти места помогут вам провести незабываемое время с детьми в Москве.</p>
      `,
      featuredImage: '/images/blog/moscow-places.jpg',
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'HIGH',
      categoryId: createdCategories[0].id,
      authorId: author.id,
      cityId: createdCities[0].id,
      seoTitle: '10 лучших мест для детей в Москве - Kiddeo',
      seoDescription: 'Топ-10 мест для семейного отдыха в Москве. Безопасные и интересные места для детей.',
      seoKeywords: 'дети, Москва, развлечения, семейный отдых'
    },
    {
      title: 'Как выбрать спортивную секцию для ребенка',
      slug: 'kak-vybrat-sportivnuyu-sekciyu-dlya-rebenka',
      excerpt: 'Руководство для родителей по выбору подходящей спортивной секции',
      content: `
        <h2>Важность спорта в жизни ребенка</h2>
        <p>Спорт играет важную роль в физическом и психическом развитии детей.</p>
        
        <h2>Критерии выбора</h2>
        <p>При выборе секции учитывайте возраст, интересы и физические возможности ребенка.</p>
        
        <h2>Популярные виды спорта</h2>
        <p>Футбол, плавание, гимнастика, танцы - каждый вид спорта имеет свои преимущества.</p>
      `,
      featuredImage: '/images/blog/sports-selection.jpg',
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'NORMAL',
      categoryId: createdCategories[1].id,
      authorId: author.id,
      cityId: createdCities[0].id,
      seoTitle: 'Как выбрать спортивную секцию для ребенка - советы родителям',
      seoDescription: 'Полное руководство по выбору спортивной секции для детей разного возраста.',
      seoKeywords: 'спорт, дети, секция, выбор, развитие'
    },
    {
      title: 'Здоровое питание для детей: основы',
      slug: 'zdorovoe-pitanie-dlya-detej-osnovy',
      excerpt: 'Основные принципы здорового питания для детей разных возрастов',
      content: `
        <h2>Принципы здорового питания</h2>
        <p>Сбалансированное питание - основа здоровья ребенка.</p>
        
        <h2>Возрастные особенности</h2>
        <p>Питание детей разного возраста имеет свои особенности.</p>
        
        <h2>Полезные продукты</h2>
        <p>Какие продукты должны быть в рационе ребенка.</p>
      `,
      featuredImage: '/images/blog/healthy-nutrition.jpg',
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'NORMAL',
      categoryId: createdCategories[2].id,
      authorId: author.id,
      cityId: createdCities[0].id,
      seoTitle: 'Здоровое питание для детей - основы и принципы',
      seoDescription: 'Руководство по здоровому питанию детей с учетом возрастных особенностей.',
      seoKeywords: 'питание, дети, здоровье, рацион, витамины'
    },
    {
      title: 'Творческие занятия дома',
      slug: 'tvorcheskie-zanyatiya-doma',
      excerpt: 'Идеи для творческих занятий с детьми в домашних условиях',
      content: `
        <h2>Важность творчества</h2>
        <p>Творческие занятия развивают воображение и мелкую моторику.</p>
        
        <h2>Простые поделки</h2>
        <p>Идеи для поделок из подручных материалов.</p>
        
        <h2>Рисование и лепка</h2>
        <p>Как организовать творческие занятия дома.</p>
      `,
      featuredImage: '/images/blog/creative-activities.jpg',
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'NORMAL',
      categoryId: createdCategories[3].id,
      authorId: author.id,
      cityId: createdCities[0].id,
      seoTitle: 'Творческие занятия с детьми дома - идеи и советы',
      seoDescription: 'Простые и интересные творческие занятия для детей в домашних условиях.',
      seoKeywords: 'творчество, дети, поделки, рисование, развитие'
    },
    {
      title: 'Советы по безопасности детей',
      slug: 'sovety-po-bezopasnosti-detej',
      excerpt: 'Основные правила безопасности для детей в городе и дома',
      content: `
        <h2>Безопасность дома</h2>
        <p>Как сделать дом безопасным для ребенка.</p>
        
        <h2>Безопасность на улице</h2>
        <p>Правила поведения на улице и в общественных местах.</p>
        
        <h2>Интернет-безопасность</h2>
        <p>Как защитить ребенка в интернете.</p>
      `,
      featuredImage: '/images/blog/child-safety.jpg',
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'HIGH',
      categoryId: createdCategories[4].id,
      authorId: author.id,
      cityId: createdCities[0].id,
      seoTitle: 'Безопасность детей - советы родителям',
      seoDescription: 'Полное руководство по обеспечению безопасности детей дома и на улице.',
      seoKeywords: 'безопасность, дети, защита, правила, родители'
    },
    {
      title: 'Лучшие музеи для детей в СПб',
      slug: 'luchshie-muzei-dlya-detej-v-spb',
      excerpt: 'Обзор самых интересных музеев Санкт-Петербурга для семейного посещения',
      content: `
        <h2>Музеи для детей</h2>
        <p>Санкт-Петербург богат музеями, интересными для детей.</p>
        
        <h2>Интерактивные экспозиции</h2>
        <p>Музеи с интерактивными экспонатами особенно нравятся детям.</p>
        
        <h2>Планирование посещения</h2>
        <p>Как спланировать поход в музей с детьми.</p>
      `,
      featuredImage: '/images/blog/spb-museums.jpg',
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'NORMAL',
      categoryId: createdCategories[0].id,
      authorId: author.id,
      cityId: createdCities[1].id,
      seoTitle: 'Лучшие музеи для детей в Санкт-Петербурге',
      seoDescription: 'Подборка самых интересных музеев СПб для семейного посещения с детьми.',
      seoKeywords: 'музеи, дети, Санкт-Петербург, СПб, семья'
    }
  ]

  // Добавляем еще несколько статей для разнообразия
  for (let i = 7; i <= 25; i++) {
    const categoryIndex = Math.floor(Math.random() * createdCategories.length)
    const cityIndex = Math.floor(Math.random() * createdCities.length)
    
    blogPosts.push({
      title: `Статья ${i}: Полезные советы для родителей`,
      slug: `statya-${i}-poleznye-sovety-dlya-roditelej`,
      excerpt: `Краткое описание статьи номер ${i} с полезными советами для родителей`,
      content: `
        <h2>Введение</h2>
        <p>Это тестовая статья номер ${i} с полезной информацией для родителей.</p>
        
        <h2>Основная часть</h2>
        <p>Здесь содержится основная информация по теме статьи.</p>
        
        <h2>Заключение</h2>
        <p>Выводы и рекомендации по теме статьи.</p>
      `,
      featuredImage: `/images/blog/article-${i}.jpg`,
      type: 'blog',
      status: 'PUBLISHED',
      priority: 'NORMAL',
      categoryId: createdCategories[categoryIndex].id,
      authorId: author.id,
      cityId: createdCities[cityIndex].id,
      seoTitle: `Статья ${i} - полезные советы для родителей`,
      seoDescription: `Описание статьи номер ${i} с полезными советами`,
      seoKeywords: `статья, ${i}, советы, родители, дети`
    })
  }

  for (const postData of blogPosts) {
    const post = await prisma.content.upsert({
      where: { slug: postData.slug },
      update: postData,
      create: {
        ...postData,
        publishedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`✅ Created blog post: ${post.title}`)
  }

  console.log('🎉 Blog posts seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding blog posts:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
