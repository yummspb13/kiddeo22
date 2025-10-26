import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// PUT /api/vendor/documents/tax-profile - обновить налоговый профиль
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    
    const { taxRegime, vatStatus, npdToken, npdRegion, fiscalMode, agencyAgreement } = body

    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId: parseInt(userId) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Обновляем или создаем налоговый профиль
    const taxProfile = await prisma.taxProfile.upsert({
      where: { vendorId: vendor.id },
      update: { 
        taxRegime, 
        vatStatus, 
        npdToken,
        npdRegion,
        fiscalMode: fiscalMode || 'PLATFORM',
        agencyAgreement: agencyAgreement || false
      },
      create: {
        vendorId: vendor.id,
        taxRegime,
        vatStatus,
        npdToken,
        npdRegion,
        fiscalMode: fiscalMode || 'PLATFORM',
        agencyAgreement: agencyAgreement || false
      }
    })

    return NextResponse.json({
      success: true,
      taxProfile
    })

  } catch (error) {
    console.error('Error updating tax profile:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
