#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function initializeLogging() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Initializing logging system...');
    
    // 1. Создаем таблицу для API логов
    console.log('📊 Creating API logs table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS api_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        pathname TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        user_agent TEXT,
        ip TEXT,
        user_id INTEGER,
        error TEXT,
        request_body TEXT,
        response_body TEXT,
        timestamp DATETIME NOT NULL
      )
    `;

    // 2. Создаем индексы
    console.log('🔍 Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_pathname ON api_logs(pathname)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_duration ON api_logs(duration)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_method ON api_logs(method)`;

    // 3. Оптимизируем базу данных
    console.log('⚡ Optimizing database...');
    await prisma.$queryRaw`PRAGMA journal_mode = WAL`;
    await prisma.$queryRaw`PRAGMA synchronous = NORMAL`;
    await prisma.$queryRaw`PRAGMA cache_size = 10000`;
    await prisma.$queryRaw`PRAGMA temp_store = MEMORY`;
    await prisma.$queryRaw`PRAGMA mmap_size = 268435456`;
    await prisma.$queryRaw`PRAGMA page_size = 4096`;
    await prisma.$queryRaw`PRAGMA auto_vacuum = INCREMENTAL`;

    // 4. Создаем дополнительные индексы для производительности
    console.log('📈 Creating performance indexes...');
    
    // User таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_email ON User(email)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_role ON User(role)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_created_at ON User(createdAt)`;

    // Vendor таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_user_id ON Vendor(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_city_id ON Vendor(cityId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_type ON Vendor(type)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_kyc_status ON Vendor(kycStatus)`;

    // Listing таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_vendor_id ON Listing(vendorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_city_id ON Listing(cityId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_category_id ON Listing(categoryId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_is_active ON Listing(isActive)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_created_at ON Listing(createdAt)`;

    // AfishaEvent таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_city ON AfishaEvent(city)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_status ON AfishaEvent(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_start_date ON AfishaEvent(startDate)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_is_popular ON AfishaEvent(isPopular)`;

    // VenuePartner таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_vendor_id ON VenuePartner(vendorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_city_id ON VenuePartner(cityId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_status ON VenuePartner(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_subcategory_id ON VenuePartner(subcategoryId)`;

    // Order таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_user_id ON "Order"(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_vendor_id ON "Order"(vendorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order"(createdAt)`;

    // Payment таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_user_id ON Payment(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_status ON Payment(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_created_at ON Payment(createdAt)`;

    // Notification таблица
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notification_user_id ON Notification(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notification_is_read ON Notification(isRead)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notification_created_at ON Notification(createdAt)`;

    // Составные индексы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_city_category_active ON Listing(cityId, categoryId, isActive)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_city_status_date ON AfishaEvent(city, status, startDate)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_user_status_created ON "Order"(userId, status, createdAt)`;

    // 5. Анализируем базу данных
    console.log('📊 Analyzing database...');
    await prisma.$executeRaw`ANALYZE`;

    // 6. Получаем статистику
    const stats = await prisma.$queryRaw`PRAGMA page_count`;
    const pageSize = await prisma.$queryRaw`PRAGMA page_size`;
    const journalMode = await prisma.$queryRaw`PRAGMA journal_mode`;

    console.log('✅ Logging system initialized successfully!');
    console.log('📊 Database stats:');
    console.log(`   - Pages: ${stats[0]?.page_count || 0}`);
    console.log(`   - Page size: ${pageSize[0]?.page_size || 0} bytes`);
    console.log(`   - Journal mode: ${journalMode[0]?.journal_mode || 'unknown'}`);
    console.log('');
    console.log('🌐 Next steps:');
    console.log('   1. Start server: npm run dev:timeout');
    console.log('   2. Open monitor: http://localhost:3000/monitor');
    console.log('   3. Check admin: http://localhost:3000/admin?key=kidsreview2025');

  } catch (error) {
    console.error('❌ Failed to initialize logging system:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем инициализацию
initializeLogging();
