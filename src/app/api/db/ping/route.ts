import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new Response('db-ok', { 
      status: 200, 
      headers: { 'Cache-Control': 'no-store' } 
    })
  } catch (error) {
    console.error('DB ping error:', error)
    return new Response('db-error', { 
      status: 500, 
      headers: { 'Cache-Control': 'no-store' } 
    })
  }
}
