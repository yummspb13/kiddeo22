import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// Функция для получения или создания категории афиши и возврата её ID
async function getOrCreateCategoryId(categoryName: string): Promise<number | null> {
  try {
    // Сначала пытаемся найти существующую категорию афиши
    let category = await prisma.afishaCategory.findFirst({
      where: { name: categoryName }
    })
    
    // Если категория не найдена, создаем новую
    if (!category) {
      const slug = categoryName.toLowerCase()
        .replace(/[^a-zа-я0-9\s]/g, '') // Убираем спецсимволы
        .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
        .trim()
      
      category = await prisma.afishaCategory.create({
        data: {
          name: categoryName,
          slug: slug,
          description: `Категория ${categoryName}`,
          isActive: true
        }
      })
      
      console.log(`✅ Created new afisha category: ${categoryName} (slug: ${slug})`)
    }
    
    return category.id
  } catch (error) {
    console.error('❌ Error in getOrCreateCategoryId:', error)
    // Если не удалось создать/найти категорию, возвращаем null
    return null
  }
}

// GET /api/admin/afisha/events/[id] - получить событие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Используем Prisma
    const event = await prisma.afishaEvent.findUnique({
      where: { id: id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching afisha event:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

// PUT /api/admin/afisha/events/[id] - обновить событие
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    console.log('PUT /api/admin/afisha/events/[id] - Body:', body)
    
    const {
      title,
      slug,
      description,
      richDescription,
      venue,
      organizer,
      startDate,
      endDate,
      coordinates,
      order,
      status,
      coverImage,
      gallery,
      tickets,
      city,
      category,
      ageFrom,
      ageGroups,
      // Новые поля для настроек события
      isPopular,
      isPaid,
      isPromoted,
      priority,
      quickFilterIds
    } = body

    // Валидация обязательных полей
    if (!title || !startDate || !endDate || !venue || !city) {
      console.error('Missing required fields:', { title, startDate, endDate, venue, city })
      return NextResponse.json({ error: 'Отсутствуют обязательные поля' }, { status: 400 })
    }

    // Используем Prisma
    const event = await prisma.afishaEvent.update({
      where: { id: id },
      data: {
        title,
        slug: slug || '',
        description: description || null,
        richDescription: richDescription || null,
        venue,
        organizer: organizer || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coordinates: coordinates || null,
        order: order || 0,
        status: status || 'active',
        coverImage: coverImage || null,
        gallery: gallery || null,
        tickets: tickets || null,
        city,
        categoryName: category || null,
        categoryId: category ? await getOrCreateCategoryId(category) : null,
        ageFrom: ageFrom ?? null,
        ageGroups: Array.isArray(ageGroups) ? JSON.stringify(ageGroups) : (typeof ageGroups === 'string' ? ageGroups : null),
        // Новые поля для настроек события
        isPopular: isPopular ?? false,
        isPaid: isPaid ?? false,
        isPromoted: isPromoted ?? false,
        priority: priority ?? 5,
        quickFilterIds: quickFilterIds || null,
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating afisha event:', error)
    return NextResponse.json({ error: `Ошибка сервера: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` }, { status: 500 })
  }
}

// DELETE /api/admin/afisha/events/[id] - удалить событие
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Используем Prisma
    await prisma.afishaEvent.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting afisha event:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}