import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing debug API...')
    
    // Проверяем, что таблица существует
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='PopularEvent'
    `
    
    console.log('Table exists:', tableExists)
    
    // Проверяем количество записей
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM PopularEvent
    `
    
    console.log('Count:', count)
    
    // Проверяем, что данные есть
    const events = await prisma.$queryRaw`
      SELECT id, title FROM PopularEvent LIMIT 5
    `
    
    console.log('Events:', events)
    
    // Конвертируем BigInt в число
    const countValue = Array.isArray(count) && count.length > 0 ? Number(count[0].count) : 0
    
    return NextResponse.json({ 
      success: true,
      tableExists,
      count: countValue,
      events,
      message: 'Debug API is working' 
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Debug API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
