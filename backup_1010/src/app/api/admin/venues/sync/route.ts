import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { syncAllActiveVenuePartners, syncVenuePartnerWithListing } from '@/lib/venue-sync'

// POST /api/admin/venues/sync - синхронизация VenuePartner с Listing
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminOrDevKey(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, venuePartnerId } = body

    if (action === 'sync-all') {
      // Синхронизировать все активные VenuePartner
      await syncAllActiveVenuePartners()
      
      return NextResponse.json({
        success: true,
        message: 'Синхронизация всех активных VenuePartner завершена'
      })
    }

    if (action === 'sync-single' && venuePartnerId) {
      // Синхронизировать конкретный VenuePartner
      await syncVenuePartnerWithListing(parseInt(venuePartnerId))
      
      return NextResponse.json({
        success: true,
        message: `Синхронизация VenuePartner ${venuePartnerId} завершена`
      })
    }

    return NextResponse.json({
      error: 'Invalid action or missing venuePartnerId',
      details: 'Use action: "sync-all" or "sync-single" with venuePartnerId'
    }, { status: 400 })

  } catch (error) {
    console.error('Error syncing venues:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/admin/venues/sync - получить статистику синхронизации
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminOrDevKey(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем статистику VenuePartner
    const venuePartnerStats = await prisma.venuePartner.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // Получаем статистику Listing
    const listingStats = await prisma.listing.groupBy({
      by: ['type'],
      where: {
        type: { in: ['VENUE', 'SERVICE'] }
      },
      _count: {
        id: true
      }
    })

    // Получаем активные VenuePartner без Listing
    const activeVenuePartners = await prisma.venuePartner.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        vendorId: true
      }
    })

    const venuePartnerSlugs = activeVenuePartners.map(vp => vp.slug)
    const existingListings = await prisma.listing.findMany({
      where: {
        slug: { in: venuePartnerSlugs },
        type: { in: ['VENUE', 'SERVICE'] }
      },
      select: {
        slug: true,
        vendorId: true
      }
    })

    const existingListingKeys = new Set(
      existingListings.map(l => `${l.slug}-${l.vendorId}`)
    )

    const unsyncedVenuePartners = activeVenuePartners.filter(vp => 
      !existingListingKeys.has(`${vp.slug}-${vp.vendorId}`)
    )

    return NextResponse.json({
      venuePartnerStats: venuePartnerStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id
        return acc
      }, {} as Record<string, number>),
      listingStats: listingStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id
        return acc
      }, {} as Record<string, number>),
      unsyncedCount: unsyncedVenuePartners.length,
      unsyncedVenuePartners: unsyncedVenuePartners.map(vp => ({
        id: vp.id,
        name: vp.name,
        slug: vp.slug
      }))
    })

  } catch (error) {
    console.error('Error getting sync stats:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
