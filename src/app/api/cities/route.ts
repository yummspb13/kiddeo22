import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}