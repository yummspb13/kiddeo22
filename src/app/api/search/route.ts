import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 SEARCH API: Starting search request')
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    console.log('🔍 SEARCH API: Request params', { query, city, category, type, page, limit })

    if (!query) {
      console.log('🔍 SEARCH API: No query provided, returning all venues')
      
      // Если нет запроса, но есть тип 'venue', возвращаем все места
      if (type === 'venue') {
        const venues = await prisma.venuePartner.findMany({
          where: {
            status: 'ACTIVE',
            ...(city && { city: { name: city } })
          },
          include: {
            subcategory: {
              select: {
                name: true,
                slug: true
              }
            },
            city: {
              select: {
                name: true,
                slug: true
              }
            }
          },
          take: limit,
          skip: (page - 1) * limit,
          orderBy: {
            createdAt: 'desc'
          }
        })

        const total = await prisma.venuePartner.count({
          where: {
            status: 'ACTIVE',
            ...(city && { city: { name: city } })
          }
        })

        return NextResponse.json({
          query: "",
          city: city || "Москва",
          results: venues,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        })
      }
      
      // Для других типов возвращаем пустой результат
      return NextResponse.json({
        query: "",
        city: city || "Москва",
        results: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      })
    }

    // Поиск по токенизации и синонимам
    console.log('🔍 SEARCH API: Tokenizing query')
    const searchTerms = tokenizeQuery(query)
    console.log('🔍 SEARCH API: Search terms', searchTerms)
    
    // Построение условий поиска
    console.log('🔍 SEARCH API: Building where conditions')
    const whereConditions: any = {
      isActive: true,
      OR: [
        {
          title: {
            contains: query
          }
        },
        {
          description: {
            contains: query
          }
        }
      ]
    }

    // Фильтр по городу
    if (city) {
      (whereConditions as any).city = {
        slug: city
      }
    }

    // Фильтр по категории
    if (category) {
      (whereConditions as any).categoryId = category
    }

    // Фильтр по типу
    if (type) {
      (whereConditions as any).type = type
    }

    // Получаем ID города для поиска
    const cityData = city ? await prisma.city.findUnique({
      where: { slug: city },
      select: { id: true, name: true }
    }) : null

    if (!cityData) {
      return NextResponse.json({
        query,
        city,
        results: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        },
        popularQueries: await getPopularQueries(),
        synonyms: await getSynonyms(query)
      })
    }

    // Параллельный поиск по всем сущностям
    console.log('🔍 SEARCH API: Executing search across all entities')
    const [listings, events, venues, blogPosts, collections] = await Promise.all([
      // Существующий поиск по listings
      prisma.listing.findMany({
        where: whereConditions,
        include: {
          city: {
            select: {
              name: true,
              slug: true
            }
          },
          vendor: {
            select: {
              displayName: true
            }
          },
          ListingTag: {
            include: {
              Interest: {
                select: {
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              Review: true
            }
          }
        },
        orderBy: [
          {
            createdAt: 'desc'
          }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      // Поиск по событиям
      searchEventsForMain(query, cityData.id, city ?? '', type || undefined, page, limit),
      // Поиск по местам
      searchVenuesForMain(query, cityData.id, type || undefined, category ?? undefined, page, limit),
      // Поиск по блогу
      searchBlogPostsForMain(query, cityData.id, type ?? undefined, page, limit),
      // Поиск по подборкам
      searchCollectionsForMain(query, cityData.id, type ?? undefined, page, limit)
    ])

    // Объединяем результаты
    const allResults = [
      ...listings.map(listing => ({
        id: listing.id,
        type: 'listing',
        title: listing.title,
        description: listing.description,
        price: listing.priceFrom,
        image: listing.images?.[0],
        category: listing.categoryId,
        rating: 0,
        reviewsCount: (listing as any)._count?.Review || 0,
        location: listing.cityId,
        vendor: listing.vendorId,
        tags: [],
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      })),
      ...events,
      ...venues,
      ...blogPosts,
      ...collections
    ]

    // Сортируем по релевантности
    const sortedResults = allResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const queryLower = query.toLowerCase()

      // Приоритет: точное совпадение
      if (aTitle === queryLower && bTitle !== queryLower) return -1
      if (bTitle === queryLower && aTitle !== queryLower) return 1

      // Приоритет: начинается с запроса
      if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1
      if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1

      return 0
    })

    // Подсчитываем общее количество
    const totalCount = await Promise.all([
      prisma.listing.count({ where: whereConditions }),
      prisma.afishaEvent.count({ 
        where: { 
          citySlug: cityData.id.toString(),
          status: 'active',
          OR: [
            { title: { contains: query,  } },
            { description: { contains: query,  } },
            { venue: { contains: query,  } },
            { organizer: { contains: query,  } },
            { searchText: { contains: query,  } }
          ]
        }
      }),
      prisma.venuePartner.count({
        where: {
          cityId: cityData.id,
          status: 'ACTIVE',
          OR: [
            { name: { contains: query,  } },
            { description: { contains: query,  } },
            { address: { contains: query,  } },
            { metro: { contains: query,  } },
            { district: { contains: query,  } }
          ]
        }
      }),
      prisma.content.count({
        where: {
          cityId: cityData.id,
          status: { not: 'DRAFT' },
          OR: [
            { title: { contains: query,  } },
            { excerpt: { contains: query,  } },
            { content: { contains: query,  } },
            { seoTitle: { contains: query,  } },
            { seoDescription: { contains: query,  } },
            { seoKeywords: { contains: query,  } }
          ]
        }
      }),
      prisma.collection.count({
        where: {
          city: cityData.id.toString(),
          isActive: true,
          OR: [
            { title: { contains: query,  } },
            { description: { contains: query,  } }
          ]
        }
      })
    ])

    const totalResults = totalCount.reduce((sum, count) => sum + count, 0)

    // Получение популярных запросов
    const popularQueries = await getPopularQueries()

    // Получение синонимов
    const synonyms = await getSynonyms(query)

    return NextResponse.json({
      query,
      city,
      results: sortedResults,
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: Math.ceil(totalResults / limit)
      },
      popularQueries,
      synonyms
    })
  } catch (error) {
    console.error("🔍 SEARCH API: Error occurred:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function tokenizeQuery(query: string): string[] {
  // Простая токенизация - разбиваем по словам и убираем стоп-слова
  const stopWords = ['и', 'или', 'для', 'с', 'в', 'на', 'по', 'от', 'до', 'как', 'что', 'где', 'когда']
  
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => word.replace(/[^\w\s]/g, ''))
    .filter(word => word.length > 0)
}

async function getPopularQueries(): Promise<string[]> {
  // Заглушка для популярных запросов
  // В реальном проекте это будет из аналитики
  return [
    "детские спектакли",
    "мастер-классы для детей",
    "парки развлечений",
    "спортивные секции",
    "творческие кружки",
    "детские праздники",
    "развивающие занятия",
    "музеи для детей"
  ]
}

async function getSynonyms(query: string): Promise<string[]> {
  // Заглушка для синонимов
  // В реальном проекте это будет из базы синонимов
  const synonymMap: Record<string, string[]> = {
    "велосипед": ["велосипеды", "вело", "bike", "bicycle"],
    "театр": ["театральные", "спектакль", "представление", "постановка"],
    "мастер-класс": ["мастер класс", "занятие", "урок", "курс"],
    "парк": ["парки", "аттракционы", "развлечения"],
    "спорт": ["спортивные", "физическая подготовка", "тренировки"],
    "творчество": ["творческие", "рисование", "лепка", "рукоделие"]
  }

  const lowerQuery = query.toLowerCase()
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (lowerQuery.includes(key)) {
      return synonyms
    }
  }

  return []
}

// Функции поиска для основного API

// Поиск по событиям для основного API
async function searchEventsForMain(query: string, cityId: number, citySlug: string, type?: string, page: number = 1, limit: number = 20) {
  if (type && type !== 'event') return []

  const events = await prisma.afishaEvent.findMany({
    where: {
      AND: [
        { status: 'active' },
        {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { venue: { contains: query } },
            { organizer: { contains: query } },
            { searchText: { contains: query } }
          ]
        }
      ]
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
      },
      createdAt: true,
      updatedAt: true
    },
    skip: (page - 1) * limit,
    take: limit
  })

  return events.map(event => ({
    id: event.id,
    type: 'event',
    title: event.title,
    description: event.description,
    price: event.minPrice,
    image: event.coverImage,
    category: event.afishaCategory?.name,
    location: event.venue,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    href: `/event/${event.slug || event.id}`,
    startDateText: event.startDate ? event.startDate.toISOString() : null,
    endDateText: event.endDate ? event.endDate.toISOString() : null
  }))
}

// Поиск по местам для основного API
async function searchVenuesForMain(query: string, cityId: number, type?: string, category?: string, page: number = 1, limit: number = 20) {
  if (type && type !== 'place') return []

  const whereConditions: any = {
    cityId,
    status: 'ACTIVE',
    OR: [
      { name: { contains: query,  } },
      { description: { contains: query,  } },
      { address: { contains: query,  } },
      { metro: { contains: query,  } },
      { district: { contains: query,  } }
    ]
  }

  const venues = await prisma.venuePartner.findMany({
    where: whereConditions,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      address: true,
      metro: true,
      priceFrom: true,
      subcategory: {
        select: {
          name: true
        }
      },
      createdAt: true,
      updatedAt: true
    },
    skip: (page - 1) * limit,
    take: limit
  })

  return venues.map(venue => ({
    id: venue.id.toString(),
    type: 'place',
    title: venue.name,
    description: venue.description,
    price: venue.priceFrom,
    image: venue.coverImage,
    category: venue.subcategory?.name,
    location: venue.address,
    metro: venue.metro,
    createdAt: venue.createdAt,
    updatedAt: venue.updatedAt,
    href: `/city/moskva/venue/${venue.slug}`
  }))
}

// Поиск по блогу для основного API
async function searchBlogPostsForMain(query: string, cityId: number, type?: string, page: number = 1, limit: number = 20) {
  if (type && type !== 'blog') return []

  const posts = await prisma.content.findMany({
    where: {
      AND: [
        { cityId },
        { status: { not: 'DRAFT' } },
        {
          OR: [
            { title: { contains: query,  } },
            { excerpt: { contains: query,  } },
            { content: { contains: query,  } },
            { seoTitle: { contains: query,  } },
            { seoDescription: { contains: query,  } },
            { seoKeywords: { contains: query,  } }
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
      type: true,
      createdAt: true,
      updatedAt: true
    },
    skip: (page - 1) * limit,
    take: limit
  })

  return posts.map(post => ({
    id: post.id.toString(),
    type: 'blog',
    title: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    category: post.type,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    href: `/blog/${post.slug}`
  }))
}

// Поиск по подборкам для основного API
async function searchCollectionsForMain(query: string, cityId: number, type?: string, page: number = 1, limit: number = 20) {
  if (type && type !== 'collection') return []

  const collections = await prisma.collection.findMany({
    where: {
      AND: [
        { city: cityId.toString() },
        { isActive: true },
        {
          OR: [
            { title: { contains: query,  } },
            { description: { contains: query,  } }
          ]
        }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      createdAt: true,
      updatedAt: true
    },
    skip: (page - 1) * limit,
    take: limit
  })

  return collections.map(collection => ({
    id: collection.id,
    type: 'collection',
    title: collection.title,
    description: collection.description,
    image: collection.coverImage,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    href: `/collections/${collection.slug}`
  }))
}
