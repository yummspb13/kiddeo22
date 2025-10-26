'use client'

import { Heart } from 'lucide-react'
import { useFavoritesSimple } from '@/hooks/useFavoritesSimple'

interface EventFavoriteButtonWrapperProps {
  event: {
    id: string
    slug: string
    title: string
    description?: string | null
    coverImage?: string | null
    venue: string
    startDate: Date | string
    endDate?: Date | string
    tickets?: string | null
  }
}

export default function EventFavoriteButtonWrapper({ event }: EventFavoriteButtonWrapperProps) {
  const { isFavorite, toggleFavorite, loading: favoritesLoading } = useFavoritesSimple()
  
  // Проверяем, находится ли событие в избранном
  const isFav = isFavorite(event.slug, 'event')

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Подготавливаем данные события для избранного
    const eventData = {
      title: event.title,
      description: event.description || undefined,
      image: event.coverImage || undefined,
      location: event.venue,
      date: event.startDate ? new Date(event.startDate).toISOString() : undefined,
      endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
      price: event.tickets ? (() => {
        try {
          const tickets = JSON.parse(event.tickets)
          if (Array.isArray(tickets) && tickets.length > 0) {
            const prices = tickets
              .map((t: any) => Number(t?.price ?? 0))
              .filter((n: number) => Number.isFinite(n))
            if (prices.length > 0) {
              const minPrice = Math.min(...prices)
              return minPrice === 0 ? null : minPrice * 100 // Конвертируем в копейки
            }
          }
        } catch {}
        return null
      })() : null,
      currency: 'RUB'
    }
    
    
    toggleFavorite(event.slug, 'event', eventData)
  }

  return (
    <button
      type="button"
      aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={handleToggle}
      aria-pressed={isFav}
      disabled={favoritesLoading}
      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg disabled:opacity-50"
    >
      <Heart className={`w-6 h-6 transition-colors ${isFav ? 'fill-current text-red-500' : 'text-white hover:text-red-400'}`} />
    </button>
  )
}
