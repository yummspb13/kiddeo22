import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  parseAgesParam,
  prismaWhereOverlapsSelectedBands,
  parsePriceInt,
  parseIntOr,
} from '@/lib/afisha-filters'
import { generateSearchVariants, createSearchConditions } from '@/lib/search-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // базовые
    const city = searchParams.get('city') || 'moskva'
    const status = searchParams.get('status') || 'active'

    // пагинация
    const page = parseIntOr(searchParams.get('page'), 1)
    const perPage = Math.min(parseIntOr(searchParams.get('perPage'), 24), 60)
    const skip = Math.max(0, (page - 1) * (perPage as number))
    const take = perPage as number

    // возраст
    const ageKeys = parseAgesParam(searchParams.get('ages') || searchParams.getAll('ages'))
    const ageWhere = prismaWhereOverlapsSelectedBands(ageKeys)

    // единицы цены
    const UNIT = (process.env.PRICE_UNIT || 'RUB').toUpperCase()
    const U = (n: number) => (UNIT === 'KOP' ? n * 100 : n)

    // корзинки цены
    const priceBucket = searchParams.get('priceBucket') as
      | 'free' | 'to_500' | '500_2000' | '2000_5000' | '10000_plus' | null

    // произвольные min/max (в рублях)
    const priceMinParam = searchParams.get('priceMin')
    const priceMaxParam = searchParams.get('priceMax')
    const priceMinRub = parsePriceInt(priceMinParam ?? undefined)
    const priceMaxRub = parsePriceInt(priceMaxParam ?? undefined)

    // диапазон цены в «единицах хранения»
    let minPriceWhere: any = undefined

    if (priceMinRub != null || priceMaxRub != null) {
      // ручной диапазон
      minPriceWhere = {}
      if (priceMinRub != null) minPriceWhere.gte = U(priceMinRub)
      if (priceMaxRub != null) minPriceWhere.lte = U(priceMaxRub)
    } else if (priceBucket) {
      // предустановленные корзины
      if (priceBucket === 'free') {
        minPriceWhere = 0
      } else if (priceBucket === 'to_500') {
        minPriceWhere = { gte: 1, lte: U(500) }            // 1..500
      } else if (priceBucket === '500_2000') {
        minPriceWhere = { gte: U(500), lte: U(2000) }      // 500..2000
      } else if (priceBucket === '2000_5000') {
        minPriceWhere = { gte: U(2000), lte: U(5000) }     // 2000..5000
      } else if (priceBucket === '10000_plus') {
        minPriceWhere = { gte: U(10000) }                  // 10000+
      }
    }

    // поиск
    const searchQuery = searchParams.get('q')
    console.log('🔍 Search query:', searchQuery)
    
    // даты (опционально)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // сортировки
    const sort = searchParams.get('sort') || 'date_asc'
    const orderBy =
      sort === 'price_asc' ? [{ minPrice: 'asc' as const }, { startDate: 'asc' as const }] :
      sort === 'price_desc' ? [{ minPrice: 'desc' as const }, { startDate: 'asc' as const }] :
      sort === 'date_desc' ? [{ startDate: 'desc' as const }] :
      [{ startDate: 'asc' as const }]

    const where: any = {
      status,
      citySlug: city,
      ...(ageWhere ? ageWhere : {}),
      ...(minPriceWhere !== undefined ? { minPrice: minPriceWhere } : {}),
    }

    // Добавляем простой поиск только по афише (событиям)
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.trim()
      
      console.log('🔍 Search term:', searchTerm)
      
      // Простой поиск только по названию
      where.title = { contains: searchTerm }
    }

    if (dateFrom || dateTo) {
      (where as any).startDate = {}
      if (dateFrom) (where as any).startDate.gte = new Date(dateFrom)
      if (dateTo)   (where as any).startDate.lte = new Date(dateTo)
    }

    const [items, total] = await Promise.all([
      prisma.afishaEvent.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true, title: true, description: true, venue: true, organizer: true, city: true,
          startDate: true, endDate: true,
          ageFrom: true, ageTo: true,
        },
      }),
      prisma.afishaEvent.count({ where }),
    ])

    const pages = Math.max(1, Math.ceil(total / take))
    return NextResponse.json({ ok: true, page, perPage: take, total, pages, items })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as any)?.message || String(e) }, { status: 500 })
  }
}