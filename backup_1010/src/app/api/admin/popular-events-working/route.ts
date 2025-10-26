import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing working API...')
    
    // Используем raw SQL запрос без ORDER BY
    const events = await prisma.$queryRaw`
      SELECT * FROM PopularEvent
    `
    
    console.log('Working API result:', events)
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Working API error:', error)
    return NextResponse.json({ 
      error: 'Working API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
