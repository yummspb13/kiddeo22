import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, MapPin, Clock, Users, Star } from 'lucide-react'
import Image from 'next/image'

interface Collection {
  id: string
  title: string
  slug: string
  description?: string
  coverImage?: string
  city: string
  citySlug?: string
  eventCollections: {
    event: AfishaEvent
  }[]
}

interface AfishaEvent {
  id: string
  title: string
  slug: string
  description?: string
  venue: string
  organizer?: string
  startDate: string
  endDate: string
  coverImage?: string
  minPrice?: number
  category?: string
}

async function getCollection(slug: string): Promise<Collection | null> {
  try {
    // Временно отключаем self-fetch для предотвращения бесконечных циклов
    // const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/collections/${slug}`, {
    //   cache: 'no-store'
    // })
    
    // Возвращаем null для предотвращения проблем
    return null;
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = await getCollection(slug)
  
  if (!collection) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price / 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-96 lg:h-[500px] shadow-2xl">
          {collection.coverImage ? (
            <Image
              src={collection.coverImage}
              alt={collection.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            {/* Back button */}
            <div className="mb-8">
              <Link 
                href={`/city/${collection.citySlug || 'moskva'}/cat/events`} 
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-unbounded">Назад к событиям</span>
              </Link>
            </div>

            {/* Collection info */}
            <div className="max-w-4xl">
              {/* Collection badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-500 text-white font-unbounded">
                  ПОДБОРКА
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight font-unbounded">
                {collection.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="text-center mb-12">
                 <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-unbounded">
                   События в подборке
                 </h2>
          {collection.description ? (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-unbounded">
              {collection.description}
            </p>
          ) : (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-unbounded">
              Все мероприятия из подборки "{collection.title}"
            </p>
          )}
        </div>

        {collection.eventCollections.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-unbounded">
              События не найдены
            </h3>
            <p className="text-gray-600">
              В этой подборке пока нет активных событий
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.eventCollections.map((eventCollection, index) => {
              const event = eventCollection.event
              return (
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
                  {event.category && (
                    <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
                        {event.category}
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

                    {/* Progress bar animation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                    </div>
                  </div>
                </div>
              </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
