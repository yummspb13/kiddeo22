// src/app/api/admin/venue-ads/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    const section = searchParams.get('section') || 'RECOMMENDED'
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Получаем рекламные места для указанной секции
    const venueAds = await prisma.venuePartner.findMany({
      where: {
        status: 'ACTIVE',
        // Пока показываем все активные места (в будущем будет отдельная таблица рекламы)
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        priceFrom: true,
        priceTo: true,
        tariff: true,
        address: true,
        district: true,
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        subcategory: {
          select: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { tariff: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(venueAds)
  } catch (error) {
    console.error('Error fetching venue ads:', error)
    return NextResponse.json({ error: 'Failed to fetch venue ads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { venueId, section, order, isActive, startsAt, endsAt, cityId } = body

    // Обновляем тариф места на SUPER для рекламы
    const updatedVenue = await prisma.venuePartner.update({
      where: { id: venueId },
      data: {
        tariff: 'SUPER',
        updatedAt: new Date()
      }
    })

    // TODO: В будущем здесь будет создание записи в таблице VenueAdPlacement
    // с указанными датами startsAt и endsAt

    return NextResponse.json(updatedVenue)
  } catch (error) {
    console.error('Error creating venue ad:', error)
    return NextResponse.json({ error: 'Failed to create venue ad' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    const venueId = searchParams.get('venueId')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!venueId) {
      return NextResponse.json({ error: 'Venue ID is required' }, { status: 400 })
    }

    // Убираем рекламу - ставим тариф FREE
    const updatedVenue = await prisma.venuePartner.update({
      where: { id: parseInt(venueId) },
      data: {
        tariff: 'FREE',
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedVenue)
  } catch (error) {
    console.error('Error removing venue ad:', error)
    return NextResponse.json({ error: 'Failed to remove venue ad' }, { status: 500 })
  }
}
