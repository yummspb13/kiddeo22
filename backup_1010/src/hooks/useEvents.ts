import { useQuery, useInfiniteQuery } from '@tanstack/react-query'

interface Event {
  id: string
  title: string
  slug: string
  description: string
  startDate: string
  endDate: string
  coverImage?: string
  venue?: string
  isPaid: boolean
  minPrice?: number
  category: string
}

interface InitialData {
  events: Event[]
  categories: any[]
  heroSlot: any
  heroEvents: Event[]
  collections: any[]
  pagination: {
    hasMore: boolean
    nextOffset: number
  }
}

// Хук для начальной загрузки данных
export function useInitialEvents(city: string) {
  return useQuery<InitialData>({
    queryKey: ['initial-events', city],
    queryFn: async () => {
      const response = await fetch(`/api/events/initial?city=${encodeURIComponent(city)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch initial events')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  })
}

// Хук для ленивой загрузки событий с поддержкой фильтров
export function useInfiniteEvents(city: string, filters: Record<string, string | string[]> = {}) {
  // Создаем ключ кеша на основе фильтров
  const queryKey = ['infinite-events', city, filters]
  
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      // Строим URL с параметрами фильтрации
      const params = new URLSearchParams({
        city: city,
        offset: pageParam.toString(),
        limit: '6',
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key, 
            Array.isArray(value) ? value.join(',') : value
          ])
        )
      })
      
      const response = await fetch(`/api/events/load-more?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch more events')
      }
      return response.json()
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Хук для hero событий
export function useHeroEvents(city: string) {
  return useQuery({
    queryKey: ['hero-events', city],
    queryFn: async () => {
      const response = await fetch(`/api/hero-slots?city=${encodeURIComponent(city)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch hero events')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 20 * 60 * 1000, // 20 минут
  })
}

// Хук для коллекций
export function useCollections(city: string) {
  return useQuery({
    queryKey: ['collections', city],
    queryFn: async () => {
      const response = await fetch(`/api/collections?city=${encodeURIComponent(city)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch collections')
      }
      return response.json()
    },
    staleTime: 15 * 60 * 1000, // 15 минут
    gcTime: 30 * 60 * 1000, // 30 минут
  })
}
