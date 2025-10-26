import { prisma } from '@/lib/db';

export interface ApiLogEntry {
  id?: number;
  method: string;
  url: string;
  pathname: string;
  statusCode: number;
  duration: number; // в миллисекундах
  userAgent?: string;
  ip?: string;
  userId?: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
  timestamp: Date;
}

class ApiLogger {
  private static instance: ApiLogger;
  private logs: ApiLogEntry[] = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  async logRequest(
    method: string,
    url: string,
    pathname: string,
    statusCode: number,
    duration: number,
    userAgent?: string,
    ip?: string,
    userId?: number,
    error?: string,
    requestBody?: any,
    responseBody?: any
  ): Promise<void> {
    const logEntry: ApiLogEntry = {
      method,
      url,
      pathname,
      statusCode,
      duration,
      userAgent,
      ip,
      userId,
      error,
      requestBody: requestBody ? JSON.stringify(requestBody) : null,
      responseBody: responseBody ? JSON.stringify(responseBody) : null,
      timestamp: new Date(),
    };

    // Добавляем в память для быстрого доступа
    this.logs.unshift(logEntry);
    
    // Ограничиваем количество логов в памяти
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    // Сохраняем в базу данных асинхронно
    this.saveToDatabase(logEntry);
  }

  private async saveToDatabase(logEntry: ApiLogEntry): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO api_logs (
          method, url, pathname, status_code, duration, 
          user_agent, ip, user_id, error, request_body, 
          response_body, timestamp
        ) VALUES (
          ${logEntry.method}, ${logEntry.url}, ${logEntry.pathname}, 
          ${logEntry.statusCode}, ${logEntry.duration}, 
          ${logEntry.userAgent || null}, ${logEntry.ip || null}, 
          ${logEntry.userId || null}, ${logEntry.error || null}, 
          ${logEntry.requestBody || null}, ${logEntry.responseBody || null}, 
          ${logEntry.timestamp}
        )
      `;
    } catch (error) {
      console.error('Failed to save API log to database:', error);
    }
  }

  getLogs(limit: number = 100): ApiLogEntry[] {
    return this.logs.slice(0, limit);
  }

  getStats(): {
    totalRequests: number;
    averageDuration: number;
    errorRate: number;
    statusCodes: Record<number, number>;
    slowestRoutes: Array<{ pathname: string; avgDuration: number; count: number }>;
  } {
    const totalRequests = this.logs.length;
    const averageDuration = this.logs.reduce((sum, log) => sum + log.duration, 0) / totalRequests || 0;
    const errorCount = this.logs.filter(log => log.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100 || 0;

    const statusCodes: Record<number, number> = {};
    this.logs.forEach(log => {
      statusCodes[log.statusCode] = (statusCodes[log.statusCode] || 0) + 1;
    });

    const routeStats: Record<string, { totalDuration: number; count: number }> = {};
    this.logs.forEach(log => {
      if (!routeStats[log.pathname]) {
        routeStats[log.pathname] = { totalDuration: 0, count: 0 };
      }
      routeStats[log.pathname].totalDuration += log.duration;
      routeStats[log.pathname].count += 1;
    });

    const slowestRoutes = Object.entries(routeStats)
      .map(([pathname, stats]) => ({
        pathname,
        avgDuration: stats.totalDuration / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      totalRequests,
      averageDuration: Math.round(averageDuration),
      errorRate: Math.round(errorRate * 100) / 100,
      statusCodes,
      slowestRoutes,
    };
  }

  async getDatabaseStats(): Promise<{
    totalRequests: number;
    averageDuration: number;
    errorRate: number;
    recentLogs: ApiLogEntry[];
  }> {
    try {
      const [totalResult, avgResult, errorResult, recentResult] = await Promise.all([
        prisma.$queryRaw`SELECT COUNT(*) as count FROM api_logs` as any,
        prisma.$queryRaw`SELECT AVG(duration) as avg FROM api_logs` as any,
        prisma.$queryRaw`SELECT COUNT(*) as count FROM api_logs WHERE status_code >= 400` as any,
        prisma.$queryRaw`
          SELECT method, url, pathname, status_code, duration, user_agent, ip, user_id, error, 
                 request_body, response_body, timestamp
          FROM api_logs 
          ORDER BY timestamp DESC 
          LIMIT 50
        ` as any,
      ]);

      const totalRequests = Number(totalResult[0]?.count || 0);
      const averageDuration = Number(avgResult[0]?.avg || 0);
      const errorCount = Number(errorResult[0]?.count || 0);
      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

      return {
        totalRequests,
        averageDuration: Math.round(averageDuration),
        errorRate: Math.round(errorRate * 100) / 100,
        recentLogs: recentResult || [],
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalRequests: 0,
        averageDuration: 0,
        errorRate: 0,
        recentLogs: [],
      };
    }
  }
}

export const apiLogger = ApiLogger.getInstance();

// Middleware для логирования API запросов
export function withApiLogging<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    let request: NextRequest | undefined;
    let response: NextResponse | undefined;
    let error: string | undefined;

    // Извлекаем request из аргументов
    if (args.length > 0 && args[0] instanceof Request) {
      request = args[0] as NextRequest;
    }

    try {
      response = await handler(...args);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      response = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    if (request) {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const userAgent = request.headers.get('user-agent') || undefined;
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';

      await apiLogger.logRequest(
        request.method,
        request.url,
        pathname,
        response?.status || 500,
        duration,
        userAgent,
        ip,
        undefined, // userId - можно извлечь из сессии
        error
      );
    }

    return response!;
  };
}

// Утилита для создания таблицы логов в SQLite
export async function createApiLogsTable(): Promise<void> {
  try {
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

    // Создаем индексы для оптимизации запросов
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_pathname ON api_logs(pathname)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_api_logs_duration ON api_logs(duration)`;

    console.log('API logs table created successfully');
  } catch (error) {
    console.error('Failed to create API logs table:', error);
  }
}