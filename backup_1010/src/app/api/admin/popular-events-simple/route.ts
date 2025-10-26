import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing simple API with Prisma...')
    
    // Используем Prisma
    const events = await prisma.popularEvent.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log('Simple API result:', events)
    
    return NextResponse.json({ 
      success: true, 
      count: events.length,
      events: events,
      message: 'Simple API is working with Prisma' 
    })
  } catch (error) {
    console.error('Simple API error:', error)
    return NextResponse.json({ 
      error: 'Simple API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
