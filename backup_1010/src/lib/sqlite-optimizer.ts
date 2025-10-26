import { prisma } from '@/lib/prisma';

export interface SqliteOptimizationResult {
  success: boolean;
  message: string;
  optimizations: string[];
  errors: string[];
}

class SqliteOptimizer {
  private static instance: SqliteOptimizer;

  private constructor() {}

  static getInstance(): SqliteOptimizer {
    if (!SqliteOptimizer.instance) {
      SqliteOptimizer.instance = new SqliteOptimizer();
    }
    return SqliteOptimizer.instance;
  }

  async optimizeDatabase(): Promise<SqliteOptimizationResult> {
    const result: SqliteOptimizationResult = {
      success: true,
      message: 'Database optimization completed',
      optimizations: [],
      errors: [],
    };

    try {
      // 1. Включаем WAL режим для лучшей производительности
      await this.enableWALMode();
      result.optimizations.push('Enabled WAL mode for better concurrency');

      // 2. Настраиваем PRAGMA параметры
      await this.configurePragmaSettings();
      result.optimizations.push('Configured PRAGMA settings for performance');

      // 3. Создаем индексы для часто используемых запросов
      await this.createPerformanceIndexes();
      result.optimizations.push('Created performance indexes');

      // 4. Анализируем и обновляем статистику
      await this.analyzeDatabase();
      result.optimizations.push('Updated database statistics');

      // 5. Очищаем неиспользуемые страницы
      await this.vacuumDatabase();
      result.optimizations.push('Vacuumed database to reclaim space');

      // 6. Создаем таблицу для API логов
      await this.createApiLogsTable();
      result.optimizations.push('Created API logs table');

    } catch (error) {
      result.success = false;
      result.message = 'Database optimization failed';
      result.errors.push(error instanceof Error ? error.message : String(error));
    }

    return result;
  }

  private async enableWALMode(): Promise<void> {
    await prisma.$executeRaw`PRAGMA journal_mode = WAL`;
  }

  private async configurePragmaSettings(): Promise<void> {
    // Настройки для производительности
    await prisma.$executeRaw`PRAGMA synchronous = NORMAL`;
    await prisma.$executeRaw`PRAGMA cache_size = 10000`;
    await prisma.$executeRaw`PRAGMA temp_store = MEMORY`;
    await prisma.$executeRaw`PRAGMA mmap_size = 268435456`; // 256MB
    await prisma.$executeRaw`PRAGMA page_size = 4096`;
    await prisma.$executeRaw`PRAGMA auto_vacuum = INCREMENTAL`;
  }

  private async createPerformanceIndexes(): Promise<void> {
    // Индексы для User таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_email ON User(email)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_role ON User(role)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_user_created_at ON User(createdAt)`;

    // Индексы для Vendor таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_user_id ON Vendor(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_city_id ON Vendor(cityId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_type ON Vendor(type)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_vendor_kyc_status ON Vendor(kycStatus)`;

    // Индексы для Listing таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_vendor_id ON Listing(vendorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_city_id ON Listing(cityId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_category_id ON Listing(categoryId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_is_active ON Listing(isActive)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_created_at ON Listing(createdAt)`;

    // Индексы для AfishaEvent таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_city ON AfishaEvent(city)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_status ON AfishaEvent(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_start_date ON AfishaEvent(startDate)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_is_popular ON AfishaEvent(isPopular)`;

    // Индексы для VenuePartner таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_vendor_id ON VenuePartner(vendorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_city_id ON VenuePartner(cityId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_status ON VenuePartner(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_venue_partner_subcategory_id ON VenuePartner(subcategoryId)`;

    // Индексы для Order таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_user_id ON "Order"(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_vendor_id ON "Order"(vendorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order"(createdAt)`;

    // Индексы для Payment таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_user_id ON Payment(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_status ON Payment(status)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_payment_created_at ON Payment(createdAt)`;

    // Индексы для Notification таблицы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notification_user_id ON Notification(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notification_is_read ON Notification(isRead)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_notification_created_at ON Notification(createdAt)`;

    // Составные индексы для сложных запросов
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_listing_city_category_active ON Listing(cityId, categoryId, isActive)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_afisha_event_city_status_date ON AfishaEvent(city, status, startDate)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_order_user_status_created ON "Order"(userId, status, createdAt)`;
  }

  private async analyzeDatabase(): Promise<void> {
    await prisma.$executeRaw`ANALYZE`;
  }

  private async vacuumDatabase(): Promise<void> {
    await prisma.$executeRaw`VACUUM`;
  }

  private async createApiLogsTable(): Promise<void> {
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

    // Создаем индексы для таблицы логов
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_pathname ON api_logs(pathname)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_duration ON api_logs(duration)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_method ON api_logs(method)`;
  }

  async getDatabaseStats(): Promise<{
    pageCount: number;
    pageSize: number;
    freePages: number;
    usedPages: number;
    cacheSize: number;
    journalMode: string;
    synchronous: number;
    tempStore: number;
    autoVacuum: number;
  }> {
    try {
      const [
        pageCountResult,
        pageSizeResult,
        freePagesResult,
        cacheSizeResult,
        journalModeResult,
        synchronousResult,
        tempStoreResult,
        autoVacuumResult,
      ] = await Promise.all([
        prisma.$queryRaw`PRAGMA page_count` as any,
        prisma.$queryRaw`PRAGMA page_size` as any,
        prisma.$queryRaw`PRAGMA freelist_count` as any,
        prisma.$queryRaw`PRAGMA cache_size` as any,
        prisma.$queryRaw`PRAGMA journal_mode` as any,
        prisma.$queryRaw`PRAGMA synchronous` as any,
        prisma.$queryRaw`PRAGMA temp_store` as any,
        prisma.$queryRaw`PRAGMA auto_vacuum` as any,
      ]);

      const pageCount = Number(pageCountResult[0]?.page_count || 0);
      const pageSize = Number(pageSizeResult[0]?.page_size || 0);
      const freePages = Number(freePagesResult[0]?.freelist_count || 0);
      const usedPages = pageCount - freePages;

      return {
        pageCount,
        pageSize,
        freePages,
        usedPages,
        cacheSize: Number(cacheSizeResult[0]?.cache_size || 0),
        journalMode: journalModeResult[0]?.journal_mode || 'unknown',
        synchronous: Number(synchronousResult[0]?.synchronous || 0),
        tempStore: Number(tempStoreResult[0]?.temp_store || 0),
        autoVacuum: Number(autoVacuumResult[0]?.auto_vacuum || 0),
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      throw error;
    }
  }

  async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.$executeRaw`
        DELETE FROM api_logs 
        WHERE timestamp < ${cutoffDate}
      `;

      return Number(result);
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      throw error;
    }
  }
}

export const sqliteOptimizer = SqliteOptimizer.getInstance();
