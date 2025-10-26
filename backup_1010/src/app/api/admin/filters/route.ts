import { NextRequest, NextResponse } from 'next/server'

// Типы для фильтров
type FilterType = 'SEARCH' | 'DATE_TIME' | 'LOCATION' | 'PRICE' | 'CAPACITY' | 'AREA' | 'RATING' | 'AMENITIES' | 'CUSTOM'
type FilterScope = 'MAIN_VENUES' | 'VENUE_CATEGORY' | 'VENUE_SUBCATEGORY'

interface FilterConfig {
  id: number
  scope: FilterScope
  cityId?: number
  categoryId?: number
  subcategoryId?: string
  type: FilterType
  label: string
  key: string
  isRequired: boolean
  isVisible: boolean
  order: number
  config: unknown
}

// Моковые данные для демонстрации
const mockFilters: FilterConfig[] = [
  {
    id: 1,
    scope: 'MAIN_VENUES',
    type: 'SEARCH',
    label: 'Поиск',
    key: 'search',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { placeholder: 'Название места...' }
  },
  {
    id: 2,
    scope: 'MAIN_VENUES',
    type: 'DATE_TIME',
    label: 'Дата и время праздника',
    key: 'date_time',
    isRequired: false,
    isVisible: true,
    order: 2,
    config: { 
      includeTime: true,
      timeSlots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    }
  },
  {
    id: 3,
    scope: 'MAIN_VENUES',
    type: 'LOCATION',
    label: 'Район',
    key: 'district',
    isRequired: false,
    isVisible: true,
    order: 3,
    config: { 
      options: ['Любой', 'Центральный', 'Адмиралтейский', 'Василеостровский', 'Выборгский', 'Калининский', 'Кировский', 'Колпинский', 'Красногвардейский', 'Красносельский', 'Кронштадтский', 'Курортный', 'Московский', 'Невский', 'Петроградский', 'Петродворцовый', 'Приморский', 'Пушкинский', 'Фрунзенский']
    }
  },
  {
    id: 4,
    scope: 'MAIN_VENUES',
    type: 'PRICE',
    label: 'Цена 1 часа аренды',
    key: 'price',
    isRequired: false,
    isVisible: true,
    order: 4,
    config: { 
      ranges: [
        { label: 'До 1000₽', min: 0, max: 1000 },
        { label: '1000₽ - 2000₽', min: 1000, max: 2000 },
        { label: '2000₽ - 3000₽', min: 2000, max: 3000 },
        { label: 'От 3000₽', min: 3000, max: null }
      ]
    }
  },
  {
    id: 5,
    scope: 'MAIN_VENUES',
    type: 'CAPACITY',
    label: 'Вместимость',
    key: 'capacity',
    isRequired: false,
    isVisible: true,
    order: 5,
    config: { 
      options: ['До 10 человек', '10-20 человек', '20-50 человек', 'От 50 человек']
    }
  },
  {
    id: 6,
    scope: 'MAIN_VENUES',
    type: 'AREA',
    label: 'Площадь (кв.м)',
    key: 'area',
    isRequired: false,
    isVisible: true,
    order: 6,
    config: { 
      options: ['До 30 кв.м', '30-50 кв.м', '50-100 кв.м', 'От 100 кв.м']
    }
  },
  {
    id: 7,
    scope: 'MAIN_VENUES',
    type: 'RATING',
    label: 'Рейтинг по отзывам',
    key: 'rating',
    isRequired: false,
    isVisible: true,
    order: 7,
    config: { 
      options: ['4.5+ звезд', '4.0+ звезд', '3.5+ звезд']
    }
  },
  {
    id: 8,
    scope: 'MAIN_VENUES',
    type: 'AMENITIES',
    label: 'Что еще есть',
    key: 'amenities',
    isRequired: false,
    isVisible: true,
    order: 8,
    config: { 
      options: ['Кухня', 'Посуда', 'Фото зона', 'Парковка', 'Wi-Fi', 'Кондиционер']
    }
  },
  {
    id: 9,
    scope: 'VENUE_CATEGORY',
    categoryId: 1,
    type: 'AMENITIES',
    label: 'Тип мастер-класса',
    key: 'workshop_type',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { 
      options: ['Арт-студии', 'Лепка', 'Творческие классы', 'Рукоделие', 'Рисование']
    }
  },
  {
    id: 10,
    scope: 'VENUE_CATEGORY',
    categoryId: 2,
    type: 'AMENITIES',
    label: 'Тип развлечения',
    key: 'leisure_type',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { 
      options: ['Зоопарки', 'Театры', 'Аквапарки', 'Фермы', 'Музеи', 'Парки развлечений']
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') as FilterScope
    const cityId = searchParams.get('cityId')
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')
    
    // Фильтруем моковые данные
    let filteredFilters = mockFilters
    
    if (scope) {
      filteredFilters = filteredFilters.filter(filter => filter.scope === scope)
    }
    
    if (cityId) {
      const cityIdNum = parseInt(cityId)
      filteredFilters = filteredFilters.filter(filter => 
        !filter.cityId || filter.cityId === cityIdNum
      )
    }
    
    if (categoryId) {
      const categoryIdNum = parseInt(categoryId)
      filteredFilters = filteredFilters.filter(filter => 
        !filter.categoryId || filter.categoryId === categoryIdNum
      )
    }
    
    if (subcategoryId) {
      filteredFilters = filteredFilters.filter(filter => 
        !filter.subcategoryId || filter.subcategoryId === subcategoryId
      )
    }
    
    // Сортируем по порядку
    filteredFilters.sort((a, b) => a.order - b.order)
    
    return NextResponse.json(filteredFilters)
  } catch (error) {
    console.error('Error fetching filters:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // В реальном приложении здесь была бы валидация и сохранение в БД
    console.log('Creating new filter:', body)
    
    // Возвращаем созданный фильтр с новым ID
    const newFilter = {
      ...body,
      id: Date.now(), // Простой способ генерации ID
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json(newFilter, { status: 201 })
  } catch (error) {
    console.error('Error creating filter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // В реальном приложении здесь была бы валидация и обновление в БД
    console.log('Updating filter:', body)
    
    return NextResponse.json(body)
  } catch (error) {
    console.error('Error updating filter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Filter ID is required' },
        { status: 400 }
      )
    }
    
    // В реальном приложении здесь было бы удаление из БД
    console.log('Deleting filter:', id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting filter:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
