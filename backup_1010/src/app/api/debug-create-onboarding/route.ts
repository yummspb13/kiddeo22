import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { vendorId } = await request.json()

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 })
    }

    // Создаем запись онбординга
    const onboarding = await prisma.vendorOnboarding.create({
      data: {
        vendorId: parseInt(vendorId),
        step: 1,
        completedSteps: [],
        isCompleted: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      onboarding: onboarding 
    })

  } catch (error) {
    console.error('Error creating onboarding:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
