import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import SimpleEventReviews from '@/components/SimpleEventReviews'
import Gallery from '@/components/Gallery'
import EventTicketCalculator from '@/components/EventTicketCalculator'
import RecommendedEvents from '@/components/RecommendedEvents'
import { InlineAd } from '@/components/AdSlot'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Users, Star, Heart } from 'lucide-react'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] })

interface EventPageProps {
  params: {
    slug: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await prisma.afishaEvent.findUnique({
    where: {
      slug: slug
    },
    include: {
      afishaCategory: true
    }
  })

  if (!event) {
    notFound()
  }

  // Получаем рекомендуемые события (случайные)
  // Сначала получаем все активные события кроме текущего
  const allEvents = await prisma.afishaEvent.findMany({
    where: {
      id: {
        not: event.id
      },
      status: 'active'
    },
    include: {
      afishaCategory: true
    }
  })

  // Перемешиваем массив случайным образом
  const shuffledEvents = allEvents.sort(() => Math.random() - 0.5)
  
  // Берем первые 6 событий
  const recommendedEvents = shuffledEvents.slice(0, 6)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventDate = (date: Date | null) => {
    if (!date) return 'Дата не указана'
    return new Date(date).toLocaleString('ru-RU', { 
      day: '2-digit', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatEventDateTime = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate) return 'Дата не указана'
    
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null
    
    const startDateStr = start.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'long' 
    })
    const startTimeStr = start.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    if (!end) {
      return `${startDateStr} в ${startTimeStr}`
    }
    
    const endDateStr = end.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'long' 
    })
    const endTimeStr = end.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    // Если даты одинаковые, показываем дату один раз
    if (startDateStr === endDateStr) {
      return `${startDateStr} в ${startTimeStr} - ${endTimeStr}`
    } else {
      return `${startDateStr} в ${startTimeStr} — ${endDateStr} в ${endTimeStr}`
    }
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

  const renderAge = () => {
    try {
      const groups = event.ageGroups
        ? (typeof event.ageGroups === 'string' ? JSON.parse(event.ageGroups) : event.ageGroups)
        : null
      if (Array.isArray(groups) && groups.length > 0) {
        return groups.join(', ')
      }
    } catch {}
    if (typeof event.ageFrom === 'number') {
      return `${event.ageFrom}+ лет`
    }
    return null
  }

  // Подготавливаем галерею изображений
  const galleryImages: string[] = []
  if (event.coverImage) {
    galleryImages.push(event.coverImage)
  }
  if (event.gallery) {
    try {
      const parsed = JSON.parse(event.gallery)
      if (Array.isArray(parsed)) {
        galleryImages.push(...parsed.filter(Boolean))
      }
    } catch {}
  }

  // Подготавливаем билеты
  let tickets: { id: number; name: string; price: number }[] = []
  if (event.tickets) {
    try {
      const parsed = JSON.parse(event.tickets)
      if (Array.isArray(parsed)) {
        tickets = parsed.map((t: any, idx: number) => ({
          id: idx + 1,
          name: t.name || `Билет ${idx + 1}`,
          price: Number(t.price || 0)
        }))
      }
    } catch {}
  }
  
  // Fallback билеты, если нет данных
  if (tickets.length === 0) {
    tickets = [
      { id: 1, name: 'Детский', price: 500 },
      { id: 2, name: 'Взрослый', price: 1000 }
    ]
  }


  // Карта (Yandex)
  const mapUrl = event.venue
    ? `https://yandex.ru/maps/?text=${encodeURIComponent(event.venue)}`
    : undefined
  const mapWidgetUrl = event.venue
    ? `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(event.venue)}`
    : undefined

  return (
    <div className={`${unbounded.className} container py-6 sm:py-8`}>
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500">
        <a href="/city/moskva/cat/events" className="hover:underline">Афиша</a>
        <span className="mx-2">/</span>
        <span>{event.title}</span>
      </div>
      
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="relative">
              <Gallery images={galleryImages.length ? galleryImages : ['/images/event-placeholder.jpg']} variant="slider" />
              <div className="absolute left-3 top-3">
                {getPriceText() === 'Бесплатно' ? (
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">Бесплатно</span>
                ) : (
                  <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{getPriceText()}</span>
                )}
              </div>
              <div className="absolute right-3 top-3">
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-6 rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-unbounded">Описание</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg font-unbounded">{event.description}</div>
            </div>
          )}

          {/* Карта */}
          {mapWidgetUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-8 pb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-unbounded">Локация на карте</h2>
                {event.venue && <div className="mt-1 text-lg text-gray-600 font-unbounded">{event.venue}</div>}
              </div>
              <div className="aspect-[16/9]">
                <iframe title="map" src={mapWidgetUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
              </div>
            </div>
          )}
        </div>

        {/* Tickets / CTA */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border-2 border-gray-100 p-8 bg-white sticky top-20 space-y-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Summary above tickets */}
            <div>
              <div className="text-xl font-bold mb-4 font-unbounded">{event.title}</div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 font-unbounded">Дата и время</div>
                    <div className="text-sm text-gray-600 font-unbounded">
                      {formatEventDateTime(event.startDate, event.endDate)}
                    </div>
                  </div>
                </div>
                {event.venue && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Адрес</div>
                      <div className="text-sm text-gray-600 font-unbounded">
                        {event.venue}
                      </div>
                      {mapUrl && (
                        <div className="mt-1">
                          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-unbounded">На карте</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {renderAge() && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Возраст</div>
                      <div className="text-sm text-gray-600 font-unbounded">{renderAge()}</div>
                    </div>
                  </div>
                )}
                {event.afishaCategory && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Категория</div>
                      <div className="text-sm text-gray-600 font-unbounded">{event.afishaCategory.name}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-lg font-semibold font-unbounded">Билеты</h2>
            {tickets.length === 0 ? (
              <div className="text-sm text-gray-600">Типы билетов пока не добавлены.</div>
            ) : (
              <EventTicketCalculator
                tickets={tickets}
                eventId={event.slug || event.id}
                eventTitle={event.title}
                eventImage={event.coverImage || ''}
                eventDate={formatEventDate(event.startDate)}
                eventLocation={event.venue}
                className="mt-2"
              />
            )}

            {/* Рекламный блок внутри правого блока */}
            <div className="mt-6">
              <div className="bg-gray-200 rounded-lg h-[150px] shadow-lg flex items-center justify-center">
                <InlineAd citySlug="moskva" />
              </div>
            </div>

          </div>
        </aside>
      </section>

      {/* Отзывы */}
      <div className="mt-8 bg-white rounded-2xl border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
        <SimpleEventReviews eventId={event.id} />
      </div>

      {/* Рекомендуемые события */}
      {recommendedEvents.length > 0 && (
        <RecommendedEvents events={recommendedEvents} />
      )}
    </div>
  )
}