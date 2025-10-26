"use client"

import { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, Clock, Heart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavoritesSimple } from '@/hooks/useFavoritesSimple'
import { getEventType } from '@/lib/price'

interface AfishaEvent {
  id: number
  title: string
  slug: string
  description?: string
  venue: string
  organizer?: string
  startDate: string
  endDate: string
  coordinates?: string
  order: number
  status: string
  coverImage?: string
  gallery?: string
  tickets?: string
  city: string
  category?: string
  createdAt: string
  updatedAt: string
  ageFrom?: number | null
  ageGroups?: string | null
  viewCount?: number | null
  isPaid?: boolean | null
}

interface AfishaEventCardProps {
  event: AfishaEvent
  citySlug?: string
}

export default function AfishaEventCard({ event, citySlug = 'moskva' }: AfishaEventCardProps) {
  const [views, setViews] = useState<number>(0)
  const [uniqueViews, setUniqueViews] = useState<number>(0)
  const { isFavorite, toggleFavorite, loading: favoritesLoading } = useFavoritesSimple()
  
  // Проверяем, находится ли событие в избранном
  const isFav = isFavorite(event.id.toString(), 'event')

  useEffect(() => {
    let mounted = true
    if (typeof event.viewCount === 'number') {
      setViews(Number(event.viewCount) || 0)
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/afisha/events/${event.id}/view`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (mounted) {
            setViews(Number(data.viewCount) || 0)
            setUniqueViews(Number(data.uniqueViewCount) || 0)
          }
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [event.id, event.viewCount])

  // Обновляем счетчик при изменении viewCount в пропсах
  useEffect(() => {
    if (typeof event.viewCount === 'number') {
      setViews(Number(event.viewCount) || 0)
    }
  }, [event.viewCount])

  // Функция для увеличения счетчика просмотров
  const incrementViewCount = async () => {
    try {
      const res = await fetch(`/api/afisha/events/${event.id}/view`, { 
        method: 'POST',
        cache: 'no-store' 
      })
      if (res.ok) {
        const data = await res.json()
        // Обновляем локальное состояние только если это новый просмотр
        if (!data.alreadyViewed) {
          setViews(prev => prev + 1)
          setUniqueViews(prev => prev + 1)
        } else {
          // Если уже просматривали, обновляем счетчики из ответа
          setViews(data.viewCount)
          setUniqueViews(data.uniqueViewCount)
        }
      }
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  // Получаем URL обложки: сначала coverImage, затем первая из gallery
  let coverUrl: string | undefined = event.coverImage || undefined
  if (!coverUrl && event.gallery) {
    try {
      const parsed = JSON.parse(event.gallery)
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        coverUrl = parsed[0]
      }
    } catch {}
  }

  // Собираем галерею, чтобы показать счётчик изображений поверх
  const imagesCount = (() => {
    const list: string[] = []
    if (event.coverImage) list.push(event.coverImage)
    if (event.gallery) {
      try {
        const parsed = JSON.parse(event.gallery)
        if (Array.isArray(parsed)) {
          for (const u of parsed) if (typeof u === 'string' && !list.includes(u)) list.push(u)
        }
      } catch {}
    }
    return list.length
  })()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriceText = () => {
    if (event.tickets) {
      try {
        const tickets = JSON.parse(event.tickets)
        if (Array.isArray(tickets) && tickets.length > 0) {
          const prices = tickets
            .map((t: any) => Number(t?.price ?? 0))
            .filter((n: number) => Number.isFinite(n))
          if (prices.length === 0) return 'Бесплатно'
          const minPrice = Math.min(...prices)
          return minPrice === 0 ? 'Бесплатно' : `от ${Math.round(minPrice).toLocaleString('ru-RU')} ₽`
        }
      } catch {}
    }
    return 'Бесплатно'
  }

  const getButtonText = () => {
    const eventType = getEventType(event.tickets, event.isPaid)
    switch (eventType) {
      case 'free':
        return 'Посмотреть'
      case 'free-registration':
        return 'Записаться'
      case 'paid':
        return 'Купить'
      default:
        return 'Посмотреть'
    }
  }

  const renderAge = () => {
    // Если есть ageGroups (JSON строка), показываем их, иначе fallback к ageFrom
    try {
      const groups = event.ageGroups
        ? (typeof event.ageGroups === 'string' ? JSON.parse(event.ageGroups) : (event as any).ageGroups)
        : null
      if (Array.isArray(groups) && groups.length > 0) {
        // Маппинг для красивого отображения возрастных групп
        const ageGroupLabels: { [key: string]: string } = {
          '16-plus': '16+',
          'any': 'Любой'
        }
        
        const formattedGroups = groups.map(group => ageGroupLabels[group] || group)
        return formattedGroups.join(', ')
      }
    } catch {}
    if (typeof event.ageFrom === 'number') {
      return `${event.ageFrom}+ лет`
    }
    return null
  }

  return (
    <Link href={`/event/${event.slug || event.id}`} className="group block" onClick={incrementViewCount}>
      <article
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        {/* Изображения в стиле Популярных мероприятий */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Бейдж цены */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {getPriceText()}
            </span>
          </div>

          {/* Бейдж категории поверх фото (левый нижний угол) */}
          {event.category && (
            <div className="absolute left-3 bottom-3">
              <span className="inline-block px-2 py-1 bg-blue-100/90 text-blue-800 text-xs rounded-full backdrop-blur-sm">
                {event.category}
              </span>
            </div>
          )}

          {/* Избранное: сердечко справа сверху */}
          <button
            type="button"
            aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              
              // Подготавливаем данные события для избранного
              const eventData = {
                title: event.title,
                description: event.description,
                image: coverUrl,
                location: event.venue,
                date: formatDate(event.startDate),
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
              
              toggleFavorite(event.id.toString(), 'event', eventData)
            }}
            aria-pressed={isFav}
            disabled={favoritesLoading}
            className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur p-2 hover:bg-white shadow-sm disabled:opacity-50"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:fill-red-500 hover:text-red-500'}`} />
          </button>

          {/* Счётчик просмотров: справа снизу */}
          <div className="absolute right-3 bottom-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs text-gray-800 flex items-center gap-1 shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            <span title={`Уникальных просмотров: ${uniqueViews}`}>{views}</span>
          </div>
        </div>

        {/* Контент в стиле Популярных мероприятий */}
        <div className="" style={{ padding: 'calc(var(--spacing) * 4)' }}>
          {/* Заголовок */}
          <div className="mb-3">
            <h3 className="text-lg font-bold leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
          </div>

          {/* Информация */}
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            {/* Дата */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            {/* Время */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(event.startDate)} — {formatTime(event.endDate)}
              </span>
            </div>
            {/* Локация */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
            {/* Возраст */}
            {renderAge() && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{renderAge()}</span>
              </div>
            )}
          </div>

          {/* Низ карточки: цена и кнопка */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-base font-semibold text-gray-900">{getPriceText()}</div>
            <span className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:opacity-90">
              {getButtonText()}
            </span>
          </div>

        </div>
      </article>
    </Link>
  )
}
