import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Получаем всех вендоров
    const vendors = await prisma.vendor.findMany({
      include: {
        VendorOnboarding: true
      }
    })

    return NextResponse.json({
      count: vendors.length,
      vendors: vendors.map(v => ({
        id: v.id,
        userId: v.userId,
        displayName: v.displayName,
        type: v.type,
        kycStatus: v.kycStatus,
        onboardingCompleted: v.VendorOnboarding?.isCompleted || false
      }))
    })

  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
