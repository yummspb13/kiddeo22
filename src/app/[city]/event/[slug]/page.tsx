import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import SimpleEventReviews from '@/components/SimpleEventReviews'
import Gallery from '@/components/Gallery'
import EventTicketCalculator from '@/components/EventTicketCalculator'
import RecommendedEvents from '@/components/RecommendedEvents'
import AdSlot from '@/components/AdSlot'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Users, Star } from 'lucide-react'
import { Unbounded } from 'next/font/google'
import { getMinActivePrice } from '@/lib/price'
import VenueMap from '@/components/VenueMap'
import RichDescriptionRenderer from '@/components/RichDescriptionRenderer'
import EventFavoriteButton from '@/components/EventFavoriteButton'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

// Отключаем кеширование для получения актуальных данных
export const dynamic = 'force-dynamic'

interface EventPageProps {
  params: {
    city: string
    slug: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { city, slug } = await params
  
  // Проверяем существование города
  const cityData = await prisma.city.findUnique({
    where: { slug: city },
    select: { id: true, name: true, isPublic: true },
  })
  if (!cityData || !cityData.isPublic) {
    return notFound()
  }

  const event = await prisma.afishaEvent.findUnique({
    where: {
      slug: slug
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      richDescription: true, // Добавляем richDescription
      venue: true,
      organizer: true,
      startDate: true,
      endDate: true,
      coordinates: true,
      coverImage: true,
      gallery: true,
      tickets: true,
      city: true,
      categoryId: true,
      ageFrom: true,
      ageTo: true,
      ageGroups: true,
      viewCount: true,
      isPopular: true,
      isPaid: true,
      isPromoted: true,
      priority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      afishaCategory: {
        select: {
          name: true,
          slug: true,
          icon: true,
          color: true,
          description: true
        }
      }
    }
  })

  if (!event) {
    return notFound()
  }

  // Проверяем, что событие принадлежит указанному городу
  const eventCityName = event.city === 'Москва' ? 'moscow' : 
                       event.city === 'Санкт-Петербург' ? 'spb' : 
                       event.city?.toLowerCase().replace(/\s+/g, '-')
  
  if (eventCityName !== city) {
    return notFound()
  }

  // Получаем рекомендуемые события
  const recommendedEvents = await prisma.afishaEvent.findMany({
    where: {
      status: 'active',
      city: event.city,
      id: { not: event.id },
      OR: [
        { afishaCategory: { name: event.afishaCategory?.name } },
        { categoryId: event.categoryId }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      startDate: true,
      endDate: true,
      venue: true,
      organizer: true,
      minPrice: true,
      isPaid: true,
      ageFrom: true,
      ageTo: true,
      afishaCategory: {
        select: {
          name: true,
          slug: true
        }
      },
      categoryId: true,
    },
    orderBy: [
      { priority: 'asc' },
      { isPromoted: 'desc' },
      { isPopular: 'desc' },
      { viewCount: 'desc' },
      { startDate: 'asc' }
    ],
    take: 6
  })

  // Форматируем даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const startDate = event.startDate ? new Date(event.startDate) : new Date()
  const endDate = event.endDate ? new Date(event.endDate) : new Date()
  const isSameDay = startDate.toDateString() === endDate.toDateString()

  // Получаем минимальную цену
  const minPrice = getMinActivePrice(event.tickets)

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Главная', href: '/' },
    { name: 'Афиша', href: `/${city}/events` },
    { name: event.title, href: `/${city}/event/${event.slug}` }
  ]

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <a 
                    href={crumb.href} 
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {crumb.name}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                {(event.afishaCategory) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {event.afishaCategory?.name}
                  </span>
                )}
                {event.isPromoted && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    Рекомендуем
                  </span>
                )}
                {event.isPopular && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white">
                    Популярное
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {isSameDay 
                      ? formatDate(startDate)
                      : `${formatDate(startDate)} - ${formatDate(endDate)}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.venue}</span>
                </div>
                {event.organizer && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{event.organizer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Image */}
            {event.coverImage && (
              <div className="mb-8">
                <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Event Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">О мероприятии</h2>
              {event.richDescription ? (
                <RichDescriptionRenderer richDescription={event.richDescription} />
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {event.description || 'Описание мероприятия будет добавлено в ближайшее время.'}
                  </p>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Детали мероприятия</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Дата и время</p>
                    <p className="text-gray-600">
                      {isSameDay 
                        ? `${formatDate(startDate)} в ${formatTime(startDate)}`
                        : `${formatDate(startDate)} - ${formatDate(endDate)}`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Место проведения</p>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>
                
                {(event.ageFrom || event.ageTo) && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Возраст</p>
                      <p className="text-gray-600">
                        {event.ageFrom && event.ageTo 
                          ? `${event.ageFrom}-${event.ageTo} лет`
                          : event.ageFrom 
                            ? `от ${event.ageFrom} лет`
                            : event.ageTo 
                              ? `до ${event.ageTo} лет`
                              : 'Не указан'
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {event.organizer && (
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Организатор</p>
                      <p className="text-gray-600">{event.organizer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Галерея</h3>
                <Gallery images={event.gallery ? (typeof event.gallery === 'string' ? JSON.parse(event.gallery) : event.gallery) : []} />
              </div>
            )}

            {/* Reviews */}
            <div className="mb-8">
              <SimpleEventReviews eventId={event.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Ticket Calculator */}
            <div className="sticky top-8">
              <EventTicketCalculator 
                tickets={JSON.parse(event.tickets || '[]')}
                eventId={event.id}
                eventTitle={event.title}
                eventImage={event.coverImage || undefined}
                eventDate={event.startDate?.toString()}
              />
              
              {/* Favorite Button */}
              <div className="mt-4">
                <EventFavoriteButton event={event as any} />
              </div>

              {/* Venue Map */}
              {event.coordinates && (
                <div className="mt-6">
                  <VenueMap 
                    lat={parseFloat(event.coordinates.split(',')[0])}
                    lng={parseFloat(event.coordinates.split(',')[1])}
                    venueName={event.venue}
                    address={event.venue}
                  />
                </div>
              )}

              {/* Inline Ad */}
              <div className="mt-6">
                <AdSlot position="SIDEBAR" citySlug={city} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Events */}
        {recommendedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Рекомендуемые события</h2>
            <RecommendedEvents events={recommendedEvents as any} />
          </div>
        )}
      </div>
    </div>
  )
}
