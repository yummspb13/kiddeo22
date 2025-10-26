import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { vendorId } = await request.json()

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 })
    }

    // Сбрасываем онбординг
    const onboarding = await prisma.vendorOnboarding.update({
      where: { vendorId: parseInt(vendorId) },
      data: {
        isCompleted: false,
        completedAt: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      onboarding: onboarding 
    })

  } catch (error) {
    console.error('Error resetting onboarding:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
