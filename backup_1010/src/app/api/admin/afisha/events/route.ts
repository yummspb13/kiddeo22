import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { slugify, generateUniqueSlug, checkSlugExists } from '@/lib/slug-utils'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.afishaEvent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        eventViews: {
          select: {
            id: true,
            ipAddress: true,
            createdAt: true
          }
        }
      }
    })
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Ошибка загрузки событий' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')

    console.log('POST /api/admin/afisha/events - adminKey:', adminKey)
    console.log('POST /api/admin/afisha/events - ADMIN_KEY:', process.env.ADMIN_KEY)
    console.log('POST /api/admin/afisha/events - ADMIN_DEV_KEY:', process.env.ADMIN_DEV_KEY)

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      console.log('POST /api/admin/afisha/events - Unauthorized, adminKey:', adminKey)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug: providedSlug,
      description,
      venue,
      organizer,
      startDate,
      endDate,
      coordinates,
      order,
      status = 'active',
      coverImage,
      gallery,
      tickets,
      city,
      category,
      ageFrom,
      ageGroups,
      // Новые флаги для единой системы событий
      isPopular = false,
      isPaid = false,
      isPromoted = false,
      priority = 5,
    } = body

    // Автогенерация slug если не предоставлен
    let finalSlug = providedSlug
    if (!finalSlug && title) {
      finalSlug = await generateUniqueSlug(title, checkSlugExists)
    } else if (finalSlug && title) {
      // Проверяем уникальность предоставленного slug
      const baseSlug = slugify(title)
      if (finalSlug !== baseSlug) {
        finalSlug = await generateUniqueSlug(finalSlug, checkSlugExists)
      } else {
        finalSlug = await generateUniqueSlug(title, checkSlugExists)
      }
    }

    const event = await prisma.afishaEvent.create({
      data: {
        title,
        slug: finalSlug,
        description: description || null,
        venue,
        organizer: organizer || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coordinates: coordinates || null,
        order: order || 0,
        status,
        coverImage: coverImage || null,
        gallery: gallery || null,
        tickets: tickets || null,
        city,
        category: category || null,
        ageFrom: ageFrom ?? null,
        ageGroups: Array.isArray(ageGroups) ? JSON.stringify(ageGroups) : (typeof ageGroups === 'string' ? ageGroups : null),
        isPopular,
        isPaid,
        isPromoted,
        priority,
      }
    })

    return NextResponse.json({ 
      id: event.id, 
      slug: event.slug,
      message: 'Событие создано' 
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Ошибка создания события' }, { status: 500 })
  }
}