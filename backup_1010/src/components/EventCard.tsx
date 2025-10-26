// src/components/EventCard.tsx
import Link from 'next/link'
import PartnerBadge from './PartnerBadge'
import ClaimButton from './ClaimButton'
import { InlineAd } from './AdSlot'

type Ticket = {
  id: number
  name: string
  // Prisma Decimal приходит как объект — приводим к числу через Number()
  price: unknown
}

type Slot = {
  id: number
  start: string | Date
  end?: string | Date | null
}

type ListingCard = {
  id: number
  slug: string
  title: string
  description?: string | null
  tickets: Ticket[]
  slots: Slot[]
  vendor?: { 
    displayName: string
    type?: 'START' | 'PRO'
    kycStatus?: 'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED'
    payoutEnabled?: boolean
    officialPartner?: boolean
    subscriptionStatus?: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  } | null
  address?: string | null
  claimable?: boolean
  claimStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD'
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

/** Берём ближайший слот (в выборке уже прилетает take:1, orderBy:start asc) */
function nextSlot(slots: Slot[]) {
  const first = slots?.[0]
  if (!first) return { start: undefined as Date | undefined, end: undefined as Date | undefined }
  const start = new Date(first.start)
  const end = first.end ? new Date(first.end) : undefined
  return { start, end }
}

export default function EventCard({ listing }: { listing: ListingCard }) {
  const href = `/listing/${listing.slug}`
  const { min, isFree } = getPriceInfo(listing.tickets)
  const { start } = nextSlot(listing.slots)
  const startText = formatDate(start)

  // --- JSON-LD (schema.org/Event) ---
  // Минимально необходимый набор полей; валидно даже без image
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: listing.title,
    startDate: start ? new Date(start).toISOString() : undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: listing.vendor?.displayName || listing.title,
      address: listing.address || undefined,
    },
    offers: min != null && Number.isFinite(min) ? {
      '@type': 'Offer',
      price: String(min),
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      url: href,
    } : undefined,
    description: listing.description || undefined,
    url: href,
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md">
      {/* Изображение/плейсхолдер */}
      <Link href={href} className="relative block aspect-[16/9] bg-gradient-to-br from-orange-50 to-pink-50">
        {/* Бейдж «Бесплатно» или цена */}
        <div className="absolute left-3 top-3">
          {isFree ? (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow/50 shadow-emerald-600/30">
              Бесплатно
            </span>
          ) : min != null && Number.isFinite(min) ? (
            <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              от {Math.round(min).toLocaleString('ru-RU')} ₽
            </span>
          ) : null}
        </div>
      </Link>

      {/* Текст */}
      <div className="p-4">
        <Link href={href} className="line-clamp-2 text-base font-semibold leading-snug hover:underline">
          {listing.title}
        </Link>

        <div className="mt-1 flex items-center justify-between">
          <div className="line-clamp-1 text-sm text-gray-600">
            {listing.vendor?.displayName}
          </div>
          {listing.vendor && (
            <PartnerBadge
              vendorType={listing.vendor.type}
              kycStatus={listing.vendor.kycStatus}
              payoutEnabled={listing.vendor.payoutEnabled}
              officialPartner={listing.vendor.officialPartner}
              subscriptionStatus={listing.vendor.subscriptionStatus}
            />
          )}
        </div>

        <div className="mt-2 text-sm text-gray-500">
          {startText ? <>Ближайшее: {startText}</> : 'Дата по расписанию'}
        </div>

        {/* Кнопка клайма */}
        {listing.claimable && (
          <div className="mt-3">
            <ClaimButton
              listingId={listing.id}
              listingTitle={listing.title}
              isClaimable={listing.claimable}
              claimStatus={listing.claimStatus}
            />
          </div>
        )}

        {/* Рекламный слот 3 - внутри карточки события */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <InlineAd citySlug="moskva" />
        </div>
      </div>

      {/* Schema.org */}
      <script type="application/ld+json"
        // JSON.stringify без Decimal — мы уже привели числа к строкам/числам
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  )
}
