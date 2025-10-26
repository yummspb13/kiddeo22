import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 })
  }

  try {
    const cityMsk = await prisma.city.upsert({
      where: { slug: 'moskva' },
      update: {},
      create: { slug: 'moskva', name: 'Москва', isPublic: true },
    })
    const citySpb = await prisma.city.upsert({
      where: { slug: 'sankt-peterburg' },
      update: {},
      create: { slug: 'sankt-peterburg', name: 'Санкт-Петербург', isPublic: true },
    })

    const catEvents = await prisma.category.upsert({
      where: { slug: 'events' },
      update: {},
      create: { slug: 'events', name: 'Афиша', defaultBookingMode: 'INSTANT' },
    })

    const user = await prisma.user.upsert({
      where: { email: 'vendor@example.com' },
      update: {},
      create: { email: 'vendor@example.com', name: 'Организатор', role: 'VENDOR' },
    })

    const vendor = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: { displayName: 'KidsReview Events', canPostEvents: true, canPostCatalog: false, cityId: cityMsk.id },
      create: { userId: user.id, displayName: 'KidsReview Events', canPostEvents: true, canPostCatalog: false, cityId: cityMsk.id },
    })

    const listingsData = [
      {
        title: 'Волшебное шоу для детей', slug: 'volshebnoye-shou-detey', cityId: cityMsk.id, address: 'ул. Тверская, 12',
        tickets: [
          { name: 'Детский', price: 800 },
          { name: 'Взрослый', price: 1200 },
        ],
        slots: [
          { start: addDays(1, 15), end: addDays(1, 16) },
        ],
      },
      {
        title: 'Научная лаборатория: юные исследователи', slug: 'nauchnaya-laboratoriya-yunye', cityId: cityMsk.id, address: 'пр. Мира, 45',
        tickets: [
          { name: 'Участник', price: 0 },
          { name: 'Набор юного ученого', price: 500 },
        ],
        slots: [
          { start: addDays(2, 10), end: addDays(2, 12) },
          { start: addDays(2, 14), end: addDays(2, 16) },
        ],
      },
      {
        title: 'Семейный концерт: музыкальные истории', slug: 'semeynyy-koncert-muzykalnye', cityId: citySpb.id, address: 'Невский пр., 20',
        tickets: [
          { name: 'Детский', price: 600 },
          { name: 'Взрослый', price: 1000 },
        ],
        slots: [
          { start: addDays(3, 18), end: addDays(3, 19, 30) },
        ],
      },
    ]

    const created: unknown[] = []
    for (const l of listingsData) {
      const listing = await prisma.listing.upsert({
        where: { slug: l.slug },
        update: { title: l.title, address: l.address, isActive: true },
        create: {
          vendorId: vendor.id,
          cityId: l.cityId,
          categoryId: catEvents.id,
          type: 'EVENT',
          bookingMode: 'INSTANT',
          title: l.title,
          slug: l.slug,
          description: null,
          address: l.address,
          isActive: true,
        },
      })

      await prisma.eventTicketType.deleteMany({ where: { listingId: listing.id } })
      await prisma.slot.deleteMany({ where: { listingId: listing.id } })

      await prisma.eventTicketType.createMany({
        data: l.tickets.map((t) => ({ listingId: listing.id, name: t.name, price: t.price })),
      })

      for (const s of l.slots) {
        await prisma.slot.create({ data: { listingId: listing.id, start: s.start, end: s.end, capacity: 50 } })
      }

      created.push({ id: listing.id, slug: listing.slug })
    }

    return NextResponse.json({ ok: true, created })
  } catch (e) {
    return NextResponse.json({ error: 'seed_failed', details: String(e) }, { status: 500 })
  }
}

function addDays(offset: number, hour: number, minute = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  d.setHours(hour, minute, 0, 0)
  return d
}


