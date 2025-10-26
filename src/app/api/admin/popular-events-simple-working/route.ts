import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing simple working API...')
    
    // Используем raw SQL запрос
    const events = await prisma.$queryRaw`
      SELECT * FROM PopularEvent
    `
    
    console.log('Simple working API result:', events)
    
    // Конвертируем BigInt в число для всех полей
    const processedEvents = Array.isArray(events) ? events.map((event: any) => ({
      ...event,
      id: Number(event.id),
      clickCount: Number(event.clickCount),
      viewCount: Number(event.viewCount),
      cityId: event.cityId ? Number(event.cityId) : null,
      sortOrder: Number(event.sortOrder)
    })) : []
    
    // Не нужно отключать - используем общий клиент
    
    return NextResponse.json(processedEvents)
  } catch (error) {
    console.error('Simple working API error:', error)
    return NextResponse.json({ 
      error: 'Simple working API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
