import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing final API...')
    
    // Используем raw SQL запрос без ORDER BY
    const events = await prisma.$queryRaw`
      SELECT * FROM PopularEvent
    `
    
    console.log('Final API result:', events)
    
    // Конвертируем BigInt в число для всех полей
    const processedEvents = Array.isArray(events) ? events.map((event: any) => ({
      ...event,
      id: Number(event.id),
      clickCount: Number(event.clickCount),
      viewCount: Number(event.viewCount),
      cityId: event.cityId ? Number(event.cityId) : null,
      sortOrder: Number(event.sortOrder)
    })) : []
    
    return NextResponse.json(processedEvents)
  } catch (error) {
    console.error('Final API error:', error)
    return NextResponse.json({ 
      error: 'Final API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
