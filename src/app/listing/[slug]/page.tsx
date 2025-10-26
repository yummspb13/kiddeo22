// Публичная страница детали мероприятия (листинга)
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import BuyButton from './BuyButton'
import TicketCalculator from '@/components/TicketCalculator'
import Gallery from '@/components/Gallery'
import { MapPin, Calendar, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ListingPublicPage({ params }: PageProps) {
  const { slug } = await params

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      vendor: { select: { displayName: true } },
      city: { select: { slug: true, name: true, isPublic: true } },
      category: { select: { slug: true, name: true } },
      tickets: { select: { id: true, name: true, price: true }, orderBy: { price: 'asc' } },
      slots: { select: { id: true, start: true, end: true }, orderBy: { start: 'asc' } },
    },
  })

  if (!listing || !listing.isActive || !listing.city?.isPublic) {
    return notFound()
  }

  // Попробуем подтянуть оверрайды из PopularEvent (админка «Популярные мероприятия»)
  async function getPopularOverride(listingId: number) {
    const row = await prisma.popularEvent.findFirst({
      where: {
        eventId: listingId.toString(),
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    })
    return row || null
  }

  const pe = await getPopularOverride(listing.id)

  // Сливаем данные: админка имеет приоритет
  const title = pe?.title || listing.title
  const description = pe?.description || listing.description || undefined
  const vendorDisplayName = pe?.vendorName || listing.vendor?.displayName || undefined
  const address = pe?.location || listing.address || undefined

  // Даты
  const slots = pe?.startDate || pe?.endDate
    ? [{ id: 1, start: pe.startDate ?? pe.endDate, end: pe.endDate ?? null }]
    : listing.slots
  const nextSlot = slots[0]

  // Билеты
  let tickets: { id: number; name: string; price: number; stock?: number }[] = listing.tickets.map(t => ({
    id: parseInt(t.id),
    name: t.name,
    price: t.price || 0,
    stock: undefined
  }))
  try {
    if (pe?.tickets) {
      const arr = JSON.parse(pe.tickets)
      if (Array.isArray(arr)) {
        tickets = arr.map((t: any, idx: number) => ({ id: idx + 1, name: String(t?.name ?? ''), price: Number(t?.price ?? 0) }))
      }
    }
  } catch {}

  // Изображения: объединяем PopularEvent.imageUrl + PopularEvent.images + Listing.images
  const imagesFromPE: string[] = [pe?.imageUrl]
    .concat(
      pe?.images
        ? (() => {
            try {
              const arr = JSON.parse(pe.images)
              return Array.isArray(arr) ? arr : []
            } catch {
              return []
            }
          })()
        : []
    )
    .filter(Boolean) as string[]

  const imagesFromListing: string[] = (() => {
    try {
      // @ts-ignore DB stores as TEXT
      const raw = (listing as any).images
      if (!raw) return []
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  })()

  const galleryImages = [...new Set([...imagesFromPE, ...imagesFromListing])]

  // Карта (Yandex)
  const mapUrl = pe?.coordinatesLat != null && pe?.coordinatesLng != null
    ? `https://yandex.ru/maps/?pt=${pe.coordinatesLng},${pe.coordinatesLat}&z=16&l=map`
    : address
    ? `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`
    : undefined
  const mapWidgetUrl = pe?.coordinatesLat != null && pe?.coordinatesLng != null
    ? `https://yandex.ru/map-widget/v1/?z=16&ll=${pe.coordinatesLng},${pe.coordinatesLat}&pt=${pe.coordinatesLng},${pe.coordinatesLat},pm2rdm`
    : address
    ? `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}`
    : undefined

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8">
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500">
        <a href={`/${listing.city.slug}/events`} className="hover:underline">Афиша</a>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </div>
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="relative">
              <Gallery images={galleryImages.length ? galleryImages : [pe?.imageUrl].filter(Boolean) as string[]} variant="slider" />
              {(() => {
                const min = tickets && tickets.length ? Math.min(...tickets.map(t => Number(t.price || 0))) : undefined
                if (min === undefined) return null
                return (
                  <div className="absolute left-3 top-3">
                    {min === 0 ? (
                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">Бесплатно</span>
                    ) : (
                      <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">от {min.toLocaleString('ru-RU')} ₽</span>
                    )}
                  </div>
                )
              })()}
            </div>
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-3xl font-bold leading-tight">{title}</h1>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-2">Описание</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</div>
            </div>
          )}
          {mapWidgetUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 bg-white">
              <div className="p-4 sm:p-6 pb-0">
                <h2 className="text-lg font-semibold">Локация на карте</h2>
                {address && <div className="mt-1 text-sm text-gray-600">{address}</div>}
              </div>
              <div className="aspect-[16/9]">
                <iframe title="map" src={mapWidgetUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
              </div>
            </div>
          )}
      </div>

        {/* Tickets / CTA */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 p-5 bg-white sticky top-20 space-y-5">
            {/* Summary above tickets */}
            <div>
              <div className="text-base font-semibold mb-2">{title}</div>
              <div className="space-y-2 text-sm text-gray-700">
                {nextSlot?.start && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <div className="font-medium">Дата и время</div>
                      <div>
                        {new Date(nextSlot.start).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        {nextSlot?.end && (
                          <>
                            <span> — </span>
                            {new Date(nextSlot.end).toLocaleString('ru-RU', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <div className="font-medium">Адрес</div>
                      <div>
                        {address}
                        {mapUrl && (
                          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">на карте</a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-lg font-semibold">Билеты</h2>
            {(!tickets || tickets.length === 0) ? (
              <div className="text-sm text-gray-600">Типы билетов пока не добавлены.</div>
            ) : (
              <TicketCalculator
                tickets={tickets.map((t) => ({ id: t.id, name: t.name, price: Number(t.price || 0) }))}
                hideCheckoutButton
                className="mt-2"
              />
            )}

            <div className="mt-5">
              <BuyButton listingId={listing.id} ticketTypeId={Array.isArray(listing.tickets) ? parseInt(listing.tickets[0]?.id || '0') : undefined} />
            </div>

            {/* Social proof / helpers */}
            <div className="mt-4 text-xs text-gray-500">
              Количество мест ограничено. Оплата защищена.
            </div>
      </div>
        </aside>
      </section>
    </div>
  )
}
