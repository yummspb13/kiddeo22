import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { syncVenuePartnerWithListing } from '@/lib/venue-sync'

// GET /api/admin/venues/partners/[id] - получить VenuePartner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venuePartnerId = id

    if (isNaN(parseInt(venuePartnerId))) {
      return NextResponse.json({ error: 'Invalid venue partner ID' }, { status: 400 })
    }

    const venuePartner = await prisma.venuePartner.findUnique({
      where: { id: parseInt(venuePartnerId) },
      include: {
        subcategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        },
        vendor: {
          select: {
            id: true,
            displayName: true
          }
        },
        parameters: {
          include: {
            parameter: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    if (!venuePartner) {
      return NextResponse.json({ error: 'Venue partner not found' }, { status: 404 })
    }

    return NextResponse.json({ venuePartner })

  } catch (error) {
    console.error('Error fetching venue partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PATCH /api/admin/venues/partners/[id] - обновить VenuePartner
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminOrDevKey(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const venuePartnerId = id

    if (isNaN(parseInt(venuePartnerId))) {
      return NextResponse.json({ error: 'Invalid venue partner ID' }, { status: 400 })
    }

    const body = await request.json()
    const { status, moderationReason } = body

    // Проверяем, что VenuePartner существует
    const existingVenuePartner = await prisma.venuePartner.findUnique({
      where: { id: parseInt(venuePartnerId) }
    })

    if (!existingVenuePartner) {
      return NextResponse.json({ error: 'Venue partner not found' }, { status: 404 })
    }

    // Обновляем VenuePartner
    const updatedVenuePartner = await prisma.venuePartner.update({
      where: { id: parseInt(venuePartnerId) },
      data: {
        status: status || existingVenuePartner.status,
        moderationReason: moderationReason || existingVenuePartner.moderationReason
      },
      include: {
        subcategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        },
        vendor: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    })

    // Синхронизируем с Listing
    try {
      await syncVenuePartnerWithListing(parseInt(venuePartnerId))
    } catch (syncError) {
      console.error('Ошибка синхронизации с Listing:', syncError)
      // Не прерываем обновление VenuePartner из-за ошибки синхронизации
    }

    return NextResponse.json({ 
      success: true, 
      venuePartner: updatedVenuePartner,
      message: `Venue partner ${status === 'ACTIVE' ? 'активирован' : status === 'HIDDEN' ? 'скрыт' : 'обновлен'}`
    })

  } catch (error) {
    console.error('Error updating venue partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/venues/partners/[id] - удалить VenuePartner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminOrDevKey(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const venuePartnerId = id

    if (isNaN(parseInt(venuePartnerId))) {
      return NextResponse.json({ error: 'Invalid venue partner ID' }, { status: 400 })
    }

    // Проверяем, что VenuePartner существует
    const existingVenuePartner = await prisma.venuePartner.findUnique({
      where: { id: parseInt(venuePartnerId) }
    })

    if (!existingVenuePartner) {
      return NextResponse.json({ error: 'Venue partner not found' }, { status: 404 })
    }

    // Сначала удаляем связанный Listing
    try {
      await syncVenuePartnerWithListing(parseInt(venuePartnerId))
    } catch (syncError) {
      console.error('Ошибка синхронизации с Listing:', syncError)
    }

    // Удаляем VenuePartner
    await prisma.venuePartner.delete({
      where: { id: parseInt(venuePartnerId) }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Venue partner удален'
    })

  } catch (error) {
    console.error('Error deleting venue partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}