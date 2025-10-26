import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) {
      // Возвращаем пустой результат для демонстрации
      return NextResponse.json({
        query: "",
        city: city || "Москва",
        results: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        },
        popularQueries: [
          "детские спектакли",
          "мастер-классы для детей",
          "парки развлечений",
          "спортивные секции"
        ],
        synonyms: []
      })
    }

    // Поиск по токенизации и синонимам
    const searchTerms = tokenizeQuery(query)
    
    // Построение условий поиска
    const whereConditions: any = {
      isActive: true,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            some: {
              name: {
                in: searchTerms,
                mode: 'insensitive'
              }
            }
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

    // Выполнение поиска
    const [listings, totalCount] = await Promise.all([
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
          },
          {
            createdAt: 'desc'
          }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.listing.count({
        where: whereConditions
      })
    ])

    // Получение популярных запросов
    const popularQueries = await getPopularQueries()

    // Получение синонимов
    const synonyms = await getSynonyms(query)

    return NextResponse.json({
      query,
      city,
      results: listings.map(listing => ({
        id: listing.id,
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
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      popularQueries,
      synonyms
    })
  } catch (error) {
    console.error("Search error:", error)
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
