import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type || !['events', 'venues'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Неверный тип данных'
      }, { status: 400 })
    }

    let data: any[] = []
    let filename = ''

    if (type === 'events') {
      data = await exportEvents()
      filename = `events-${new Date().toISOString().slice(0, 10)}.xlsx`
    } else if (type === 'venues') {
      data = await exportVenues()
      filename = `venues-${new Date().toISOString().slice(0, 10)}.xlsx`
    }

    // Создаем Excel файл
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'events' ? 'Events' : 'Venues')
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Ошибка при экспорте данных:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при экспорте данных',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function exportEvents() {
  const events = await prisma.afishaEvent.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      gallery: true,
      tickets: true,
      startDate: true,
      endDate: true,
      venue: true,
      organizer: true,
      minPrice: true,
      isPaid: true,
      city: true,
      citySlug: true,
      categoryName: true,
      categoryId: true,
      coordinates: true,
      ageFrom: true,
      ageTo: true,
      ageGroups: true,
      isPopular: true,
      isPromoted: true,
      priority: true,
      status: true,
      order: true,
      quickFilterIds: true,
      richDescription: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  // Преобразуем данные для Excel
  return events.map(event => ({
    title: event.title,
    description: event.description,
    image: event.coverImage,
    gallery: event.gallery,
    tickets: event.tickets,
    startDate: event.startDate ? event.startDate.toISOString() : null,
    endDate: event.endDate ? event.endDate.toISOString() : null,
    location: event.venue,
    organizer: event.organizer,
    minPrice: event.minPrice,
    isPaid: event.isPaid,
    city: event.city,
    citySlug: event.citySlug,
    category: event.categoryName,
    categoryId: event.categoryId,
    coordinates: event.coordinates,
    ageFrom: event.ageFrom,
    ageTo: event.ageTo,
    ageGroups: event.ageGroups,
    isPopular: event.isPopular,
    isPromoted: event.isPromoted,
    priority: event.priority,
    status: event.status,
    order: event.order,
    quickFilterIds: event.quickFilterIds,
    richDescription: event.richDescription,
    createdAt: event.createdAt ? event.createdAt.toISOString() : null,
    updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
  }))
}

async function exportVenues() {
  const venues = await prisma.venuePartner.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      coverImage: true,
      additionalImages: true,
      address: true,
      district: true,
      metro: true,
      priceFrom: true,
      priceTo: true,
      tariff: true,
      status: true,
      moderationReason: true,
      timezone: true,
      fiasId: true,
      kladrId: true,
      workingHours: true,
      lat: true,
      lng: true,
      ageFrom: true,
      ageTo: true,
      richDescription: true,
      createdAt: true,
      updatedAt: true,
      city: {
        select: {
          name: true,
          slug: true,
        }
      },
      subcategory: {
        select: {
          name: true,
          slug: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Преобразуем данные для Excel
  return venues.map(venue => ({
    name: venue.name,
    description: venue.description,
    image: venue.coverImage,
    additionalImages: venue.additionalImages,
    location: venue.address,
    district: venue.district,
    metro: venue.metro,
    priceFrom: venue.priceFrom,
    priceTo: venue.priceTo,
    city: venue.city.name,
    citySlug: venue.city.slug,
    subcategory: venue.subcategory.name,
    coordinates: venue.lat && venue.lng ? `${venue.lat},${venue.lng}` : null,
    ageFrom: venue.ageFrom,
    ageTo: venue.ageTo,
    tariff: venue.tariff,
    status: venue.status,
    moderationReason: venue.moderationReason,
    timezone: venue.timezone,
    fiasId: venue.fiasId,
    kladrId: venue.kladrId,
    workingHours: venue.workingHours,
    richDescription: venue.richDescription,
    createdAt: venue.createdAt ? venue.createdAt.toISOString() : null,
    updatedAt: venue.updatedAt ? venue.updatedAt.toISOString() : null,
  }))
}
