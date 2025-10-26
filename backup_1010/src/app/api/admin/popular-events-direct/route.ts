import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing direct Prisma API...')
    
    // Используем Prisma
    const events = await prisma.popularEvent.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log('Direct Prisma API result:', events)
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Direct Prisma API error:', error)
    return NextResponse.json({ 
      error: 'Direct Prisma API error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
