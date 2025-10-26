import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
import { getVendorModerationHistory, getModerationHistoryStats } from '@/lib/vendor-moderation-history'

// GET /api/admin/vendor-moderation-history - получить историю модераций вендора
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь админ
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { RoleAssignment: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const history = await getVendorModerationHistory(parseInt(vendorId))
    const stats = await getModerationHistoryStats(parseInt(vendorId))

    return NextResponse.json({
      success: true,
      history,
      stats
    })

  } catch (error) {
    console.error('Error fetching vendor moderation history:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
