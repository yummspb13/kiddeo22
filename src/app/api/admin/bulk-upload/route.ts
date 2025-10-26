import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Файл не найден'
      }, { status: 400 })
    }

    // Читаем Excel файл
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    let result: any = { success: true, message: '', count: 0, errors: [] }

    if (type === 'events') {
      result = await processEvents(data)
    } else if (type === 'venues') {
      result = await processVenues(data)
    } else {
      return NextResponse.json({
        success: false,
        message: 'Неверный тип данных'
      }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Ошибка при загрузке файла:', error)
    return NextResponse.json({
      success: false,
      message: 'Ошибка при обработке файла',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function processEvents(data: any[]) {
  const errors: string[] = []
  let successCount = 0

  for (const [index, eventData] of data.entries()) {
    try {
      // Проверяем обязательные поля
      if (!eventData.title) {
        errors.push(`Строка ${index + 1}: Отсутствует название мероприятия`)
        continue
      }

      // Проверяем на дубли по названию
      const existingEvent = await prisma.afishaEvent.findFirst({
        where: { title: eventData.title }
      })

      if (existingEvent) {
        errors.push(`Строка ${index + 1}: Мероприятие "${eventData.title}" уже существует`)
        continue
      }

      // Генерируем slug
      let slug = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9а-я\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      // Проверяем уникальность slug
      let counter = 1
      let originalSlug = slug
      while (await prisma.afishaEvent.findUnique({ where: { slug } })) {
        slug = `${originalSlug}-${counter}`
        counter++
      }

      // Парсим ageGroups если это строка
      let ageGroupsArray = null
      if (eventData.ageGroups) {
        try {
          ageGroupsArray = JSON.parse(eventData.ageGroups)
        } catch {
          ageGroupsArray = eventData.ageGroups.split(',').map((g: string) => g.trim())
        }
      }

      // Создаем мероприятие в статусе черновик
      const event = await prisma.afishaEvent.create({
        data: {
          title: eventData.title,
          slug: slug,
          description: eventData.description || null,
          coverImage: eventData.image || null,
          gallery: eventData.gallery || null,
          tickets: eventData.tickets || null,
          venue: eventData.location || '',
          organizer: eventData.organizer || null,
          startDate: eventData.startDate ? new Date(eventData.startDate) : null,
          endDate: eventData.endDate ? new Date(eventData.endDate) : null,
          minPrice: eventData.minPrice || null,
          isPaid: eventData.isPaid || false,
          city: eventData.city || 'Москва',
          citySlug: eventData.citySlug || null,
          categoryName: eventData.category || null,
          categoryId: eventData.categoryId || null,
          coordinates: eventData.coordinates || null,
          ageFrom: eventData.ageFrom || null,
          ageTo: eventData.ageTo || null,
          ageGroups: ageGroupsArray ? JSON.stringify(ageGroupsArray) : null,
          isPopular: eventData.isPopular || false,
          isPromoted: eventData.isPromoted || false,
          priority: eventData.priority || 5,
          status: 'draft', // Добавляем в черновики
          order: eventData.order || 0,
          quickFilterIds: eventData.quickFilterIds || null,
          richDescription: eventData.richDescription || null,
          viewCount: 0,
          searchText: `${eventData.title} ${eventData.description || ''} ${eventData.location || ''}`.toLowerCase(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      // Создаем типы билетов, если они есть
      const ticketTypes = [
        { name: eventData.ticketName1, price: eventData.ticketPrice1, currency: eventData.ticketCurrency1 },
        { name: eventData.ticketName2, price: eventData.ticketPrice2, currency: eventData.ticketCurrency2 },
        { name: eventData.ticketName3, price: eventData.ticketPrice3, currency: eventData.ticketCurrency3 }
      ].filter(ticket => ticket.name && ticket.price)

      for (const ticketType of ticketTypes) {
        await prisma.eventTicketType.create({
          data: {
            eventId: event.id,
            name: ticketType.name!,
            price: ticketType.price!,
            currency: ticketType.currency || 'RUB',
          }
        })
      }

      successCount++

    } catch (error) {
      errors.push(`Строка ${index + 1}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  return {
    success: errors.length === 0,
    message: errors.length === 0 
      ? `Успешно загружено ${successCount} мероприятий в черновики`
      : `Загружено ${successCount} мероприятий, ${errors.length} ошибок`,
    count: successCount,
    errors: errors.slice(0, 10) // Показываем только первые 10 ошибок
  }
}

async function processVenues(data: any[]) {
  const errors: string[] = []
  let successCount = 0

  for (const [index, venueData] of data.entries()) {
    try {
      // Проверяем обязательные поля
      if (!venueData.name) {
        errors.push(`Строка ${index + 1}: Отсутствует название места`)
        continue
      }

      // Проверяем на дубли по названию
      const existingVenue = await prisma.venuePartner.findFirst({
        where: { name: venueData.name }
      })

      if (existingVenue) {
        errors.push(`Строка ${index + 1}: Место "${venueData.name}" уже существует`)
        continue
      }

      // Находим необходимые связи
      const existingVendor = await prisma.vendor.findFirst()
      const existingSubcategory = await prisma.venueSubcategory.findFirst()
      const existingCity = await prisma.city.findFirst()

      if (!existingVendor) {
        errors.push(`Строка ${index + 1}: Не найден vendor в базе данных`)
        continue
      }

      if (!existingSubcategory) {
        errors.push(`Строка ${index + 1}: Не найдена subcategory в базе данных`)
        continue
      }

      if (!existingCity) {
        errors.push(`Строка ${index + 1}: Не найден city в базе данных`)
        continue
      }

      // Парсим координаты
      let lat = null
      let lng = null
      if (venueData.coordinates) {
        const coords = venueData.coordinates.split(',')
        if (coords.length === 2) {
          lat = parseFloat(coords[0].trim())
          lng = parseFloat(coords[1].trim())
        }
      }

      // Генерируем slug
      const slug = venueData.name
        .toLowerCase()
        .replace(/[^a-z0-9а-я\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

      // Создаем место в статусе модерации
      const venue = await prisma.venuePartner.create({
        data: {
          name: venueData.name,
          slug: slug,
          description: venueData.description || null,
          coverImage: venueData.image || null,
          additionalImages: venueData.additionalImages || null,
          address: venueData.location || '',
          district: venueData.district || null,
          metro: venueData.metro || null,
          priceFrom: venueData.priceFrom || null,
          priceTo: venueData.priceTo || null,
          tariff: (venueData.tariff as any) || 'FREE',
          status: 'MODERATION', // Добавляем в модерацию
          moderationReason: 'Загружено через пакетный загрузчик',
          timezone: venueData.timezone || null,
          fiasId: venueData.fiasId || null,
          kladrId: venueData.kladrId || null,
          workingHours: venueData.workingHours || null,
          city: {
            connect: { id: existingCity.id }
          },
          subcategory: {
            connect: { id: existingSubcategory.id }
          },
          vendor: {
            connect: { id: existingVendor.id }
          },
          lat: lat,
          lng: lng,
          ageFrom: venueData.ageFrom || null,
          ageTo: venueData.ageTo || null,
          richDescription: venueData.richDescription || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })

      successCount++

    } catch (error) {
      errors.push(`Строка ${index + 1}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  return {
    success: errors.length === 0,
    message: errors.length === 0 
      ? `Успешно загружено ${successCount} мест в модерацию`
      : `Загружено ${successCount} мест, ${errors.length} ошибок`,
    count: successCount,
    errors: errors.slice(0, 10) // Показываем только первые 10 ошибок
  }
}
