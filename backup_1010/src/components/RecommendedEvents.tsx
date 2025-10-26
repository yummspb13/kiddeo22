'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

interface RecommendedEvent {
  id: string
  title: string
  slug: string
  description?: string
  venue: string
  startDate: Date | string
  coverImage?: string
  minPrice?: number
  category?: string
  afishaCategory?: {
    name: string
    slug: string
  } | null
}

interface RecommendedEventsProps {
  events: RecommendedEvent[]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const formatPrice = (price?: number) => {
  if (!price) return 'Бесплатно'
  return `${price.toLocaleString('ru-RU')} ₽`
}

export default function RecommendedEvents({ events }: RecommendedEventsProps) {
  if (!events || events.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 ${unbounded.className}`}>
            Рекомендуем
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-unbounded">
            Другие интересные мероприятия, которые могут вам понравиться
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <Link
              key={event.id}
              href={`/event/${event.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Event Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                {event.coverImage ? (
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
                    <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
                
                {/* Dynamic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
                
                {/* Date badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300 font-unbounded">
                  {formatDate(event.startDate)}
                </div>
                
                {/* Category badge */}
                {(event.category || event.afishaCategory?.name) && (
                  <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
                      {event.afishaCategory?.name || event.category}
                    </span>
                  </div>
                )}

                {/* Hover overlay with action */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                      <ArrowRight className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                {/* Text content over image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
                    {event.title}
                  </h3>

                  {/* Action button */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 font-unbounded">
                        {formatPrice(event.minPrice)}
                      </span>
                      <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300">
                        билеты от
                      </span>
                    </div>
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-all duration-300 transform group-hover:scale-105 font-unbounded">
                      Подробнее
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
