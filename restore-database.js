#!/usr/bin/env node

/**
 * restore-database.js - Полное восстановление базы данных Kiddeo
 * 
 * Этот скрипт восстанавливает базу данных из текущего состояния
 * Используется когда Prisma предупреждает об опасных операциях
 * или когда нужно полностью очистить и восстановить БД
 * 
 * Использование:
 * node restore-database.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Текущие данные для восстановления (обновляется автоматически)
const databaseData = {
  // Города
  cities: [
    { id: 1, slug: 'moscow', name: 'Москва', isPublic: true },
    { id: 2, slug: 'spb', name: 'Санкт-Петербург', isPublic: true },
    { id: 3, slug: 'ekaterinburg', name: 'Екатеринбург', isPublic: true },
    { id: 4, slug: 'novosibirsk', name: 'Новосибирск', isPublic: true },
    { id: 5, slug: 'kazan', name: 'Казань', isPublic: true },
    { id: 6, slug: 'nizhny-novgorod', name: 'Нижний Новгород', isPublic: true },
    { id: 7, slug: 'chelyabinsk', name: 'Челябинск', isPublic: true },
    { id: 8, slug: 'omsk', name: 'Омск', isPublic: true },
    { id: 9, slug: 'samara', name: 'Самара', isPublic: true },
    { id: 10, slug: 'rostov-on-don', name: 'Ростов-на-Дону', isPublic: true }
  ],

  // Категории мест
  categories: [
    { id: 1, slug: 'entertainment', name: 'Развлечения', description: 'Развлекательные заведения', icon: '/icons/entertainment.svg', isActive: true, sortOrder: 1 },
    { id: 2, slug: 'education', name: 'Образование', description: 'Образовательные учреждения', icon: '/icons/education.svg', isActive: true, sortOrder: 2 },
    { id: 3, slug: 'sports', name: 'Спорт', description: 'Спортивные заведения', icon: '/icons/sports.svg', isActive: true, sortOrder: 3 },
    { id: 4, slug: 'culture', name: 'Культура', description: 'Культурные заведения', icon: '/icons/culture.svg', isActive: true, sortOrder: 4 },
    { id: 5, slug: 'health', name: 'Здоровье', description: 'Медицинские и оздоровительные заведения', icon: '/icons/health.svg', isActive: true, sortOrder: 5 },
    { id: 6, slug: 'shopping', name: 'Покупки', description: 'Торговые центры и магазины', icon: '/icons/shopping.svg', isActive: true, sortOrder: 6 },
    { id: 7, slug: 'food', name: 'Питание', description: 'Рестораны и кафе', icon: '/icons/food.svg', isActive: true, sortOrder: 7 },
    { id: 8, slug: 'services', name: 'Услуги', description: 'Бытовые услуги', icon: '/icons/services.svg', isActive: true, sortOrder: 8 }
  ],

  // Подкатегории
  subcategories: [
    // Развлечения
    { id: 1, categoryId: 1, slug: 'cinema', name: 'Кинотеатры', description: 'Кинотеатры и кинокомплексы', icon: '/icons/cinema.svg', isActive: true, sortOrder: 1 },
    { id: 2, categoryId: 1, slug: 'theater', name: 'Театры', description: 'Театры и театральные студии', icon: '/icons/theater.svg', isActive: true, sortOrder: 2 },
    { id: 3, categoryId: 1, slug: 'bowling', name: 'Боулинг', description: 'Боулинг-клубы', icon: '/icons/bowling.svg', isActive: true, sortOrder: 3 },
    { id: 4, categoryId: 1, slug: 'billiards', name: 'Бильярд', description: 'Бильярдные клубы', icon: '/icons/billiards.svg', isActive: true, sortOrder: 4 },
    { id: 5, categoryId: 1, slug: 'karaoke', name: 'Караоке', description: 'Караоке-бары', icon: '/icons/karaoke.svg', isActive: true, sortOrder: 5 },
    
    // Образование
    { id: 6, categoryId: 2, slug: 'kindergarten', name: 'Детские сады', description: 'Дошкольные образовательные учреждения', icon: '/icons/kindergarten.svg', isActive: true, sortOrder: 1 },
    { id: 7, categoryId: 2, slug: 'school', name: 'Школы', description: 'Общеобразовательные школы', icon: '/icons/school.svg', isActive: true, sortOrder: 2 },
    { id: 8, categoryId: 2, slug: 'courses', name: 'Курсы', description: 'Образовательные курсы и студии', icon: '/icons/courses.svg', isActive: true, sortOrder: 3 },
    { id: 9, categoryId: 2, slug: 'tutoring', name: 'Репетиторство', description: 'Репетиторские центры', icon: '/icons/tutoring.svg', isActive: true, sortOrder: 4 },
    
    // Спорт
    { id: 10, categoryId: 3, slug: 'swimming', name: 'Плавание', description: 'Бассейны и аквапарки', icon: '/icons/swimming.svg', isActive: true, sortOrder: 1 },
    { id: 11, categoryId: 3, slug: 'gym', name: 'Фитнес', description: 'Фитнес-клубы и тренажерные залы', icon: '/icons/gym.svg', isActive: true, sortOrder: 2 },
    { id: 12, categoryId: 3, slug: 'martial-arts', name: 'Боевые искусства', description: 'Секции боевых искусств', icon: '/icons/martial-arts.svg', isActive: true, sortOrder: 3 },
    { id: 13, categoryId: 3, slug: 'dance', name: 'Танцы', description: 'Танцевальные студии', icon: '/icons/dance.svg', isActive: true, sortOrder: 4 },
    { id: 14, categoryId: 3, slug: 'football', name: 'Футбол', description: 'Футбольные секции и поля', icon: '/icons/football.svg', isActive: true, sortOrder: 5 }
  ],

  // Тарифные планы
  tariffPlans: [
    { id: 1, name: 'Бесплатный', tariff: 'FREE', price: 0, duration: 365, features: JSON.stringify(['До 3 мест', 'Базовая аналитика', 'Email поддержка']), isActive: true },
    { id: 2, name: 'Базовый', tariff: 'BASIC', price: 2900, duration: 30, features: JSON.stringify(['До 10 мест', 'Расширенная аналитика', 'Приоритетная поддержка', 'Продвижение']), isActive: true },
    { id: 3, name: 'Профессиональный', tariff: 'PRO', price: 5900, duration: 30, features: JSON.stringify(['Безлимит мест', 'Полная аналитика', 'Персональный менеджер', 'Максимальное продвижение', 'API доступ']), isActive: true },
    { id: 4, name: 'Корпоративный', tariff: 'ENTERPRISE', price: 14900, duration: 30, features: JSON.stringify(['Безлимит мест', 'Корпоративная аналитика', 'Персональный менеджер', 'Максимальное продвижение', 'API доступ', 'Интеграции', 'Белый лейбл']), isActive: true }
  ],

  // Параметры мест
  venueParameters: [
    { id: 1, name: 'Возрастные ограничения', type: 'SELECT', options: JSON.stringify(['0+', '6+', '12+', '16+', '18+']), isRequired: true, isActive: true, sortOrder: 1 },
    { id: 2, name: 'Время работы', type: 'TEXT', options: null, isRequired: true, isActive: true, sortOrder: 2 },
    { id: 3, name: 'Стоимость', type: 'TEXT', options: null, isRequired: false, isActive: true, sortOrder: 3 },
    { id: 4, name: 'Парковка', type: 'BOOLEAN', options: null, isRequired: false, isActive: true, sortOrder: 4 },
    { id: 5, name: 'Wi-Fi', type: 'BOOLEAN', options: null, isRequired: false, isActive: true, sortOrder: 5 },
    { id: 6, name: 'Доступность для инвалидов', type: 'BOOLEAN', options: null, isRequired: false, isActive: true, sortOrder: 6 },
    { id: 7, name: 'Бронирование', type: 'BOOLEAN', options: null, isRequired: false, isActive: true, sortOrder: 7 },
    { id: 8, name: 'Детская комната', type: 'BOOLEAN', options: null, isRequired: false, isActive: true, sortOrder: 8 }
  ],

  // Фильтры
  venueFilters: [
    { id: 1, name: 'Возрастные ограничения', type: 'SELECT', options: JSON.stringify(['0+', '6+', '12+', '16+', '18+']), isActive: true, sortOrder: 1 },
    { id: 2, name: 'Стоимость', type: 'RANGE', options: JSON.stringify({ min: 0, max: 10000, step: 100 }), isActive: true, sortOrder: 2 },
    { id: 3, name: 'Парковка', type: 'BOOLEAN', options: null, isActive: true, sortOrder: 3 },
    { id: 4, name: 'Wi-Fi', type: 'BOOLEAN', options: null, isActive: true, sortOrder: 4 },
    { id: 5, name: 'Доступность для инвалидов', type: 'BOOLEAN', options: null, isActive: true, sortOrder: 5 },
    { id: 6, name: 'Бронирование', type: 'BOOLEAN', options: null, isActive: true, sortOrder: 6 },
    { id: 7, name: 'Детская комната', type: 'BOOLEAN', options: null, isActive: true, sortOrder: 7 }
  ],

  // Популярные категории
  popularCategories: [
    { id: 1, name: 'Детские развлечения', slug: 'kids-entertainment', description: 'Развлечения для детей', icon: '/icons/kids-entertainment.svg', isActive: true, sortOrder: 1 },
    { id: 2, name: 'Образование', slug: 'education', description: 'Образовательные услуги', icon: '/icons/education.svg', isActive: true, sortOrder: 2 },
    { id: 3, name: 'Спорт', slug: 'sports', description: 'Спортивные услуги', icon: '/icons/sports.svg', isActive: true, sortOrder: 3 },
    { id: 4, name: 'Культура', slug: 'culture', description: 'Культурные мероприятия', icon: '/icons/culture.svg', isActive: true, sortOrder: 4 },
    { id: 5, name: 'Здоровье', slug: 'health', description: 'Медицинские услуги', icon: '/icons/health.svg', isActive: true, sortOrder: 5 }
  ],

  // Администраторы
  users: [
    {
      id: 1,
      email: 'admin@kiddeo.ru',
      name: 'Администратор',
      role: 'ADMIN',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      email: 'moderator@kiddeo.ru',
      name: 'Модератор',
      role: 'MODERATOR',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Тестовые вендоры
  vendors: [
    {
      id: 1,
      userId: 1,
      displayName: 'Kiddeo Events',
      cityId: 1,
      description: 'Официальный вендор Kiddeo для тестовых мероприятий',
      phone: '+7 (495) 123-45-67',
      email: 'events@kiddeo.ru',
      address: 'Москва, ул. Тестовая, 1',
      website: 'https://kiddeo.ru',
      supportEmail: 'support@kiddeo.ru',
      supportPhone: '+7 (495) 123-45-67',
      brandSlug: 'kiddeo-events',
      proofType: 'LETTER',
      proofData: JSON.stringify({ type: 'official', verified: true }),
      agreements: JSON.stringify({ terms: true, privacy: true, marketing: true }),
      canPostEvents: true,
      canPostCatalog: true,
      kycStatus: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Тестовые места
  venues: [
    {
      id: 1,
      name: 'Тестовое место Kiddeo',
      slug: 'test-venue-kiddeo',
      description: 'Тестовое место для демонстрации функционала',
      address: 'Москва, ул. Тестовая, 1',
      coordinates: JSON.stringify({ lat: 55.7558, lng: 37.6176 }),
      phone: '+7 (495) 123-45-67',
      email: 'test@kiddeo.ru',
      website: 'https://kiddeo.ru',
      workingHours: JSON.stringify({
        monday: '09:00-21:00',
        tuesday: '09:00-21:00',
        wednesday: '09:00-21:00',
        thursday: '09:00-21:00',
        friday: '09:00-21:00',
        saturday: '10:00-20:00',
        sunday: '10:00-20:00'
      }),
      features: JSON.stringify(['wifi', 'parking', 'accessibility', 'booking']),
      images: JSON.stringify(['/images/test-venue-1.jpg', '/images/test-venue-2.jpg']),
      cityId: 1,
      categoryId: 1,
      subcategoryId: 1,
      vendorId: 1,
      status: 'ACTIVE',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

async function clearDatabase() {
  console.log('🧹 Очистка базы данных...')
  
  // Удаляем все данные в правильном порядке (с учетом внешних ключей)
  const tables = [
    'VenueReview',
    'EventReview', 
    'VenueClaim',
    'ListingClaim',
    'VendorSubscription',
    'VendorOnboarding',
    'VendorRole',
    'Vendor',
    'VenuePartner',
    'Venue',
    'Event',
    'UserSession',
    'User',
    'VenueFilter',
    'VenueParameter',
    'VenueSubcategory',
    'VenueCategory',
    'PopularCategory',
    'VendorTariffPlan',
    'City'
  ]

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
      console.log(`✅ Очищена таблица: ${table}`)
    } catch (error) {
      console.log(`⚠️  Пропущена таблица: ${table} (${error.message})`)
    }
  }
}

async function restoreData() {
  console.log('📥 Восстановление данных...')

  try {
    // Восстанавливаем города
    console.log('🏙️  Восстановление городов...')
    for (const city of databaseData.cities) {
      await prisma.city.create({ data: city })
    }
    console.log(`✅ Восстановлено ${databaseData.cities.length} городов`)

    // Восстанавливаем пользователей
    console.log('👥 Восстановление пользователей...')
    for (const user of databaseData.users) {
      await prisma.user.create({ data: user })
    }
    console.log(`✅ Восстановлено ${databaseData.users.length} пользователей`)

    // Восстанавливаем тарифные планы
    console.log('💰 Восстановление тарифных планов...')
    for (const plan of databaseData.tariffPlans) {
      await prisma.vendorTariffPlan.create({ data: plan })
    }
    console.log(`✅ Восстановлено ${databaseData.tariffPlans.length} тарифных планов`)

    // Восстанавливаем категории
    console.log('📂 Восстановление категорий...')
    for (const category of databaseData.categories) {
      await prisma.venueCategory.create({ data: category })
    }
    console.log(`✅ Восстановлено ${databaseData.categories.length} категорий`)

    // Восстанавливаем подкатегории
    console.log('📁 Восстановление подкатегорий...')
    for (const subcategory of databaseData.subcategories) {
      await prisma.venueSubcategory.create({ data: subcategory })
    }
    console.log(`✅ Восстановлено ${databaseData.subcategories.length} подкатегорий`)

    // Восстанавливаем параметры мест
    console.log('⚙️  Восстановление параметров мест...')
    for (const param of databaseData.venueParameters) {
      await prisma.venueParameter.create({ data: param })
    }
    console.log(`✅ Восстановлено ${databaseData.venueParameters.length} параметров`)

    // Восстанавливаем фильтры
    console.log('🔍 Восстановление фильтров...')
    for (const filter of databaseData.venueFilters) {
      await prisma.venueFilter.create({ data: filter })
    }
    console.log(`✅ Восстановлено ${databaseData.venueFilters.length} фильтров`)

    // Восстанавливаем популярные категории
    console.log('⭐ Восстановление популярных категорий...')
    for (const popular of databaseData.popularCategories) {
      await prisma.popularCategory.create({ data: popular })
    }
    console.log(`✅ Восстановлено ${databaseData.popularCategories.length} популярных категорий`)

    // Восстанавливаем вендоров
    console.log('🏢 Восстановление вендоров...')
    for (const vendor of databaseData.vendors) {
      await prisma.vendor.create({ data: vendor })
    }
    console.log(`✅ Восстановлено ${databaseData.vendors.length} вендоров`)

    // Восстанавливаем места
    console.log('🏪 Восстановление мест...')
    for (const venue of databaseData.venues) {
      await prisma.venue.create({ data: venue })
    }
    console.log(`✅ Восстановлено ${databaseData.venues.length} мест`)

    console.log('🎉 База данных успешно восстановлена!')

  } catch (error) {
    console.error('❌ Ошибка при восстановлении данных:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 Запуск восстановления базы данных Kiddeo...')
  console.log('⚠️  ВНИМАНИЕ: Все существующие данные будут удалены!')
  
  try {
    await clearDatabase()
    await restoreData()
    
    console.log('\n✅ Восстановление завершено успешно!')
    console.log('📊 Статистика:')
    console.log(`   - Города: ${databaseData.cities.length}`)
    console.log(`   - Пользователи: ${databaseData.users.length}`)
    console.log(`   - Тарифные планы: ${databaseData.tariffPlans.length}`)
    console.log(`   - Категории: ${databaseData.categories.length}`)
    console.log(`   - Подкатегории: ${databaseData.subcategories.length}`)
    console.log(`   - Параметры: ${databaseData.venueParameters.length}`)
    console.log(`   - Фильтры: ${databaseData.venueFilters.length}`)
    console.log(`   - Популярные категории: ${databaseData.popularCategories.length}`)
    console.log(`   - Вендоры: ${databaseData.vendors.length}`)
    console.log(`   - Места: ${databaseData.venues.length}`)
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск скрипта
if (require.main === module) {
  main()
}

module.exports = { clearDatabase, restoreData, databaseData }
