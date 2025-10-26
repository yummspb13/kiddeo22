// Система логирования для отслеживания операций
interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  category: string
  message: string
  data?: any
  duration?: number
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  log(level: LogEntry['level'], category: string, message: string, data?: any, duration?: number) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      duration
    }

    this.logs.push(entry)
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Выводим в консоль в development
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🐛'
      }[level]

      console.log(`${emoji} [${category}] ${message}`, data || '')
    }
  }

  info(category: string, message: string, data?: any, duration?: number) {
    this.log('info', category, message, data, duration)
  }

  warn(category: string, message: string, data?: any, duration?: number) {
    this.log('warn', category, message, data, duration)
  }

  error(category: string, message: string, data?: any, duration?: number) {
    this.log('error', category, message, data, duration)
  }

  debug(category: string, message: string, data?: any, duration?: number) {
    this.log('debug', category, message, data, duration)
  }

  getLogs(category?: string, level?: LogEntry['level']) {
    let filtered = this.logs
    
    if (category) {
      filtered = filtered.filter(log => log.category === category)
    }
    
    if (level) {
      filtered = filtered.filter(log => log.level === level)
    }
    
    return filtered
  }

  clear() {
    this.logs = []
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      errors: this.logs.filter(log => log.level === 'error').length,
      warnings: this.logs.filter(log => log.level === 'warn').length
    }

    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
    })

    return stats
  }
}

export const logger = new Logger()

// Хелперы для частых операций
export const logApiCall = (url: string, method: string, duration?: number, status?: number) => {
  const level = status && status >= 400 ? 'error' : 'info'
  logger.log(level, 'API', `${method} ${url}`, { status, duration }, duration)
}

export const logQuery = (queryKey: string, action: string, duration?: number) => {
  logger.log('info', 'ReactQuery', `${action}: ${queryKey}`, undefined, duration)
}

export const logPerformance = (operation: string, duration: number, data?: any) => {
  logger.log('info', 'Performance', operation, data, duration)
}

export const logError = (category: string, error: Error, context?: any) => {
  logger.error(category, error.message, { 
    stack: error.stack, 
    context 
  })
}