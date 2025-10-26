import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
export const runtime = 'nodejs'

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
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        description: true,
        heroImage: true,
        coverImage: true,
        additionalImages: true,
        subcategoryId: true,
        vendorId: true,
        cityId: true,
        tariff: true,
        status: true,
        moderationReason: true,
        priceFrom: true,
        ageFrom: true,
        createdAt: true,
        updatedAt: true,
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
        },
        filters: {
          include: {
            filter: {
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
    console.log('🔍 API PATCH - Starting function')
    console.log('🔍 API PATCH - Request URL:', request.url)
    console.log('🔍 API PATCH - Request method:', request.method)
    const authResult = await requireAdminOrDevKey(request as any)
    console.log('🔍 API PATCH - Auth result:', authResult.success)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const venuePartnerId = id

    if (isNaN(parseInt(venuePartnerId))) {
      return NextResponse.json({ error: 'Invalid venue partner ID' }, { status: 400 })
    }

    console.log('🔍 API PATCH - Parsing JSON body')
    const body = await request.json()
    console.log('🔍 API PATCH - Body parsed successfully')
    const { 
      status, 
      moderationReason, 
      name, 
      address, 
      heroImage, 
      coverImage, 
      subcategoryId, 
      vendorId, 
      cityId, 
      tariff,
      priceFrom,
      ageFrom,
      parameterValues,
      filterValues
    } = body

    console.log('🔍 API PATCH - priceFrom:', priceFrom, 'type:', typeof priceFrom)
    console.log('🔍 API PATCH - parsed priceFrom:', priceFrom !== undefined ? (priceFrom === '' ? null : parseInt(priceFrom)) : 'undefined')

    // Проверяем, что VenuePartner существует
    const existingVenuePartner = await prisma.venuePartner.findUnique({
      where: { id: parseInt(venuePartnerId) }
    })
    
    console.log('🔍 API PATCH - existing partner:', existingVenuePartner?.id, existingVenuePartner?.name)

    if (!existingVenuePartner) {
      return NextResponse.json({ error: 'Venue partner not found' }, { status: 404 })
    }

    // Обновляем VenuePartner
    console.log('🔍 API PATCH - Updating venue partner with data:', {
      priceFrom: priceFrom !== undefined ? (priceFrom === '' ? null : parseInt(priceFrom)) : existingVenuePartner.priceFrom,
      ageFrom: ageFrom !== undefined ? (ageFrom === '' ? null : parseInt(ageFrom)) : existingVenuePartner.ageFrom
    })
    
    const updatedVenuePartner = await prisma.venuePartner.update({
      where: { id: parseInt(venuePartnerId) },
      data: {
        status: status || existingVenuePartner.status,
        moderationReason: moderationReason || existingVenuePartner.moderationReason,
        name: name || existingVenuePartner.name,
        address: address || existingVenuePartner.address,
        heroImage: heroImage || existingVenuePartner.heroImage,
        coverImage: coverImage || existingVenuePartner.coverImage,
        subcategoryId: subcategoryId || existingVenuePartner.subcategoryId,
        vendorId: vendorId || existingVenuePartner.vendorId,
        cityId: cityId || existingVenuePartner.cityId,
        tariff: tariff || existingVenuePartner.tariff,
        priceFrom: priceFrom !== undefined ? (priceFrom === '' ? null : parseInt(priceFrom)) : existingVenuePartner.priceFrom,
        ageFrom: ageFrom !== undefined ? (ageFrom === '' ? null : parseInt(ageFrom)) : existingVenuePartner.ageFrom
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
      // await syncVenuePartnerWithListing(parseInt(venuePartnerId))
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
    console.error('🔍 Error updating venue partner:', error)
    console.error('🔍 Error details:', JSON.stringify(error, null, 2))
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
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
      // await syncVenuePartnerWithListing(parseInt(venuePartnerId))
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