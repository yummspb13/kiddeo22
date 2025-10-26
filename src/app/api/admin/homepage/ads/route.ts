import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

const BLOCK_TYPES = [
  'POPULAR_EVENTS',
  'POPULAR_VENUES', 
  'POPULAR_SERVICES',
  'CATEGORIES',
  'COLLECTIONS',
  'RECOMMENDED',
  'NEW_IN_CATALOG',
  'BLOG_POSTS'
] as const

const CONTENT_TYPES = ['EVENT', 'VENUE', 'SERVICE', 'BLOG_POST', 'CATEGORY'] as const

type BlockType = typeof BLOCK_TYPES[number]
type ContentType = typeof CONTENT_TYPES[number]

// GET - получить рекламу для блока и города
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const blockType = searchParams.get('blockType') as BlockType
    const citySlug = searchParams.get('citySlug') || 'moskva'
    const includeExpired = searchParams.get('includeExpired') === 'true'
    
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: searchParams.get('key') }) })

    if (!blockType || !BLOCK_TYPES.includes(blockType)) {
      return NextResponse.json(
        { error: 'Valid blockType is required' },
        { status: 400 }
      )
    }

    const where: any = {
      blockType,
      citySlug
    }

    if (!includeExpired) {
      where.isActive = true
      where.OR = [
        { endsAt: null },
        { endsAt: { gte: new Date() } }
      ]
      // Также проверяем, что если есть startsAt, то он не в будущем
      where.AND = [
        {
          OR: [
            { startsAt: null },
            { startsAt: { lte: new Date() } }
          ]
        }
      ]
    }

    const ads = await prisma.homePageAd.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    // Загружаем детали контента для каждой рекламы
    const adsWithContent = await Promise.all(ads.map(async (ad) => {
      let content = null
      
      try {
        switch (ad.contentType) {
          case 'EVENT':
            content = await prisma.afishaEvent.findUnique({
              where: { id: ad.contentId },
              select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                coverImage: true,
                startDate: true,
                endDate: true,
                venue: true,
                organizer: true,
                minPrice: true,
                city: true
              }
            })
            break
          case 'VENUE':
            content = await prisma.venuePartner.findUnique({
              where: { id: parseInt(ad.contentId) },
              select: {
                id: true,
                name: true,
                description: true,
                coverImage: true,
                address: true,
                district: true,
                metro: true,
                priceFrom: true,
                priceTo: true
              }
            })
            break
          case 'SERVICE':
            content = await prisma.listing.findUnique({
              where: { id: parseInt(ad.contentId) },
              select: {
                id: true,
                title: true,
                description: true,
                images: true,
                priceFrom: true,
                priceTo: true,
                address: true
              }
            })
            break
          case 'BLOG_POST':
            content = await prisma.content.findUnique({
              where: { id: parseInt(ad.contentId) },
              select: {
                id: true,
                title: true,
                excerpt: true,
                featuredImage: true,
                publishedAt: true
              }
            })
            break
          case 'CATEGORY':
            content = await prisma.venueSubcategory.findUnique({
              where: { id: parseInt(ad.contentId) },
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
                _count: {
                  select: {
                    partners: {
                      where: {
                        status: 'ACTIVE',
                        city: {
                          slug: ad.citySlug
                        }
                      }
                    }
                  }
                }
              }
            })
            break
        }
      } catch (error) {
        console.error(`Error fetching content for ad ${ad.id}:`, error)
      }

      return {
        ...ad,
        content: content ? {
          ...content,
          title: content.title || content.name || `Контент ${ad.contentId}`,
          description: content.description || content.excerpt,
          count: content._count?.partners || 0
        } : null
      }
    }))

    return NextResponse.json(adsWithContent)
  } catch (error) {
    console.error('Error fetching homepage ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage ads' },
      { status: 500 }
    )
  }
}

// POST - добавить контент в рекламный блок
export async function POST(request: NextRequest) {
  try {
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: new URL(request.url).searchParams.get('key') }) })

    const body = await request.json()
    const { 
      blockType, 
      citySlug, 
      contentType, 
      contentId, 
      order = 0, 
      isActive = true, 
      startsAt, 
      endsAt, 
      isPaid = false 
    } = body

    if (!BLOCK_TYPES.includes(blockType)) {
      return NextResponse.json(
        { error: 'Invalid block type' },
        { status: 400 }
      )
    }

    if (!CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    // Проверяем, что контент существует
    const contentExists = await checkContentExists(contentType, contentId)
    if (!contentExists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const ad = await prisma.homePageAd.create({
      data: {
        blockType,
        citySlug,
        contentType,
        contentId,
        order,
        isActive,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isPaid
      }
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error creating homepage ad:', error)
    return NextResponse.json(
      { error: 'Failed to create homepage ad' },
      { status: 500 }
    )
  }
}

// PATCH - изменить порядок (drag-and-drop)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: new URL(request.url).searchParams.get('key') }) })

    const body = await request.json()
    const { updates } = body // Array of { id, order?, isActive?, startsAt?, endsAt? }

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      )
    }

    const results = await prisma.$transaction(
      updates.map((update: any) =>
        prisma.homePageAd.update({
          where: { id: update.id },
          data: {
            ...(update.order !== undefined && { order: update.order }),
            ...(update.isActive !== undefined && { isActive: update.isActive }),
            ...(update.startsAt !== undefined && { startsAt: update.startsAt ? new Date(update.startsAt) : null }),
            ...(update.endsAt !== undefined && { endsAt: update.endsAt ? new Date(update.endsAt) : null })
          }
        })
      )
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error updating homepage ads:', error)
    return NextResponse.json(
      { error: 'Failed to update homepage ads' },
      { status: 500 }
    )
  }
}

// DELETE - удалить из блока
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminOrDevKey({ searchParams: Promise.resolve({ key: new URL(request.url).searchParams.get('key') }) })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      )
    }

    await prisma.homePageAd.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting homepage ad:', error)
    return NextResponse.json(
      { error: 'Failed to delete homepage ad' },
      { status: 500 }
    )
  }
}

// Вспомогательная функция для проверки существования контента
async function checkContentExists(contentType: ContentType, contentId: string): Promise<boolean> {
  try {
    switch (contentType) {
      case 'EVENT':
        const event = await prisma.afishaEvent.findUnique({
          where: { id: contentId }
        })
        return !!event

      case 'VENUE':
        const venue = await prisma.venuePartner.findUnique({
          where: { id: parseInt(contentId) }
        })
        return !!venue

      case 'SERVICE':
        const service = await prisma.listing.findUnique({
          where: { id: parseInt(contentId) }
        })
        return !!service

      case 'BLOG_POST':
        const blogPost = await prisma.content.findUnique({
          where: { id: parseInt(contentId) }
        })
        return !!blogPost

      case 'CATEGORY':
        const category = await prisma.venueSubcategory.findUnique({
          where: { id: parseInt(contentId) }
        })
        return !!category

      default:
        return false
    }
  } catch (error) {
    console.error('Error checking content existence:', error)
    return false
  }
}
