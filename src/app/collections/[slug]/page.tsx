import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, MapPin, Clock, Users, Star } from 'lucide-react'
import Image from 'next/image'
import RichTextRenderer from '@/components/RichTextRenderer'
import VenueCollectionCard from '@/components/VenueCollectionCard'
import { Collection, AfishaEvent, Venue } from '@/types/collections'
import { prisma } from '@/lib/db'
import { getMinActivePrice } from '@/lib/price'

async function getCollection(slug: string): Promise<Collection | null> {
  try {
    // Маппинг для совместимости: moscow -> moskva
    const mappedSlug = slug === 'moscow' ? 'moskva' : slug
    
    // Получаем подборку по slug
    const collection = await prisma.collection.findUnique({
      where: { slug: mappedSlug },
      include: {
        eventCollections: {
          include: {
            event: {
              include: {
                afishaCategory: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: [
            { event: { startDate: 'asc' } },
            { event: { createdAt: 'desc' } }
          ]
        },
        venueCollections: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                address: true,
                priceFrom: true,
                priceTo: true,
                coverImage: true,
                status: true,
                tariff: true,
                subcategory: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' }
          ]
        }
      }
    })
    
    if (!collection || !collection.isActive) {
      return null
    }
    
    // Вычисляем минимальную цену для каждого события
    const eventsWithPrice = collection.eventCollections.map(ec => {
      const event = ec.event
      const minPrice = getMinActivePrice(event.tickets, event.isPaid)
      
      return {
        ...ec,
        event: {
          ...event,
          minPrice: minPrice
        }
      }
    })
    
    // Получаем рейтинги для всех мест
    const venueIds = collection.venueCollections.map(vc => vc.venue.id)
    const venueRatings = await prisma.venueReview.groupBy({
      by: ['venueId'],
      where: {
        venueId: { in: venueIds },
        status: 'APPROVED'
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })

    // Создаем мапу рейтингов для быстрого поиска
    const ratingsMap = new Map()
    venueRatings.forEach(rating => {
      ratingsMap.set(rating.venueId, {
        averageRating: rating._avg.rating ? Number(rating._avg.rating.toFixed(1)) : 0,
        reviewsCount: rating._count.id
      })
    })

    // Фильтруем только активные события и места, добавляем рейтинги
    const filteredCollection = {
      ...collection,
      // Преобразуем null в undefined для совместимости с типами
      description: collection.description ?? undefined,
      coverImage: collection.coverImage ?? undefined,
      citySlug: collection.citySlug ?? undefined,
      eventsTitle: collection.eventsTitle ?? undefined,
      eventsDescription: collection.eventsDescription ?? undefined,
      venuesTitle: collection.venuesTitle ?? undefined,
      venuesDescription: collection.venuesDescription ?? undefined,
      // Преобразуем Date в строки
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
      eventCollections: eventsWithPrice.filter(ec => ec.event.status === 'active').map(ec => ({
        ...ec,
        createdAt: ec.createdAt.toISOString(),
        updatedAt: ec.updatedAt.toISOString(),
        event: {
          ...ec.event,
          slug: ec.event.slug ?? '',
          description: ec.event.description ?? undefined,
          organizer: ec.event.organizer ?? undefined,
          coverImage: ec.event.coverImage ?? undefined,
          minPrice: ec.event.minPrice ?? undefined,
          startDate: ec.event.startDate ? ec.event.startDate.toISOString() : new Date().toISOString(),
          endDate: ec.event.endDate ? ec.event.endDate.toISOString() : new Date().toISOString(),
          category: ec.event.afishaCategory ? {
            name: ec.event.afishaCategory.name,
            slug: ec.event.afishaCategory.slug
          } : undefined
        }
      })),
      venueCollections: collection.venueCollections
        .filter(vc => vc.venue.status === 'ACTIVE')
        .map(vc => ({
          ...vc,
          createdAt: vc.createdAt.toISOString(),
          updatedAt: vc.updatedAt.toISOString(),
          venue: {
            ...vc.venue,
            description: vc.venue.description ?? undefined,
            address: vc.venue.address ?? undefined,
            priceFrom: vc.venue.priceFrom ?? undefined,
            priceTo: vc.venue.priceTo ?? undefined,
            coverImage: vc.venue.coverImage ?? undefined,
            tariff: vc.venue.tariff ?? undefined,
            averageRating: ratingsMap.get(vc.venue.id)?.averageRating || 0,
            reviewsCount: ratingsMap.get(vc.venue.id)?.reviewsCount || 0
          }
        }))
    }
    
    return filteredCollection as unknown as Collection
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

  const formatPrice = (price?: number) => {
    if (!price) return 'Цена не указана'
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const hasEvents = collection.eventCollections && collection.eventCollections.length > 0
  const hasVenues = collection.venueCollections && collection.venueCollections.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-end">
        {/* Background Image */}
        <div className="absolute inset-0">
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
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            {/* Back button */}
            <div className="mb-8">
              <Link 
                href={`/${collection.citySlug || 'moscow'}/events`} 
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
              
              {/* Общее описание подборки */}
              {collection.description && (
                <div className="max-w-3xl">
                  <RichTextRenderer 
                    content={collection.description}
                    className="text-xl text-white/90 leading-relaxed font-unbounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
          
          {/* Events Section */}
          {hasEvents && (
            <section className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-unbounded">
                  {collection.eventsTitle || 'События в подборке'}
                </h2>
                {collection.eventsDescription && (
                  <div className="max-w-3xl mx-auto">
                    <RichTextRenderer 
                      content={collection.eventsDescription}
                      className="text-lg text-gray-600 leading-relaxed font-unbounded"
                    />
                  </div>
                )}
              </div>

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
                    animationName: 'fadeInUp',
                    animationDuration: '0.6s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards'
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
                    {event.category?.name && (
                      <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
                          {event.category.name}
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

                      {/* Action button */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 font-unbounded">
                            {formatPrice(event.minPrice)}
                          </span>
                          <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300 font-unbounded">
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
          </section>
        )}

        {/* Venues Section */}
        {hasVenues && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-unbounded">
                {collection.venuesTitle || 'Места в подборке'}
              </h2>
              {collection.venuesDescription && (
                <div className="max-w-3xl mx-auto">
                  <RichTextRenderer 
                    content={collection.venuesDescription}
                    className="text-lg text-gray-600 leading-relaxed font-unbounded"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.venueCollections.map((venueCollection, index) => (
                <VenueCollectionCard
                  key={venueCollection.id}
                  venue={venueCollection.venue}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state if no content */}
        {!hasEvents && !hasVenues && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-unbounded">
              Контент не найден
            </h3>
            <p className="text-gray-600">
              В этой подборке пока нет активных событий или мест
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
