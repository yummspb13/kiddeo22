import { createApiLogsTable } from '@/lib/api-logger';
import { sqliteOptimizer } from '@/lib/sqlite-optimizer';

export async function initializeLoggingSystem(): Promise<{
  success: boolean;
  message: string;
  optimizations: string[];
  errors: string[];
}> {
  const result = {
    success: true,
    message: 'Logging system initialized successfully',
    optimizations: [] as string[],
    errors: [] as string[],
  };

  try {
    // 1. Создаем таблицу для API логов
    await createApiLogsTable();
    result.optimizations.push('Created API logs table');

    // 2. Оптимизируем базу данных
    const optimizationResult = await sqliteOptimizer.optimizeDatabase();
    if (optimizationResult.success) {
      result.optimizations.push(...optimizationResult.optimizations);
    } else {
      result.errors.push(...optimizationResult.errors);
    }

    console.log('✅ Logging system initialized successfully');
    console.log('📊 Optimizations applied:', result.optimizations);

  } catch (error) {
    result.success = false;
    result.message = 'Failed to initialize logging system';
    result.errors.push(error instanceof Error ? error.message : String(error));
    console.error('❌ Failed to initialize logging system:', error);
  }

  return result;
}

// Функция для проверки здоровья системы
export async function checkSystemHealth(): Promise<{
  database: boolean;
  logging: boolean;
  optimization: boolean;
  message: string;
}> {
  try {
    // Проверяем подключение к базе данных
    const dbStats = await sqliteOptimizer.getDatabaseStats();
    const database = dbStats.pageCount > 0;

    // Проверяем систему логирования
    const { apiLogger } = await import('@/lib/api-logger');
    const logs = apiLogger.getLogs(1);
    const logging = true; // Если не упало, значит работает

    // Проверяем оптимизацию
    const optimization = dbStats.journalMode === 'wal';

    return {
      database,
      logging,
      optimization,
      message: database && logging && optimization 
        ? 'System is healthy' 
        : 'System has issues',
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      database: false,
      logging: false,
      optimization: false,
      message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
