import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 SEARCH SUGGESTIONS API: Starting request')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const subcategory = searchParams.get('subcategory')

    console.log('🔍 SEARCH SUGGESTIONS API: Request params', { query, city, type, subcategory })
    console.log('🔍 SEARCH SUGGESTIONS API: Query length:', query?.length)

    if (!query || !city) {
      console.log('🔍 SEARCH SUGGESTIONS API: Missing query or city')
      return NextResponse.json({ suggestions: [] })
    }

    // Получаем ID города
    const cityData = await prisma.city.findUnique({
      where: { slug: city },
      select: { id: true, name: true }
    })

    if (!cityData) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchQuery = query.trim()
    const limitPerType = 3 // Ограничиваем до 3 результатов на тип для suggestions

    // Параллельный поиск по всем сущностям
    console.log('🔍 SEARCH SUGGESTIONS API: Starting parallel search')
    const [events, venues, blogPosts, collections] = await Promise.all([
      // Поиск по событиям
      searchEvents(searchQuery, cityData.id, city, type || undefined, limitPerType),
      // Поиск по местам
      searchVenues(searchQuery, cityData.id, city, type || undefined, subcategory || undefined, limitPerType),
      // Поиск по блогу
      searchBlogPosts(searchQuery, cityData.id, city, type || undefined, limitPerType),
      // Поиск по подборкам
      searchCollections(searchQuery, cityData.id, city, type || undefined, limitPerType)
    ])
    
    console.log('🔍 SEARCH SUGGESTIONS API: Search results:', { events: events.length, venues: venues.length, blogPosts: blogPosts.length, collections: collections.length })

    // Объединяем и сортируем результаты по релевантности
    const allSuggestions = [
      ...events.map(item => ({ ...item, type: 'event' as const })),
      ...venues.map(item => ({ ...item, type: 'place' as const })),
      ...blogPosts.map(item => ({ ...item, type: 'blog' as const })),
      ...collections.map(item => ({ ...item, type: 'collection' as const }))
    ]

    // Сортируем по релевантности (точное совпадение > начало строки > содержит)
    const sortedSuggestions = allSuggestions.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const queryLower = searchQuery.toLowerCase()

      // Приоритет: точное совпадение
      if (aTitle === queryLower && bTitle !== queryLower) return -1
      if (bTitle === queryLower && aTitle !== queryLower) return 1

      // Приоритет: начинается с запроса
      if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1
      if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1

      // Приоритет: содержит запрос
      if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1
      if (bTitle.includes(queryLower) && !aTitle.includes(queryLower)) return 1

      return 0
    })

    console.log('🔍 SEARCH SUGGESTIONS API: Found suggestions', sortedSuggestions.length)
    console.log('🔍 SEARCH SUGGESTIONS API: Events found:', events.length)
    console.log('🔍 SEARCH SUGGESTIONS API: Venues found:', venues.length)
    console.log('🔍 SEARCH SUGGESTIONS API: Blog posts found:', blogPosts.length)
    console.log('🔍 SEARCH SUGGESTIONS API: Collections found:', collections.length)

    return NextResponse.json({ suggestions: sortedSuggestions })
  } catch (error) {
    console.error('🔍 SEARCH SUGGESTIONS API: Error', error)
    return NextResponse.json({ suggestions: [] })
  }
}

// Поиск по событиям
async function searchEvents(query: string, cityId: number, citySlug: string, type?: string | null, limit: number = 3) {
  if (type && type !== 'event') return []

  const events = await prisma.afishaEvent.findMany({
    where: {
      status: 'active'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      venue: true,
      startDate: true,
      endDate: true,
      minPrice: true,
      afishaCategory: {
        select: {
          name: true
        }
      }
    },
    take: limit * 3 // Получаем больше результатов для фильтрации
  })

  // Фильтруем результаты в JavaScript для учета регистра
  const filteredEvents = events.filter(event => {
    const searchLower = query.toLowerCase()
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.venue?.toLowerCase().includes(searchLower)
    )
  }).slice(0, limit) // Ограничиваем до нужного количества

  return filteredEvents.map(event => {
    const startDateText = event.startDate ? event.startDate.toISOString() : null
    const endDateText = event.endDate ? event.endDate.toISOString() : null
    
    console.log('🔍 SEARCH EVENTS: Mapping event', {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      startDateText,
      endDateText
    })
    
    return {
      id: event.id,
      title: event.title,
      slug: event.slug || event.id,
      description: event.description,
      coverImage: event.coverImage,
      location: event.venue,
      price: event.minPrice,
      category: event.afishaCategory?.name,
      startDateText,
      endDateText,
      href: `/event/${event.slug || event.id}`
    }
  })
}

// Поиск по местам
async function searchVenues(query: string, cityId: number, citySlug: string, type?: string | null, subcategory?: string | null, limit: number = 3) {
  console.log('🔍 SEARCH VENUES: Starting search', { query, cityId, type, subcategory, limit })
  
  if (type && type !== 'place') return []

  const whereConditions: any = {
    cityId,
    status: 'ACTIVE'
  }
  
  console.log('🔍 SEARCH VENUES: Where conditions', whereConditions)

  // Фильтр по подкатегории
  if (subcategory) {
    const subcategoryData = await prisma.venueSubcategory.findFirst({
      where: { slug: subcategory },
      select: { id: true }
    })
    if (subcategoryData) {
      whereConditions.subcategoryId = subcategoryData.id
    }
  }

  const venues = await prisma.venuePartner.findMany({
    where: whereConditions,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      priceFrom: true,
      subcategory: {
        select: {
          name: true,
          category: {
            select: {
              name: true
            }
          }
        }
      }
    },
    take: limit
  })

  console.log('🔍 SEARCH VENUES: Found venues before filtering:', venues.length, venues.map(v => v.name))

  // Фильтруем результаты в JavaScript для учета регистра
  const filteredVenues = venues.filter(venue => {
    const searchLower = query.toLowerCase()
    const matches = (
      venue.name.toLowerCase().includes(searchLower) ||
      venue.description?.toLowerCase().includes(searchLower) ||
      venue.address?.toLowerCase().includes(searchLower)
    )
    console.log(`🔍 SEARCH VENUES: Venue "${venue.name}" matches "${query}":`, matches)
    return matches
  })

  console.log('🔍 SEARCH VENUES: Filtered venues:', filteredVenues.length, filteredVenues.map(v => v.name))

  return filteredVenues.map(venue => ({
    id: venue.id.toString(),
    title: venue.name,
    slug: venue.slug,
    description: venue.description,
    coverImage: null, // VenuePartner doesn't have coverImage field in this select
    location: venue.address,
    metro: null, // VenuePartner doesn't have metro field in this select
    price: venue.priceFrom,
    category: venue.subcategory?.category?.name,
    href: `/city/${citySlug}/venue/${venue.slug}`
  }))
}

// Поиск по блогу
async function searchBlogPosts(query: string, cityId: number, citySlug: string, type?: string | null, limit: number = 3) {
  if (type && type !== 'blog') return []

  const posts = await prisma.content.findMany({
    where: {
      AND: [
        { cityId },
        { status: { not: 'DRAFT' } },
            {
              OR: [
                { title: { contains: query } },
                { title: { contains: query.toLowerCase() } },
                { title: { contains: query.toUpperCase() } },
                { excerpt: { contains: query } },
                { excerpt: { contains: query.toLowerCase() } },
                { excerpt: { contains: query.toUpperCase() } },
                { content: { contains: query } },
                { content: { contains: query.toLowerCase() } },
                { content: { contains: query.toUpperCase() } },
                { seoTitle: { contains: query } },
                { seoTitle: { contains: query.toLowerCase() } },
                { seoTitle: { contains: query.toUpperCase() } },
                { seoDescription: { contains: query } },
                { seoDescription: { contains: query.toLowerCase() } },
                { seoDescription: { contains: query.toUpperCase() } },
                { seoKeywords: { contains: query } },
                { seoKeywords: { contains: query.toLowerCase() } },
                { seoKeywords: { contains: query.toUpperCase() } }
              ]
            }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      type: true
    },
    take: limit
  })

  return posts.map(post => ({
    id: post.id.toString(),
    title: post.title,
    slug: post.slug,
    description: post.excerpt,
    coverImage: post.featuredImage,
    category: post.type,
    href: `/blog/${post.slug}`
  }))
}

// Поиск по подборкам
async function searchCollections(query: string, cityId: number, citySlug: string, type?: string | null, limit: number = 3) {
  if (type && type !== 'collection') return []

  const collections = await prisma.collection.findMany({
    where: {
      AND: [
        { city: cityId.toString() }, // Используем city как строку
        { isActive: true },
            {
              OR: [
                { title: { contains: query } },
                { title: { contains: query.toLowerCase() } },
                { title: { contains: query.toUpperCase() } },
                { description: { contains: query } },
                { description: { contains: query.toLowerCase() } },
                { description: { contains: query.toUpperCase() } }
              ]
            }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true
    },
    take: limit
  })

  return collections.map(collection => ({
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    coverImage: collection.coverImage,
    href: `/collections/${collection.slug}`
  }))
}