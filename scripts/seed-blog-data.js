const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBlogData() {
  try {
    console.log('🌱 Seeding blog data...');

    // Создаем категории блога
    const categories = await Promise.all([
      prisma.blogCategory.upsert({
        where: { slug: 'education' },
        update: {},
        create: {
          name: 'Образование',
          slug: 'education',
          description: 'Статьи о детском образовании и развитии',
          color: '#3B82F6',
          isActive: true
        }
      }),
      prisma.blogCategory.upsert({
        where: { slug: 'health' },
        update: {},
        create: {
          name: 'Здоровье',
          slug: 'health',
          description: 'Статьи о детском здоровье и питании',
          color: '#10B981',
          isActive: true
        }
      }),
      prisma.blogCategory.upsert({
        where: { slug: 'entertainment' },
        update: {},
        create: {
          name: 'Развлечения',
          slug: 'entertainment',
          description: 'Статьи о детских развлечениях и досуге',
          color: '#F59E0B',
          isActive: true
        }
      })
    ]);

    console.log('✅ Blog categories created:', categories.length);

    // Получаем первого пользователя как автора
    const author = await prisma.user.findFirst();
    if (!author) {
      throw new Error('No users found. Please create a user first.');
    }

    // Получаем город Москва
    const moscow = await prisma.city.findFirst({
      where: { slug: 'moskva' }
    });

    // Создаем тестовые посты
    const blogPosts = [
      {
        title: 'Как выбрать кружок для ребенка',
        slug: 'kak-vybrat-kruzhok-dlya-rebenka',
        excerpt: 'Подробное руководство по выбору дополнительного образования для детей разных возрастов',
        content: `
          <h2>Введение</h2>
          <p>Выбор кружка для ребенка — это важное решение, которое может повлиять на его развитие и будущие интересы. В этой статье мы рассмотрим основные критерии выбора и дадим практические советы.</p>
          
          <h2>Возрастные особенности</h2>
          <p>Для детей 3-5 лет лучше выбирать кружки, направленные на общее развитие: рисование, лепка, музыка, танцы.</p>
          <p>Для детей 6-8 лет можно добавить спортивные секции и более специализированные занятия.</p>
          
          <h2>Как понять интересы ребенка</h2>
          <p>Наблюдайте за тем, чем ребенок занимается в свободное время. Какие игрушки его больше всего привлекают? О чем он чаще всего говорит?</p>
          
          <h2>Практические советы</h2>
          <ul>
            <li>Начните с пробных занятий</li>
            <li>Учитывайте темперамент ребенка</li>
            <li>Не перегружайте расписание</li>
            <li>Будьте готовы к смене интересов</li>
          </ul>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        isFeatured: true,
        readTime: 8,
        publishedAt: new Date('2025-01-10'),
        authorId: author.id,
        categoryId: categories[0].id,
        cityId: moscow?.id
      },
      {
        title: 'Здоровое питание для детей',
        slug: 'zdorovoe-pitanie-dlya-detey',
        excerpt: 'Основы правильного питания для детей: что включить в рацион, а чего избегать',
        content: `
          <h2>Важность правильного питания</h2>
          <p>Правильное питание в детском возрасте закладывает основу для здоровья на всю жизнь. В этой статье мы расскажем о принципах здорового питания для детей.</p>
          
          <h2>Основные принципы</h2>
          <p>Детский рацион должен быть сбалансированным и включать все необходимые питательные вещества.</p>
          
          <h2>Полезные продукты</h2>
          <ul>
            <li>Свежие овощи и фрукты</li>
            <li>Цельнозерновые продукты</li>
            <li>Молочные продукты</li>
            <li>Нежирное мясо и рыба</li>
          </ul>
          
          <h2>Что ограничить</h2>
          <p>Следует ограничить потребление сахара, соли и обработанных продуктов.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        isFeatured: false,
        readTime: 6,
        publishedAt: new Date('2025-01-08'),
        authorId: author.id,
        categoryId: categories[1].id,
        cityId: moscow?.id
      },
      {
        title: 'Топ-10 мест для детей в Москве',
        slug: 'top-10-mest-dlya-detey-v-moskve',
        excerpt: 'Лучшие места для семейного отдыха в столице: музеи, парки, развлекательные центры',
        content: `
          <h2>Московский зоопарк</h2>
          <p>Один из старейших зоопарков Европы с богатой коллекцией животных.</p>
          
          <h2>Парк Сокольники</h2>
          <p>Отличное место для прогулок с детьми любого возраста.</p>
          
          <h2>Музей космонавтики</h2>
          <p>Интерактивный музей, где дети могут узнать о космосе.</p>
          
          <h2>Цирк Никулина</h2>
          <p>Легендарный цирк на Цветном бульваре.</p>
          
          <h2>Другие интересные места</h2>
          <ul>
            <li>Планетарий</li>
            <li>Третьяковская галерея</li>
            <li>Парк Горького</li>
            <li>ВДНХ</li>
            <li>Аквапарк "Карибия"</li>
            <li>Детский театр</li>
          </ul>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        isFeatured: false,
        readTime: 10,
        publishedAt: new Date('2025-01-05'),
        authorId: author.id,
        categoryId: categories[2].id,
        cityId: moscow?.id
      },
      {
        title: 'Развитие речи у детей',
        slug: 'razvitie-rechi-u-detey',
        excerpt: 'Как помочь ребенку развить речь: упражнения, игры и советы логопеда',
        content: `
          <h2>Этапы развития речи</h2>
          <p>Развитие речи у детей проходит в несколько этапов, каждый из которых важен для формирования правильной речи.</p>
          
          <h2>Игры для развития речи</h2>
          <p>Игровая форма обучения наиболее эффективна для детей дошкольного возраста.</p>
          
          <h2>Когда обращаться к логопеду</h2>
          <p>Если к 3 годам ребенок не говорит простыми предложениями, стоит проконсультироваться со специалистом.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        isFeatured: false,
        readTime: 7,
        publishedAt: new Date('2025-01-03'),
        authorId: author.id,
        categoryId: categories[0].id,
        cityId: moscow?.id
      },
      {
        title: 'Безопасность детей в интернете',
        slug: 'bezopasnost-detey-v-internete',
        excerpt: 'Как защитить ребенка от опасностей интернета: настройки, контроль и обучение',
        content: `
          <h2>Основные угрозы</h2>
          <p>Интернет может быть опасным местом для детей. Важно знать основные угрозы и способы защиты.</p>
          
          <h2>Настройка родительского контроля</h2>
          <p>Современные устройства и программы позволяют настроить безопасный интернет для детей.</p>
          
          <h2>Обучение цифровой грамотности</h2>
          <p>Важно не только ограничивать доступ, но и обучать детей правильному поведению в сети.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
        status: 'PUBLISHED',
        isFeatured: false,
        readTime: 9,
        publishedAt: new Date('2025-01-01'),
        authorId: author.id,
        categoryId: categories[0].id,
        cityId: moscow?.id
      }
    ];

    // Создаем посты
    for (const postData of blogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: {},
        create: postData
      });
    }

    console.log('✅ Blog posts created:', blogPosts.length);

    // Создаем несколько комментариев
    const posts = await prisma.blogPost.findMany();
    if (posts.length > 0) {
      await prisma.blogComment.createMany({
        data: [
          {
            content: 'Очень полезная статья! Спасибо за советы.',
            isApproved: true,
            postId: posts[0].id,
            userId: author.id
          },
          {
            content: 'Попробовали ваши рекомендации, результат отличный!',
            isApproved: true,
            postId: posts[0].id,
            userId: author.id
          },
          {
            content: 'Интересная подборка мест, обязательно посетим.',
            isApproved: true,
            postId: posts[2].id,
            userId: author.id
          }
        ]
      });

      console.log('✅ Blog comments created');
    }

    console.log('🎉 Blog data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding blog data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedBlogData();

