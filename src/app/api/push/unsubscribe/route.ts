import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 })
    }

    // Remove subscription from database
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint: endpoint
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
