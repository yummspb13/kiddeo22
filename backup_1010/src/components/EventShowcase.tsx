import EnhancedEventCard from './EnhancedEventCard'
import { headers } from 'next/headers'

interface PopularEvent {
  id: number
  eventId: string
  title: string
  slug: string
  description?: string
  imageUrl?: string
  category?: string
  isActive: boolean
  clickCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  // Дополнительные поля, управляются из админки
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  tickets?: string | null // JSON в БД
  vendorName?: string | null
  coordinatesLat?: number | null
  coordinatesLng?: number | null
}

interface EventShowcaseProps {
  cityId: number
}

export default async function EventShowcase({ cityId }: EventShowcaseProps) {
  // Загружаем активные популярные события ТОЛЬКО из PopularEvent
  let popularEvents: PopularEvent[] = []
  try {
    const qs = new URLSearchParams()
    qs.set('isActive', 'true')
    if (cityId) qs.set('cityId', String(cityId))
    const hdrs = await headers()
    const host = hdrs.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    const response = await fetch(`${baseUrl}/api/admin/popular-events?${qs.toString()}`, {
      cache: 'no-store'
    })
    if (response.ok) {
      const allPopularEvents = await response.json()
      popularEvents = allPopularEvents.filter((event: PopularEvent) => event.isActive).slice(0, 3)
    }
  } catch (error) {
    console.error('Error fetching popular events:', error)
  }

  const events = popularEvents.map((pe) => {
    // Обложка должна быть imageUrl, а галерея — доп. изображения
    let gallery: string[] = []
    try {
      if ((pe as any).images) {
        const parsed = JSON.parse((pe as any).images)
        if (Array.isArray(parsed) && parsed.length > 0) {
          gallery = parsed.filter((u: unknown) => typeof u === 'string')
        }
      }
    } catch {}

    const images: string[] | undefined = (() => {
      const list: string[] = []
      if (pe.imageUrl) list.push(pe.imageUrl)
      for (const url of gallery) {
        if (typeof url === 'string' && url && !list.includes(url)) list.push(url)
      }
      return list.length ? list : undefined
    })()
    // Разбираем билеты из JSON
    let tickets: { id: number; name: string; price: number; description?: string }[] = []
    try {
      if (pe.tickets) {
        const arr = JSON.parse(pe.tickets)
        if (Array.isArray(arr)) {
          tickets = arr.map((t: unknown, idx: number) => ({
            id: idx + 1,
            name: String((t as any)?.name ?? ''),
            price: Number((t as any)?.price ?? 0),
            description: (t as any)?.subtitle ? String((t as any).subtitle) : undefined,
          }))
        }
      }
    } catch {}

    // Слот из дат админки
    const slots = (pe.startDate || pe.endDate)
      ? [{ id: 1, start: pe.startDate ?? pe.endDate!, end: pe.endDate ?? null }]
      : []

    return {
      id: Number(pe.eventId) || pe.id,
      slug: pe.slug,
      title: pe.title,
      description: pe.description ?? undefined,
      images,
      tickets,
      slots,
      category: pe.category ?? undefined,
      viewCount: pe.viewCount ?? 0,
      vendor: pe.vendorName ? { displayName: pe.vendorName } : undefined,
      address: pe.location ?? undefined,
      coordinates: pe.coordinatesLat != null && pe.coordinatesLng != null
        ? { lat: Number(pe.coordinatesLat), lng: Number(pe.coordinatesLng) }
        : undefined,
      popularEventId: pe.id,
    }
  }).filter(Boolean)

  if (events.length === 0) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Популярные мероприятия</h2>
        <p className="text-gray-600">Выберите интересное событие для вашего ребенка</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EnhancedEventCard 
            key={event.id} 
            event={event as any} 
            popularEventId={event.popularEventId}
          />
        ))}
      </div>
    </div>
  )
}
