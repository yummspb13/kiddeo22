import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { subscription, userAgent, timestamp } = await request.json()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription data is required' }, { status: 400 })
    }

    // Get user ID from session/token (implement your auth logic)
    const userId = request.headers.get('x-user-id') // You'll need to implement this

    // Store subscription in database
    await prisma.pushSubscription.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || 'Unknown',
        userId: userId || null,
        createdAt: new Date(timestamp || new Date().toISOString())
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing push subscription:', error)
    return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 })
  }
}
