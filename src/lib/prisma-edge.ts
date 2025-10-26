import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

// Создаем Neon connection
const connectionString = process.env.DATABASE_URL!
const neonClient = neon(connectionString)

// Создаем Prisma adapter
const adapter = new PrismaNeon(neonClient)

// Создаем Prisma client с adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
})

export { prisma }
