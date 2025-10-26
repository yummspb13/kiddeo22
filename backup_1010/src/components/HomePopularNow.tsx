import prisma from '@/lib/db'
import AfishaEventCard from '@/components/AfishaEventCard'

type Props = {
  citySlug: string
  cityName: string
}

function nowIso() {
  return new Date().toISOString()
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default async function HomePopularNow({ citySlug, cityName }: Props) {
  const cityNameRu = citySlug === 'moskva' ? 'Москва' : citySlug === 'spb' ? 'Санкт-Петербург' : cityName
  const iso = nowIso()

  // 1) Активные PopularEvent (без дат в запросе — в некоторых рядах могут быть невалидные даты)
  const popular = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, eventId, title, slug, description, imageUrl, category, isActive,
            clickCount, viewCount,
            CAST(createdAt AS TEXT) AS createdAtText,
            CAST(updatedAt AS TEXT) AS updatedAtText,
            location,
            CAST(startDate AS TEXT) AS startDateText,
            CAST(endDate  AS TEXT) AS endDateText,
            tickets, vendorName,
            coordinatesLat, coordinatesLng
       FROM PopularEvent
      WHERE isActive = 1
      ORDER BY clickCount DESC, viewCount DESC, createdAt DESC
      LIMIT 100`
  )

  // 2) Актуальные события Афиши по городу
  // @ts-expect-error AfishaEvent доступна в рантайме
  const afisha = await prisma.AfishaEvent.findMany({
    where: {
      status: 'active',
      city: cityNameRu,
      OR: [
        { startDate: { gte: new Date(iso) } },
        { endDate: { gte: new Date(iso) } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      venue: true,
      organizer: true,
      startDate: true,
      endDate: true,
      coordinates: true,
      order: true,
      status: true,
      coverImage: true,
      gallery: true,
      tickets: true,
      city: true,
      category: true,
      ageFrom: true,
      ageGroups: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 50,
  })

  // Нормализуем PopularEvent под интерфейс AfishaEventCard
  const normalizedFromPopular = popular.filter(p => {
    // Фильтруем по актуальности дат на стороне JS, аккуратно парся
    const s = p.startDateText ? new Date(p.startDateText) : undefined
    const e = p.endDateText ? new Date(p.endDateText) : undefined
    const now = new Date(iso)
    const validS = s && !Number.isNaN(s.getTime()) ? s : undefined
    const validE = e && !Number.isNaN(e.getTime()) ? e : undefined
    if (!validS && !validE) return true
    if (validS && validS >= now) return true
    if (validE && validE >= now) return true
    return false
  }).map((p) => {
    const images = (() => {
      const list: string[] = []
      if (p.imageUrl) list.push(p.imageUrl)
      try {
        const g = (p as any).images
        if (g) {
          const arr = typeof g === 'string' ? JSON.parse(g) : g
          if (Array.isArray(arr)) {
            for (const u of arr) if (typeof u === 'string' && !list.includes(u)) list.push(u)
          }
        }
      } catch {}
      return list
    })()

    const tickets = (() => {
      try {
        if (p.tickets) {
          const arr = JSON.parse(p.tickets)
          if (Array.isArray(arr)) return JSON.stringify(arr)
        }
      } catch {}
      return null
    })()

    return {
      id: Number(p.eventId) || p.id,
      title: p.title,
      slug: p.slug,
      description: p.description ?? undefined,
      venue: p.location ?? '',
      organizer: p.vendorName ?? undefined,
      startDate: (p.startDateText as any) ?? null,
      endDate: (p.endDateText as any) ?? null,
      coordinates: p.coordinatesLat != null && p.coordinatesLng != null ? JSON.stringify({ lat: p.coordinatesLat, lng: p.coordinatesLng }) : null,
      order: p.order ?? 0,
      status: p.isActive ? 'active' : 'inactive',
      coverImage: images[0] ?? null,
      gallery: images.length > 1 ? JSON.stringify(images.slice(1)) : null,
      tickets,
      city: cityNameRu,
      category: p.category ?? undefined,
      createdAt: p.createdAtText as any,
      updatedAt: p.updatedAtText as any,
      ageFrom: null,
      ageGroups: null,
      // приближённая популярность
      popularity: (p.clickCount ?? 0) * 3 + (p.viewCount ?? 0),
      viewCount: p.viewCount ?? 0,
    }
  })

  const normalizedFromAfisha = (afisha as any[]).map((e) => ({
    ...e,
    popularity: Number((e as any).viewCount ?? 0),
  }))

  let combined = [...normalizedFromPopular, ...normalizedFromAfisha]
  if (combined.length === 0) return null

  // Берём топ-10 по популярности и перемешиваем для случайного порядка
  combined.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
  combined = combined.slice(0, 10)
  shuffleInPlace(combined)
  const pick = combined.slice(0, 4)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="text-sm tracking-widest uppercase text-gray-500 mb-2">Сейчас в тренде</div>
          <h2 className="text-3xl font-bold font-unbounded">Популярные мероприятия {cityNameRu}</h2>
        </div>

        {/* Мобильная карусель */}
        <div className="md:hidden -mx-4 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-4 px-4 snap-x snap-mandatory">
            {pick.map((ev) => (
              <div key={`${ev.id}-${ev.title}`} className="snap-center shrink-0 w-[85%]">
                <AfishaEventCard event={ev as any} />
              </div>
            ))}
          </div>
        </div>

        {/* Десктопная сетка 4 в ряд */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pick.map((ev) => (
            <AfishaEventCard key={`${ev.id}-${ev.title}`} event={ev as any} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href={`/city/${citySlug}/cat/events`}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold shadow-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 transition-all transform hover:scale-105"
          >
            Посмотреть все мероприятия
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}


