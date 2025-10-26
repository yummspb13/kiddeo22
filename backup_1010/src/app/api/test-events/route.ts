import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Проверяем, есть ли события в базе данных
    const events = await prisma.afishaEvent.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        city: true,
        status: true,
        startDate: true,
        endDate: true
      }
    })

    return NextResponse.json({ 
      count: events.length,
      events: events,
      message: events.length > 0 ? 'События найдены' : 'События не найдены'
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
  }
}
