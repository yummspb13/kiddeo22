import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем seed...')

  // Создаем города
  const cities = [
    { name: 'Москва', slug: 'moskva' },
    { name: 'Санкт-Петербург', slug: 'sankt-peterburg' },
    { name: 'Новосибирск', slug: 'novosibirsk' },
    { name: 'Екатеринбург', slug: 'ekaterinburg' },
    { name: 'Казань', slug: 'kazan' },
    { name: 'Нижний Новгород', slug: 'nizhniy-novgorod' },
    { name: 'Челябинск', slug: 'chelyabinsk' },
    { name: 'Самара', slug: 'samara' },
    { name: 'Омск', slug: 'omsk' },
    { name: 'Ростов-на-Дону', slug: 'rostov-na-donu' },
    { name: 'Уфа', slug: 'ufa' },
    { name: 'Красноярск', slug: 'krasnoyarsk' },
    { name: 'Воронеж', slug: 'voronezh' },
    { name: 'Пермь', slug: 'perm' },
    { name: 'Волгоград', slug: 'volgograd' },
    { name: 'Краснодар', slug: 'krasnodar' },
    { name: 'Саратов', slug: 'saratov' },
    { name: 'Тюмень', slug: 'tyumen' },
    { name: 'Тольятти', slug: 'tolyatti' },
    { name: 'Ижевск', slug: 'izhevsk' },
    { name: 'Барнаул', slug: 'barnaul' },
    { name: 'Ульяновск', slug: 'ulyanovsk' }
  ]

  const createdCities = []
  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { slug: cityData.slug },
      update: {},
      create: {
        name: cityData.name,
        slug: cityData.slug,
        isPublic: true
      }
    })
    createdCities.push(city)
    console.log('✅ Город создан:', city.name)
  }

  const moscow = createdCities.find(c => c.slug === 'moskva')

  // Создаем категорию Развлечения
  const entertainment = await prisma.venueCategory.upsert({
    where: { slug: 'razvlecheniya' },
    update: {},
    create: {
      name: 'Развлечения',
      slug: 'razvlecheniya',
      icon: '🎭'
    }
  })
  console.log('✅ Категория создана:', entertainment.name)

  // Создаем подкатегорию Зоопарки
  const zoo = await prisma.venueSubcategory.upsert({
    where: { slug: 'zoo' },
    update: {},
    create: {
      name: 'Зоопарки',
      slug: 'zoo',
      categoryId: entertainment.id
    }
  })
  console.log('✅ Подкатегория создана:', zoo.name)

  // Создаем тестового пользователя
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Тестовый пользователь',
      role: 'USER'
    }
  })
  console.log('✅ Пользователь создан:', user.name)

  // Создаем вендора
  const vendor = await prisma.vendor.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      displayName: 'ООО "Попугайня"',
      description: 'Лучший контактный зоопарк с попугаями',
      logo: '/popugai-logo.jpg',
      type: 'PRO',
      kycStatus: 'APPROVED',
      user: {
        connect: { id: user.id }
      },
      city: {
        connect: { id: moscow.id }
      }
    }
  })
  console.log('✅ Вендор создан:', vendor.displayName)

  // Создаем роль вендора (ИНН/ОГРН)
  const vendorRole = await prisma.vendorRole.upsert({
    where: { vendorId: vendor.id },
    update: {},
    create: {
      vendorId: vendor.id,
      role: 'LEGAL',
      inn: '7701234567',
      orgn: '1234567890123',
      legalAddress: 'г. Москва, ул. Попугайная, д. 1',
      companyName: 'ООО "Попугайня"'
    }
  })
  console.log('✅ Роль вендора создана:', vendorRole.role)

  // Создаем место "Попугайня" с FREE тарифом
  const popugaynya = await prisma.venuePartner.upsert({
    where: { slug: 'popugaynya' },
    update: {},
    create: {
      name: 'Попугайня',
      slug: 'popugaynya',
      description: 'Контактный зоопарк с попугаями для всей семьи! У нас вы сможете покормить и погладить более 20 видов попугаев.',
      address: 'г. Москва, ул. Попугайная, д. 1',
      district: 'Центральный',
      metro: 'Маяковская',
      coverImage: '/popugai-cover.jpg',
      additionalImages: JSON.stringify([
        '/popugai-1.jpg',
        '/popugai-2.jpg',
        '/popugai-3.jpg'
      ]),
      lat: 55.769717,
      lng: 37.597626,
      subcategoryId: zoo.id,
      vendorId: vendor.id,
      cityId: moscow.id,
      tariff: 'FREE',
      status: 'ACTIVE',
      priceFrom: null,
      priceTo: null,
      ageFrom: null,
      ageTo: null
    }
  })
  console.log('✅ Место создано:', popugaynya.name, '(тариф:', popugaynya.tariff + ')')

  // Создаем отзыв
  const review = await prisma.venueReview.create({
    data: {
      venueId: popugaynya.id,
      userId: user.id,
      rating: 5,
      comment: 'Отличное место! Дети в восторге, попугаи очень дружелюбные!',
      status: 'APPROVED',
      photos: JSON.stringify([
        '/review-1.jpg',
        '/review-2.jpg',
        '/review-3.jpg'
      ])
    }
  })
  console.log('✅ Отзыв создан с рейтингом:', review.rating)

  // Создаем тестовые новости
  const news1 = await prisma.venueNews.create({
    data: {
      venueId: popugaynya.id,
      authorId: user.id,
      title: 'Новое поступление попугаев!',
      content: 'У нас появились новые виды попугаев: ара, какаду и амазоны. Приходите познакомиться с ними!',
      imageUrl: '/news/popugai-news-1.jpg',
      isPublished: true
    }
  })
  console.log('✅ Новость создана:', news1.title)

  const news2 = await prisma.venueNews.create({
    data: {
      venueId: popugaynya.id,
      authorId: user.id,
      title: 'Специальные программы для детей',
      content: 'Теперь у нас есть специальные программы для детей разных возрастов. Узнайте подробности у наших сотрудников.',
      imageUrl: '/news/popugai-news-2.jpg',
      isPublished: true
    }
  })
  console.log('✅ Новость создана:', news2.title)

  console.log('🎉 Seed завершен успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

