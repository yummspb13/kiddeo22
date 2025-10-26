import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing fixed API...')
    
    // Используем raw SQL запрос без кавычек
    const events = await prisma.$queryRaw`
      SELECT * FROM PopularEvent
      ORDER BY sortOrder ASC, createdAt DESC
    `
    
    console.log('Fixed API result:', events)
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Fixed API error:', error)
    return NextResponse.json({ 
      error: 'Fixed API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
