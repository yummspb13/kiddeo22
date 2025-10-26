import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 API PATCH - Starting function')
    const { id } = await params
    console.log('🔍 API PATCH - ID:', id)
    
    const authResult = await requireAdminOrDevKey(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔍 API PATCH - Body:', body)

    const updatedVenuePartner = await prisma.venuePartner.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        priceFrom: body.priceFrom ? parseInt(body.priceFrom) : null,
      }
    })

    return NextResponse.json({ 
      success: true, 
      venuePartner: updatedVenuePartner 
    })
  } catch (error) {
    console.error('🔍 Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
