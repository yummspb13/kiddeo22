import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Простые тестовые данные для поиска
const testData = [
  {
    id: 1,
    title: "Попергай",
    description: "Зоопарк с попугаями",
    city: "moskva",
    category: "Развлечения",
    type: "place",
    price: 500,
    image: null
  },
  {
    id: 2,
    title: "Беби Хауз",
    description: "Детский развлекательный центр",
    city: "moskva", 
    category: "Развлечения",
    type: "place",
    price: 1000,
    image: null
  },
  {
    id: 3,
    title: "Райвола",
    description: "Загородный отель",
    city: "moskva",
    category: "Развлечения", 
    type: "place",
    price: 2000,
    image: null
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 SIMPLE SEARCH API: Starting search request')
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    
    console.log('🔍 SIMPLE SEARCH API: Request params', { query, city, type })

    if (!query) {
      console.log('🔍 SIMPLE SEARCH API: No query provided, returning empty result')
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

    // Простой поиск по тестовым данным
    console.log('🔍 SIMPLE SEARCH API: Searching in test data')
    const results = testData.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                          item.description.toLowerCase().includes(query.toLowerCase())
      const matchesCity = !city || item.city === city
      const matchesType = !type || item.type === type
      
      return matchesQuery && matchesCity && matchesType
    })

    console.log('🔍 SIMPLE SEARCH API: Found results', results.length)

    return NextResponse.json({
      query,
      city: city || "Москва",
      results: results.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        rating: 0,
        reviewsCount: 0,
        location: item.city,
        vendor: 1,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      pagination: {
        page: 1,
        limit: 20,
        total: results.length,
        pages: 1
      },
      popularQueries: [
        "детские спектакли",
        "мастер-классы для детей",
        "парки развлечений", 
        "спортивные секции"
      ],
      synonyms: []
    })
  } catch (error) {
    console.error("🔍 SIMPLE SEARCH API: Error occurred:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
