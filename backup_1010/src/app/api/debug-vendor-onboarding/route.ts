import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем вендора и его онбординг
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: {
        VendorOnboarding: true
      }
    })

    return NextResponse.json({
      vendor: vendor,
      hasOnboarding: !!vendor?.VendorOnboarding,
      onboardingData: vendor?.VendorOnboarding
    })

  } catch (error) {
    console.error('Error checking vendor onboarding:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
