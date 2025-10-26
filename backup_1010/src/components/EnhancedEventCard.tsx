'use client'

import Link from 'next/link'
import { MapPin, Calendar, Clock, Users, Star, ExternalLink, Heart, Eye } from 'lucide-react'
import TicketCalculator from './TicketCalculator'
import Image from 'next/image'

type Ticket = {
  id: number
  name: string
  price: unknown
  description?: string
  available?: boolean
}

type Slot = {
  id: number
  start: string | Date
  end?: string | Date | null
}

type EventCard = {
  id: number
  slug: string
  title: string
  description?: string | null
  images?: string[]
  tickets: Ticket[]
  slots: Slot[]
  vendor?: { displayName: string } | null
  address?: string | null
  coordinates?: { lat: number; lng: number }
  category?: string
  ageRange?: { min: number; max: number }
  rating?: number
  reviewsCount?: number
}

/** Безопасный toNumber для Prisma.Decimal/строк/чисел */
function toNumber(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v)
  try { return Number((v as any)?.toString?.() ?? v) } catch { return NaN }
}

/** Формат даты для RU */
function formatDate(d: Date | undefined) {
  if (!d || Number.isNaN(d.getTime())) return undefined
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return d.toISOString()
  }
}

/** Минимальная цена и признак «Бесплатно» */
function getPriceInfo(tickets: Ticket[]) {
  if (!tickets?.length) return { min: undefined as number | undefined, isFree: false }
  const nums = tickets.map(t => toNumber(t.price)).filter(n => Number.isFinite(n)) as number[]
  if (!nums.length) return { min: undefined, isFree: false }
  const min = Math.min(...nums)
  return { min, isFree: min === 0 }
}

/** Берём ближайший слот */
function nextSlot(slots: Slot[]) {
  const first = slots?.[0]
  if (!first) return { start: undefined as Date | undefined, end: undefined as Date | undefined }
  const start = new Date(first.start)
  const end = first.end ? new Date(first.end) : undefined
  return { start, end }
}

export default function EnhancedEventCard({ event, popularEventId }: { event: EventCard & { category?: string; viewCount?: number }; popularEventId?: number }) {
  // Для популярных событий используем /event/[slug], для обычных листингов /listing/[slug]
  const href = popularEventId ? `/event/${event.slug}` : `/listing/${event.slug}`
  const { min, isFree } = getPriceInfo(event.tickets)
  const { start, end } = nextSlot(event.slots)
  const startText = formatDate(start)
  const endText = end ? formatDate(end) : undefined

  // Генерируем Yandex Maps URL
  const mapUrl = event.coordinates 
    ? `https://yandex.ru/maps/?pt=${event.coordinates.lng},${event.coordinates.lat}&z=16&l=map`
    : `https://yandex.ru/maps/?text=${encodeURIComponent(event.address || '')}`

  // Аналитика для популярных мероприятий
  const trackView = () => {
    if (popularEventId) {
      fetch(`/api/admin/popular-events/${popularEventId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' })
      }).catch(() => {})
    }
  }

  const trackClick = () => {
    if (popularEventId) {
      fetch(`/api/admin/popular-events/${popularEventId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      }).catch(() => {})
    }
  }

  return (
    <article 
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={trackView}
    >
      {/* Изображения */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {event.images && event.images.length > 0 ? (
          <Link href={href} className="relative h-full block">
            <Image
              src={event.images[0]}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <div class="text-center text-gray-400">
                        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-sm">Фото скоро появится</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
            {/* Избранное */}
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur p-2 hover:bg-white shadow-sm"
              aria-label="Добавить в избранное"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-4 h-4 text-gray-700 hover:fill-red-500 hover:text-red-500 transition-colors" />
            </button>
          </Link>
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Фото скоро появится</p>
            </div>
          </div>
        )}

        {/* Бейдж цены */}
        <div className="absolute left-3 top-3">
          {isFree ? (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
              Бесплатно
            </span>
          ) : min != null && Number.isFinite(min) ? (
            <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              от {Math.round(min).toLocaleString('ru-RU')} ₽
            </span>
          ) : null}
        </div>

        {/* Раздел (категория) — левый нижний угол */}
        {event.category && (
          <div className="absolute left-3 bottom-3">
            <span className="inline-block px-2 py-1 bg-blue-100/90 text-blue-800 text-xs rounded-full backdrop-blur-sm">
              {event.category}
            </span>
          </div>
        )}

        {/* Счётчик просмотров — правый нижний угол */}
        <div className="absolute right-3 bottom-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs text-gray-800 flex items-center gap-1 shadow-sm">
          <Eye className="w-3.5 h-3.5" />
          <span>{typeof event.viewCount === 'number' ? event.viewCount : 0}</span>
        </div>

        {/* Рейтинг */}
        {event.rating && (
          <div className="absolute right-3 top-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold">{event.rating}</span>
            {event.reviewsCount && (
              <span className="text-xs text-gray-500">({event.reviewsCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-6">
        {/* Заголовок */}
        <div className="mb-3">
          <Link href={href} className="group-hover:text-blue-600 transition-colors">
            <h3 className="text-lg font-bold leading-tight line-clamp-2 mb-1">
              {event.title}
            </h3>
          </Link>
        </div>

        {/* Информация о мероприятии */}
        <div className="space-y-2 mb-4">
          {/* Организатор */}
          {event.vendor?.displayName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.vendor.displayName}</span>
            </div>
          )}

          {/* Дата и время */}
          {startText && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{startText}</span>
              {endText && <span>— {endText}</span>}
            </div>
          )}

          {/* Адрес */}
          {event.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.address}</span>
            </div>
          )}

          {/* Возраст */}
          {event.ageRange && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {event.ageRange.min}-{event.ageRange.max} лет
              </span>
            </div>
          )}
        </div>

        {/* Упрощённый низ без описания/подробностей/карты */}
        {event.tickets && event.tickets.length > 0 && (
          <TicketCalculator
            tickets={event.tickets.map((t) => ({ id: t.id, name: String(t.name || ''), price: toNumber(t.price) }))}
            className="mt-2"
          />
        )}
      </div>
    </article>
  )
}
