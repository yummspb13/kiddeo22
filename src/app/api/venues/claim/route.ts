import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { venueId, claimType } = await request.json()

    if (!venueId || !claimType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли место
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, vendorId: true }
    })

    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      )
    }

    // Создаем заявку на клейм
    const claim = await prisma.venueClaim.create({
      data: {
        venueId,
        claimType,
        status: 'PENDING',
        // В реальном приложении здесь должен быть userId из сессии
        claimedBy: 'anonymous', // Временно
        claimData: {
          venueName: venue.name,
          claimedAt: new Date().toISOString()
        }
      }
    })

    // Логируем заявку (в реальном приложении здесь может быть уведомление админу)
    console.log(`🏢 New venue claim: ${venue.name} (ID: ${venueId})`)

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      message: 'Claim submitted successfully'
    })

  } catch (error) {
    console.error('Venue claim error:', error)
    return NextResponse.json(
      { error: 'Failed to submit claim' },
      { status: 500 }
    )
  }
}
