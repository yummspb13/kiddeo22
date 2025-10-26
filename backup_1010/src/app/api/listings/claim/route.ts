import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'

// POST /api/listings/claim - создать заявку на клайм карточки
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listingId, proofType, proofData, venueId } = body

    // Валидация
    if (!listingId || !proofType || !proofData) {
      return NextResponse.json({ 
        error: 'Обязательные поля: listingId, proofType, proofData' 
      }, { status: 400 })
    }

    // Проверяем, что пользователь является вендором
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ 
        error: 'Пользователь не является вендором' 
      }, { status: 400 })
    }

    // Проверяем, что карточка существует и доступна для клайма
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) }
    })

    if (!listing) {
      return NextResponse.json({ 
        error: 'Карточка не найдена' 
      }, { status: 404 })
    }

    if (!listing.claimable) {
      return NextResponse.json({ 
        error: 'Карточка недоступна для клайма' 
      }, { status: 400 })
    }

    // Если указано место, проверяем, что вендор является его владельцем
    if (venueId) {
      const venue = await prisma.venuePartner.findFirst({
        where: {
          id: parseInt(venueId),
          vendorId: vendor.id
        }
      })

      if (!venue) {
        return NextResponse.json({ 
          error: 'Место не найдено или вы не являетесь его владельцем' 
        }, { status: 400 })
      }
    }

    // Проверяем, что вендор не является владельцем карточки
    if (listing.vendorId === vendor.id) {
      return NextResponse.json({ 
        error: 'Вы уже являетесь владельцем этой карточки' 
      }, { status: 400 })
    }

    // Проверяем, нет ли уже активной заявки от этого вендора
    const existingClaim = await prisma.listingClaim.findFirst({
      where: {
        listingId: parseInt(listingId),
        requestorVendorId: vendor.id,
        status: { in: ['PENDING', 'HOLD'] }
      }
    })

    if (existingClaim) {
      return NextResponse.json({ 
        error: 'У вас уже есть активная заявка на эту карточку' 
      }, { status: 400 })
    }

    // Проверяем количество заявок на эту карточку
    const claimsCount = await prisma.listingClaim.count({
      where: {
        listingId: parseInt(listingId),
        status: 'PENDING'
      }
    })

    // Если заявок больше 5, ставим статус HOLD
    const status = claimsCount >= 5 ? 'HOLD' : 'PENDING'

    // Создаем заявку на клайм
    const claim = await prisma.listingClaim.create({
      data: {
        listingId: parseInt(listingId),
        requestorVendorId: vendor.id,
        status,
        proofType,
        proofData: JSON.stringify({
          ...proofData,
          venueId: venueId ? parseInt(venueId) : undefined
        }),
        submittedAt: new Date()
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
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      claim: {
        id: claim.id,
        status: claim.status,
        listing: claim.listing,
        requestorVendor: claim.requestorVendor,
        submittedAt: claim.submittedAt
      }
    })

  } catch (error) {
    console.error('Error creating listing claim:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/listings/claim - получить заявки на клайм
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const status = searchParams.get('status')

    // Проверяем, что пользователь является вендором
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!vendor) {
      return NextResponse.json({ 
        error: 'Пользователь не является вендором' 
      }, { status: 400 })
    }

    const where: any = { requestorVendorId: vendor.id }
    
    if (listingId) {
      where.listingId = parseInt(listingId)
    }
    
    if (status) {
      where.status = status
    }

    const claims = await prisma.listingClaim.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            address: true
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
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({ claims })

  } catch (error) {
    console.error('Error fetching listing claims:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
