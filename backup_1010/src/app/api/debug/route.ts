import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== DEBUG INFO ===')
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    const events = await prisma.afishaEvent.findMany()
    console.log('Events found by Prisma:', events.length)
    
    if (events.length > 0) {
      console.log('First event title:', events[0].title)
    }
    
    return NextResponse.json({
      databaseUrl: process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      eventsCount: events.length,
      firstEvent: events[0]?.title || null
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL
    }, { status: 500 })
  }
}
