'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  afishaCategory?: {
    name: string
  }
  createdAt: string
  updatedAt: string
  ageFrom?: number | null
  ageGroups?: string | null
  viewCount?: number | null
  isPaid?: boolean | null
}

interface RecommendedEventsCarouselProps {
  citySlug: string
}

export default function RecommendedEventsCarousel({ citySlug }: RecommendedEventsCarouselProps) {
  const [events, setEvents] = useState<AfishaEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Загружаем случайные события из того же города
  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/events?city=${citySlug}&limit=8&random=true`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Ошибка загрузки рекомендуемых событий:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendedEvents()
  }, [citySlug])

  // Обработчики для свайпа
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (e.currentTarget as HTMLElement).offsetLeft)
    setScrollLeft((e.currentTarget as HTMLElement).scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (e.currentTarget as HTMLElement).offsetLeft
    const walk = (x - startX) * 2
    ;(e.currentTarget as HTMLElement).scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - (e.currentTarget as HTMLElement).offsetLeft)
    setScrollLeft((e.currentTarget as HTMLElement).scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - (e.currentTarget as HTMLElement).offsetLeft
    const walk = (x - startX) * 2
    ;(e.currentTarget as HTMLElement).scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (isLoading) {
    return (
      <section className="mt-8 md:mt-16">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 font-unbounded">Рекомендуем добавить</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[85%] sm:w-[70%] md:w-1/2 lg:w-1/3">
              <div className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return null
  }

  return (
    <section className="mt-8 md:mt-16">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold font-unbounded">Рекомендуем добавить</h2>
        <p className="text-gray-600 text-sm md:text-base font-unbounded mt-1">
          Случайные мероприятия из вашего города
        </p>
      </div>

      {/* Мобильная карусель */}
      <div className="md:hidden -mx-4 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div 
          className="flex gap-4 px-4 snap-x snap-mandatory"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {events.map((event) => (
            <div key={event.id} className="snap-center shrink-0 w-[85%] rounded-3xl overflow-hidden">
              <AfishaEventCard event={event} citySlug={citySlug} />
            </div>
          ))}
        </div>
      </div>

      {/* Десктопная сетка */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.map((event) => (
          <AfishaEventCard key={event.id} event={event} citySlug={citySlug} />
        ))}
      </div>
    </section>
  )
}

// Точная копия ContentCard из HomePageBlock для карточек "Популярные события"
function AfishaEventCard({ event, citySlug = 'moskva' }: { event: AfishaEvent; citySlug?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    // Здесь можно добавить отслеживание кликов для аналитики
    if (event.id) {
      // Отслеживаем клик по событию
      fetch(`/api/events/${event.id}/click`, { method: 'POST' }).catch(console.error)
    }
  }

  const linkHref = `/event/${event.slug || event.id}`

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

  return (
    <Link
      href={linkHref}
      className="group relative shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer md:rounded-3xl overflow-hidden"
      style={{
        animationDelay: `0ms`,
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards'
      }}
      onClick={handleClick}
    >
      {/* Event Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
        
        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300 font-unbounded">
          {event.startDate ? new Date(event.startDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
          }) : 'Скоро'}
        </div>
        
        {/* Category badge */}
        {event.afishaCategory?.name && (
          <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
              {event.afishaCategory.name}
            </span>
          </div>
        )}

        {/* Floating decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

        {/* Text content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
            {event.title}
          </h3>

          {/* Price info */}
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 font-unbounded">
              {getPriceText()}
            </span>
            <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300 font-unbounded">
              билеты от
            </span>
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>

        {/* Кнопка подробнее в центре при наведении */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl text-sm font-semibold hover:bg-white transition-all duration-300 transform group-hover:scale-105 font-unbounded shadow-lg">
            Подробнее
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
