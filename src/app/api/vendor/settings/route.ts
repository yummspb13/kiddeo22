import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// PUT /api/vendor/settings - обновить настройки вендора
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const { 
      supportEmail, 
      supportPhone, 
      website, 
      description 
    } = body

    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId: parseInt(userId) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Обновляем настройки
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        supportEmail: supportEmail || null,
        supportPhone: supportPhone || null,
        website: website || null,
        description: description || null,
      }
    })

    return NextResponse.json({ 
      success: true, 
      vendor: {
        supportEmail: updatedVendor.supportEmail,
        supportPhone: updatedVendor.supportPhone,
        website: updatedVendor.website,
        description: updatedVendor.description,
      }
    })

  } catch (error) {
    console.error('Error updating vendor settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
