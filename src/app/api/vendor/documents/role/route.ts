import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// PUT /api/vendor/documents/role - обновить роль вендора
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    
    const { role, fullName, inn, orgnip, orgn, companyName, directorName } = body

    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId: parseInt(userId) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Обновляем или создаем роль вендора
    const vendorRole = await prisma.vendorRole.upsert({
      where: { vendorId: vendor.id },
      update: {
        role,
        fullName,
        inn,
        orgnip,
        orgn,
        companyName,
        directorName
      },
      create: {
        vendorId: vendor.id,
        role,
        fullName,
        inn,
        orgnip,
        orgn,
        companyName,
        directorName
      }
    })

    return NextResponse.json({
      success: true,
      vendorRole
    })

  } catch (error) {
    console.error('Error updating vendor role:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
