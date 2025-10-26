import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = g.prisma ?? new PrismaClient({ 
  log: ['error'],
  // Connection pooling для SQLite
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Настройки для оптимизации производительности
  transactionOptions: {
    maxWait: 5000, // 5 секунд
    timeout: 10000, // 10 секунд
  },
  // Настройки для SQLite
  __internal: {
    engine: {
      // Увеличиваем пул соединений
      connectionLimit: 10,
      // Настройки для SQLite
      enableQueryLogging: false,
      enableMetrics: false,
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  g.prisma = prisma
}
