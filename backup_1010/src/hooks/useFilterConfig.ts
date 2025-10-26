'use client'

import { useState, useEffect } from 'react'

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

interface UseFilterConfigProps {
  scope: FilterScope
  cityId?: number
  categoryId?: number
  subcategoryId?: string
}

// Моковые данные для демонстрации
const mockFilterConfigs: FilterConfig[] = [
  // Основной раздел "Места"
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

  // Категории мест
  {
    id: 9,
    scope: 'VENUE_CATEGORY',
    categoryId: 1, // Мастер-классы
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
    categoryId: 2, // Прочий досуг
    type: 'AMENITIES',
    label: 'Тип развлечения',
    key: 'leisure_type',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { 
      options: ['Зоопарки', 'Театры', 'Аквапарки', 'Фермы', 'Музеи', 'Парки развлечений']
    }
  },
  {
    id: 11,
    scope: 'VENUE_CATEGORY',
    categoryId: 3, // Спорт
    type: 'AMENITIES',
    label: 'Вид спорта',
    key: 'sport_type',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { 
      options: ['Футбол', 'Баскетбол', 'Плавание', 'Теннис', 'Гимнастика', 'Единоборства']
    }
  },

  // Подкатегории мест
  {
    id: 12,
    scope: 'VENUE_SUBCATEGORY',
    categoryId: 2,
    subcategoryId: 'leisure',
    type: 'AMENITIES',
    label: 'Специальные удобства',
    key: 'special_amenities',
    isRequired: false,
    isVisible: true,
    order: 1,
    config: { 
      options: ['Детская площадка', 'Кафе', 'Сувенирный магазин', 'Экскурсии', 'Фотосессии']
    }
  }
]

export function useFilterConfig({ scope, cityId, categoryId, subcategoryId }: UseFilterConfigProps) {
  const [filters, setFilters] = useState<FilterConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoading(true)
        setError(null)

        // Строим URL с параметрами
        const params = new URLSearchParams()
        params.set('scope', scope)
        if (cityId) params.set('cityId', cityId.toString())
        if (categoryId) params.set('categoryId', categoryId.toString())
        if (subcategoryId) params.set('subcategoryId', subcategoryId)

        try {
          const response = await fetch(`/api/admin/filters?${params.toString()}`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          const data = await response.json()
          setFilters(data)
        } catch (apiError) {
          // Fallback к моковым данным
          console.warn('API недоступен, используем моковые данные:', apiError)
          
          const filteredFilters = mockFilterConfigs.filter(filter => {
            if (filter.scope !== scope) return false
            if (cityId && filter.cityId && filter.cityId !== cityId) return false
            if (categoryId && filter.categoryId && filter.categoryId !== categoryId) return false
            if (subcategoryId && filter.subcategoryId && filter.subcategoryId !== subcategoryId) return false
            return true
          })

          setFilters(filteredFilters)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки фильтров')
      } finally {
        setLoading(false)
      }
    }

    loadFilters()
  }, [scope, cityId, categoryId, subcategoryId])

  return {
    filters,
    loading,
    error
  }
}
