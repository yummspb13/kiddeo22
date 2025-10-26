import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/vendor/documents - получить все документы вендора
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId: parseInt(userId) },
      include: {
        vendorRole: true,
        bankAccounts: true,
        taxProfiles: true,
        documents: true
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json({
      vendorRole: vendor.vendorRole,
      bankAccounts: vendor.bankAccounts,
      taxProfiles: vendor.taxProfiles,
      documents: vendor.documents
    })

  } catch (error) {
    console.error('Error fetching vendor documents:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
