import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// PUT /api/vendor/documents/bank-account - обновить банковские реквизиты
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    
    const { bankName, bik, account } = body

    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId: parseInt(userId) }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Обновляем или создаем банковские реквизиты
    const bankAccount = await prisma.bankAccount.upsert({
      where: { vendorId: vendor.id },
      update: {
        bankName,
        bik,
        account
      },
      create: {
        vendorId: vendor.id,
        bankName,
        bik,
        account
      }
    })

    return NextResponse.json({
      success: true,
      bankAccount
    })

  } catch (error) {
    console.error('Error updating bank account:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
