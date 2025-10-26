// Простая версия API logger без базы данных для диагностики
export interface ApiLogEntry {
  id?: number;
  method: string;
  url: string;
  pathname: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: number;
  error?: string;
  requestBody?: any;
  responseBody?: any;
  timestamp: Date;
}

class SimpleApiLogger {
  private static instance: SimpleApiLogger;
  private logs: ApiLogEntry[] = [];

  private constructor() {}

  static getInstance(): SimpleApiLogger {
    if (!SimpleApiLogger.instance) {
      SimpleApiLogger.instance = new SimpleApiLogger();
    }
    return SimpleApiLogger.instance;
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
      requestBody,
      responseBody,
      timestamp: new Date(),
    };

    // Добавляем в память
    this.logs.unshift(logEntry);
    
    // Ограничиваем количество логов в памяти
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    // Простое логирование в консоль
    console.log(`📊 API LOG: ${method} ${pathname} - ${statusCode} - ${duration}ms`);
  }

  getLogs(limit: number = 100): ApiLogEntry[] {
    return this.logs.slice(0, limit);
  }

  getStats() {
    const totalRequests = this.logs.length;
    const totalDuration = this.logs.reduce((sum, log) => sum + log.duration, 0);
    const averageDuration = totalRequests > 0 ? totalDuration / totalRequests : 0;
    const errorLogs = this.logs.filter(log => log.statusCode >= 400);
    const errorRate = totalRequests > 0 ? (errorLogs.length / totalRequests) * 100 : 0;

    const statusCodes: { [key: string]: number } = {};
    this.logs.forEach(log => {
      statusCodes[log.statusCode] = (statusCodes[log.statusCode] || 0) + 1;
    });

    const slowestRoutes = this.logs
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(log => ({
        pathname: log.pathname,
        duration: log.duration,
        timestamp: log.timestamp,
      }));

    return {
      totalRequests,
      averageDuration,
      errorRate,
      statusCodes,
      slowestRoutes,
    };
  }
}

export const apiLogger = SimpleApiLogger.getInstance();
