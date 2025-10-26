import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getMinActivePrice, inRange } from '@/lib/price'
import { parseCsvParam, str as sstr } from '@/lib/query'
import { ageBuckets, priceBuckets } from '@/config/afishaFilters'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citySlug = searchParams.get('city')
    
    if (!citySlug) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    // Получаем город по slug
    const cityRecord = await prisma.city.findUnique({
      where: { slug: citySlug },
      select: { name: true }
    })

    if (!cityRecord) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 })
    }

    const city = cityRecord.name

    const where: any = {
      status: 'active',
      city: city
    }

    // Проверяем параметр random
    const isRandom = searchParams.get('random') === 'true'

    // Поиск
    const q = sstr(searchParams.get('q'))
    if (q) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { venue: { contains: q } },
            { organizer: { contains: q } },
          ]
        }
      ]
    }

    // Даты
    const dateFromS = sstr(searchParams.get('dateFrom'))
    const dateToS = sstr(searchParams.get('dateTo'))

    if (dateFromS && dateToS) {
      const dateFrom = new Date(dateFromS + 'T00:00:00.000Z')
      const dateTo = new Date(dateToS + 'T23:59:59.999Z')

      where.AND = [
        ...(where.AND || []),
        {
          AND: [
            { startDate: { lte: dateTo } },
            { endDate: { gte: dateFrom } }
          ]
        }
      ]
    } else if (dateFromS) {
      const dateFrom = new Date(dateFromS)
      where.AND = [
        ...(where.AND || []),
        { endDate: { gte: dateFrom } }
      ]
    } else {
      const now = new Date()
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { startDate: { gte: now } },
            { endDate: { gte: now } }
          ]
        }
      ]
    }

    // Фильтр по бесплатным событиям - убираем из where, будем фильтровать на клиенте
    const isFreeFilter = sstr(searchParams.get('free')) === '1'

    // Фильтр по категориям
    const categoriesParam = sstr(searchParams.get('categories'))
    if (categoriesParam) {
      const selectedCategories = categoriesParam.split(',')
      where.AND = [
        ...(where.AND || []),
        { 
          afishaCategory: {
            name: { in: selectedCategories }
          }
        }
      ]
    }

    // Фильтр по быстрым фильтрам
    const quickFiltersParam = sstr(searchParams.get('quickFilters'))
    if (quickFiltersParam) {
      const quickFilterIds = quickFiltersParam.split(',').map(Number).filter(Boolean)
      if (quickFilterIds.length > 0) {
        where.AND = [
          ...(where.AND || []),
          {
            OR: quickFilterIds.map(id => ({
              quickFilterIds: { contains: `[${id}]` }
            }))
          }
        ]
      }
    }

    // Фильтр по возрасту
    const ageParam = sstr(searchParams.get('age'))
    const selectedAgeSlugs = ageParam ? ageParam.split(',').map(s => s.trim()).filter(Boolean) : []
    if (selectedAgeSlugs.length > 0) {
      const selectedAgeRanges = ageBuckets.filter(b => selectedAgeSlugs.includes(b.slug)).map(b => b.range)
      
      if (selectedAgeRanges.length > 0) {
        const ageOr = selectedAgeRanges.map(r => {
          const min = r.min ?? 0
          const max = r.max // Не заменяем null на 99, чтобы проверка работала

          const ageGroupStrings: string[] = []
          if (min === 0 && max === 3) ageGroupStrings.push('0-3')
          if (min === 4 && max === 7) ageGroupStrings.push('4-7')
          if (min === 8 && max === 12) ageGroupStrings.push('8-12')
          if (min === 13 && max === 16) ageGroupStrings.push('13-16')
          if (min === 16 && max === null) ageGroupStrings.push('16-plus')

          if (ageGroupStrings.length > 0) {
            return {
              OR: [
                // Ищем точные совпадения групп (с кавычками в JSON)
                ...ageGroupStrings.map(group => ({
                  ageGroups: { contains: `"${group}"` }
                })),
                // Также ищем без кавычек (на всякий случай)
                ...ageGroupStrings.map(group => ({
                  ageGroups: { contains: group }
                })),
                // Для 16+ ищем также "16-plus" без кавычек
                ...ageGroupStrings.filter(group => group === '16-plus').map(group => ({
                  ageGroups: { contains: '16-plus' }
                })),
                // Также ищем события с "any" (любой возраст)
                { ageGroups: { contains: "any" } }
              ]
            }
          }

          return { id: { equals: 'never-match' } }
        })
        where.AND = [...(where.AND || []), { OR: ageOr }]
      }
    }

    // Сортировка
    const sortBy = sstr(searchParams.get('sortBy')) || 'smart'
    let orderBy: any = { createdAt: 'desc' }
    
    // Если запрашивается случайная сортировка, используем её
    if (isRandom) {
      orderBy = { id: 'asc' } // Используем id для стабильной сортировки, затем перемешаем
    } else {
      switch (sortBy) {
        case 'date':
          orderBy = { startDate: 'asc' }
          break
        case 'price':
          orderBy = { minPrice: 'asc' }
          break
        case 'popularity':
          orderBy = { viewCount: 'desc' }
          break
        case 'newest':
          orderBy = { createdAt: 'desc' }
          break
        case 'smart':
          // Умная сортировка: приоритет, популярность, дата
          orderBy = [
            { priority: 'asc' },      // Сначала по приоритету (меньше = выше)
            { isPromoted: 'desc' },   // Продвигаемые события
            { isPopular: 'desc' },    // Популярные события
            { viewCount: 'desc' },    // По количеству просмотров
            { startDate: 'asc' }      // По дате начала
          ]
          break
        default:
          orderBy = { startDate: 'asc' }
      }
    }

    // Загружаем события
    let events = await prisma.afishaEvent.findMany({
      where,
      orderBy,
      select: {
        id: true, title: true, slug: true, description: true, venue: true, organizer: true,
        startDate: true, endDate: true, coordinates: true, order: true, status: true,
        coverImage: true, gallery: true, tickets: true, city: true, minPrice: true,
        afishaCategory: {
          select: {
            name: true
          }
        },
        categoryId: true, createdAt: true, updatedAt: true, ageFrom: true, ageTo: true,
        ageGroups: true, viewCount: true, isPopular: true, isPaid: true, isPromoted: true, priority: true,
        quickFilterIds: true
      }
    })

    // Если запрашивается случайная сортировка, перемешиваем массив
    if (isRandom) {
      events = events.sort(() => Math.random() - 0.5)
    }

    // Фильтрация по цене на клиенте
    const priceParam = sstr(searchParams.get('price'))
    const selectedPriceSlugs = priceParam ? priceParam.split(',').map(s => s.trim()).filter(Boolean) : []
    
    // Сначала применяем фильтр "Бесплатно" если он активен
    if (isFreeFilter) {
      events = events.filter(e => {
        const p = getMinActivePrice(e.tickets, e.isPaid)
        return p === 0
      })
    }
    
    // Затем применяем фильтры по ценовым диапазонам
    if (selectedPriceSlugs.length > 0) {
      const selectedPriceRanges = priceBuckets.filter(b => selectedPriceSlugs.includes(b.slug)).map(b => b.range)
      
      events = events.filter(e => {
        const p = getMinActivePrice(e.tickets, e.isPaid)
        
        // Если фильтр "Бесплатно" активен, показываем только бесплатные события
        if (selectedPriceSlugs.includes('free')) {
          return p === 0
        }
        
        // Бесплатные события (p === 0) НЕ попадают в платные диапазоны
        if (p === 0) {
          return false
        }
        if (p == null) return false
        return selectedPriceRanges.some(r => inRange(p, r))
      })
    }

    // Пагинация
    const page = parseInt(sstr(searchParams.get('page')) || '1')
    const limit = 20
    const totalEvents = events.length
    const totalPages = Math.ceil(totalEvents / limit)
    const paginatedEvents = events.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      events: paginatedEvents,
      pagination: {
        page,
        totalPages,
        hasMore: page < totalPages,
        totalEvents
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
