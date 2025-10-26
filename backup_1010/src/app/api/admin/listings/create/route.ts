import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { slugify, generateUniqueSlug, checkListingSlugExists } from '@/lib/slug-utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, slug: providedSlug, cityId, vendorId, type, categoryId, subcategory,
      address, lat, lng, coverImage,
    } = body || {}

    if (!title || !cityId || !vendorId || !type || !categoryId) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 })
    }

    // Автогенерация slug если не предоставлен
    const finalSlug = providedSlug ? 
      await generateUniqueSlug(providedSlug, checkListingSlugExists) :
      await generateUniqueSlug(title, checkListingSlugExists)

    const listing = await prisma.listing.create({
      data: {
        title,
        slug: finalSlug,
        vendorId: Number(vendorId),
        cityId: Number(cityId),
        categoryId: Number(categoryId),
        type,
        bookingMode: 'REQUEST',
        isActive: false, // Черновик
        address: address || null,
        lat: lat ?? null,
        lng: lng ?? null,
        images: coverImage ? JSON.stringify([coverImage]) : null,
        description: subcategory ? `subcat:${subcategory}` : null,
      }
    })

    await prisma.listingModeration.create({
      data: { listingId: listing.id, status: 'DRAFT' as any } as any
    }).catch(()=>{})

    return NextResponse.json({ id: listing.id })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as any)?.message || 'Server error' }, { status: 500 })
  }
}


