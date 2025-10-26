// src/app/api/admin/venues/partners/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import { slugify, generateUniqueSlug, checkVenuePartnerSlugExists } from '@/lib/slug-utils'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})
    
    const partners = await prisma.venuePartner.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        description: true,
        coverImage: true,
        // additionalImages: true, // Исключаем для производительности
        subcategoryId: true,
        vendorId: true,
        cityId: true,
        tariff: true,
        status: true,
        moderationReason: true,
        district: true,
        metro: true,
        lat: true,
        lng: true,
        createdAt: true,
        subcategory: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        vendor: {
          select: {
            id: true,
            displayName: true
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(partners)
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({})
    
    const body = await request.json()
    const { name, address, heroImage, coverImage, subcategoryId, vendorId, tariff, cityId, priceFrom, ageFrom } = body

    // Создаем партнера
    const partner = await prisma.venuePartner.create({
      data: {
        name,
        slug: await generateUniqueSlug(name, checkVenuePartnerSlugExists),
        address,
        // heroImage: heroImage || null,
        coverImage: coverImage || null,
        subcategoryId: parseInt(subcategoryId),
        vendorId: parseInt(vendorId),
        tariff: (tariff as 'FREE' | 'SUPER' | 'MAXIMUM') || 'FREE',
        status: 'MODERATION', // По умолчанию на модерации
        cityId: parseInt(cityId),
        priceFrom: priceFrom !== undefined ? (priceFrom === '' ? null : parseInt(priceFrom)) : null,
        ageFrom: ageFrom !== undefined ? (ageFrom === '' ? null : parseInt(ageFrom)) : null
      },
      include: {
        subcategory: {
          include: {
            category: true
          }
        },
        vendor: true,
        city: true
      }
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'Failed to create partner', details: error.message }, { status: 500 })
  }
}
