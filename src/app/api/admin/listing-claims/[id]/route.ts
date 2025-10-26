import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// PATCH /api/admin/listing-claims/[id] - обработать заявку на клайм
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdminOrDevKey({})
    const { id } = await params

    const body = await request.json()
    const { action, moderatorNotes } = body // action: 'approve' | 'reject' | 'hold'

    if (!['approve', 'reject', 'hold'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be: approve, reject, or hold' 
      }, { status: 400 })
    }

    // Получаем заявку (сначала пробуем venueClaim, потом listingClaim)
    let claim = await prisma.venueClaim.findUnique({
      where: { id: parseInt(id) },
      include: {
        venue: true,
        requestorVendor: true
      }
    })

    let claimType = 'venue'
    
    if (!claim) {
      claim = await prisma.listingClaim.findUnique({
        where: { id: parseInt(id) },
        include: {
          listing: true,
          requestorVendor: true
        }
      })
      claimType = 'listing'
    }

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.status !== 'PENDING' && claim.status !== 'HOLD') {
      return NextResponse.json({ 
        error: 'Claim is not in pending or hold status' 
      }, { status: 400 })
    }

    let newStatus: 'APPROVED' | 'REJECTED' | 'HOLD' = 'HOLD'
    if (action === 'approve') newStatus = 'APPROVED'
    if (action === 'reject') newStatus = 'REJECTED'

    // Обновляем заявку в зависимости от типа
    let updatedClaim
    if (claimType === 'venue') {
      updatedClaim = await prisma.venueClaim.update({
        where: { id: parseInt(id) },
        data: {
          status: newStatus,
          moderatorId: user.id,
          moderatorNotes,
          reviewedAt: new Date()
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          requestorVendor: {
            select: {
              id: true,
              displayName: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } else {
      updatedClaim = await prisma.listingClaim.update({
        where: { id: parseInt(id) },
        data: {
          status: newStatus,
          moderatorId: user.id,
          moderatorNotes,
          reviewedAt: new Date()
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          requestorVendor: {
            select: {
              id: true,
              displayName: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    }

    // Если заявка одобрена, передаем права на карточку
    if (action === 'approve') {
      if (claimType === 'venue') {
        // Для venue заявок обновляем VenuePartner
        await prisma.venuePartner.update({
          where: { id: claim.venueId },
          data: {
            vendor: {
              connect: { id: claim.requestorVendorId }
            }
          }
        })

        // Отклоняем все остальные заявки на это место
        await prisma.venueClaim.updateMany({
          where: {
            venueId: claim.venueId,
            id: { not: parseInt(id) },
            status: { in: ['PENDING', 'HOLD'] }
          },
          data: {
            status: 'REJECTED',
            moderatorId: user.id,
            moderatorNotes: 'Отклонено: место передано другому вендору',
            reviewedAt: new Date()
          }
        })
      } else {
        // Для listing заявок обновляем Listing
        await prisma.listing.update({
          where: { id: claim.listingId },
          data: {
            vendorId: claim.requestorVendorId,
            claimStatus: 'APPROVED'
          }
        })

        // Отклоняем все остальные заявки на эту карточку
        await prisma.listingClaim.updateMany({
          where: {
            listingId: claim.listingId,
            id: { not: parseInt(id) },
            status: { in: ['PENDING', 'HOLD'] }
          },
          data: {
            status: 'REJECTED',
            moderatorId: user.id,
            moderatorNotes: 'Отклонено: карточка передана другому вендору',
            reviewedAt: new Date()
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      claim: updatedClaim
    })

  } catch (error) {
    console.error('Error processing listing claim:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/admin/listing-claims/[id] - получить детали заявки
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params

    const claim = await prisma.listingClaim.findUnique({
      where: { id: parseInt(id) },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            address: true,
            description: true,
            images: true,
            vendor: {
              select: {
                id: true,
                displayName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        requestorVendor: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phone: true,
            type: true,
            kycStatus: true,
            vendorRole: true
          }
        },
        moderator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json({ claim })

  } catch (error) {
    console.error('Error fetching listing claim details:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
