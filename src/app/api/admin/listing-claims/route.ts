import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET /api/admin/listing-claims - получить все заявки на клайм
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    await requireAdminOrDevKey(searchParams as any)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [listingClaims, venueClaims, listingCount, venueCount] = await Promise.all([
      prisma.listingClaim.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              address: true,
              vendor: {
                select: {
                  id: true,
                  displayName: true
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
              kycStatus: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.venueClaim.findMany({
        where,
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
              vendor: {
                select: {
                  id: true,
                  displayName: true
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
              kycStatus: true
            }
          },
          moderator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.listingClaim.count({ where }),
      prisma.venueClaim.count({ where })
    ])

    // Объединяем заявки и добавляем тип
    const claims = [
      ...listingClaims.map(claim => ({ ...claim, type: 'listing' })),
      ...venueClaims.map(claim => ({ ...claim, type: 'venue' }))
    ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    const totalCount = listingCount + venueCount

    return NextResponse.json({
      claims,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    })

  } catch (error) {
    console.error('Error fetching listing claims:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
