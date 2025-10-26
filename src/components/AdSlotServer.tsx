import prisma from '@/lib/db'
import Image from 'next/image'
import { cookies } from 'next/headers'
import AdImpression from './AdImpression'

type AdProps = {
  page: 'afisha'
  position: 'HERO' | 'HERO_BELOW' | 'INLINE' | 'SIDEBAR'
  citySlug?: string
  cityName?: string
  heroLinks?: { label: string; href: string }[]
}

const SIZE_BY_POS = {
  HERO:       'h-[214px] sm:h-[280px] lg:h-[348px]',
  HERO_BELOW: 'h-[180px] sm:h-[240px] lg:h-[300px]',
  INLINE:     'h-[120px] sm:h-[160px]',
  SIDEBAR:    'h-[280px] lg:h-[340px]',
} as const

const DAILY_CAP = 3 // не показывать одному пользователю чаще 3 раз в сутки один и тот же баннер

function parseJSON<T>(v: string | undefined | null, fallback: T): T {
  try { return v ? JSON.parse(v) as T : fallback } catch { return fallback }
}

export default async function AdSlotServer({ page, position, citySlug, cityName, heroLinks }: AdProps) {
  const city = citySlug
    ? await prisma.city.findUnique({ where: { slug: citySlug }, select: { id: true } })
    : null

  const now = new Date()

  let ads: unknown[] = []
  try {
    // Основной путь через Prisma ORM
    ads = await prisma.adPlacement.findMany({
      where: {
        page,
        position,
        isActive: true,
        AND: [
          { OR: [{ cityId: null }, { cityId: city?.id ?? undefined }] },
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
  } catch (err) {
    // Фолбэк: если таблицы нет или модель отсутствует — пробуем raw SQL, иначе тихо продолжаем без рекламы
    try {
      const tableExists = await prisma.$queryRaw<unknown[]>`
        SELECT name FROM sqlite_master WHERE type='table' AND name='AdPlacement'
      `
      if (Array.isArray(tableExists) && tableExists.length > 0) {
        // В SQLite слово order — ключевое, экранируем его двойными кавычками
        const startsAtIso = now.toISOString()
        ads = await prisma.$queryRaw<any[]>`
          SELECT *
          FROM AdPlacement
          WHERE page = ${page}
            AND position = ${position}
            AND isActive = 1
            AND (cityId IS NULL OR cityId = ${city?.id ?? null})
            AND (startsAt IS NULL OR startsAt <= ${startsAtIso})
            AND (endsAt   IS NULL OR endsAt   >= ${startsAtIso})
          ORDER BY "order" ASC, createdAt DESC
        `
      }
    } catch {}
  }

  const jar = await cookies()
  const pinKey = `adpin:${page}:${position}:${city?.id ?? 'all'}`
  const capKey = `adcap:${page}:${position}` // JSON: { "<adId>": { c:number, d:"YYYY-MM-DD" } }

  // каппинг: читаем счётчики
  type CapMap = Record<string, { c: number; d: string }>
  const caps = parseJSON<CapMap>(jar.get(capKey)?.value, {})

  const today = new Date().toISOString().slice(0,10)
  // очищаем вчерашние
  for (const k of Object.keys(caps)) {
    if (caps[k].d !== today) delete caps[k]
  }

  // фильтруем по каппингу (оставляем те, где показов < DAILY_CAP)
  const eligible = ads.filter((a: any) => (caps[String(a.id)]?.c ?? 0) < DAILY_CAP)

  // пин: если закреплён и он ещё eligible — используем
  const pinnedId = jar.get(pinKey)?.value
  let ad = (eligible.find((a: any) => String(a.id) === pinnedId) ??
            // иначе — выбираем по весам из eligible, либо если все закэплены — из ads
            pickWeighted(eligible.length ? eligible : ads)) ?? null

  // записываем пин на 1 день
  if (ad) {
    try {
      await jar.set(pinKey, String((ad as any).id), { maxAge: 60*60*24, path: '/', sameSite: 'lax' })
    } catch {}
    // увеличиваем счётчик каппинга на сервере (учитываем «попытку показа»)
    const rec = caps[String((ad as any).id)] ?? { c: 0, d: today }
    caps[String((ad as any).id)] = { c: rec.d === today ? rec.c + 1 : 1, d: today }
    try {
      await jar.set(capKey, JSON.stringify(caps), { maxAge: 60*60*24, path: '/', sameSite: 'lax' })
    } catch {}
  }

  const sizeCls = SIZE_BY_POS[position]

  // HERO variant with overlayed content
  if (position === 'HERO') {
    return (
      <section className={`relative w-full overflow-hidden rounded-3xl ${sizeCls}`}>
        {/* Background */}
        <div className="absolute inset-0">
          {(ad as any)?.imageUrl ? (
            <>
              <Image src={(ad as any).imageUrl} alt={(ad as any).title ?? 'Реклама'} fill sizes="100vw" className="object-cover" />
              <AdImpression adId={(ad as any).id} cityId={city?.id ?? null} />
            </>
          ) : (
            <Image src="/ads/sidebar-1.svg" alt="Реклама" fill sizes="100vw" className="object-cover" />
          )}
          {/* dark overlay for readability */}
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Content overlay */}
        <div className="relative h-full px-6 sm:px-8 lg:px-10 py-8 flex flex-col justify-between">
          {/* Top-right ad badge */}
          <div className="flex justify-end">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600/50 text-white backdrop-blur">
              Реклама
            </span>
          </div>

          {/* Center-left main text */}
          <div>
            <h1 className="text-white text-2xl sm:text-4xl font-extrabold drop-shadow">
              Лучшие события вашего города
            </h1>
            <p className="mt-2 text-white/90 text-sm sm:text-base font-medium drop-shadow">
              {(cityName || 'Ваш город')}: выбирайте по датам, цене и возрасту.
            </p>
            {heroLinks && heroLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {heroLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="px-3 py-1.5 rounded-full text-sm border border-white/50 text-white/90 hover:bg-white/10 backdrop-blur transition"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Bottom row: left title, right button */}
          <div className="flex items-end justify-between">
            <div className="text-white/90 text-sm sm:text-base font-semibold line-clamp-1">
              {(ad as any)?.title || 'Партнёрская реклама'}
            </div>
            {(ad as any)?.hrefUrl && (
              <a
                href={`/api/ads/click?adId=${(ad as any).id}&to=${encodeURIComponent((ad as any).hrefUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-white text-gray-900 font-semibold shadow hover:opacity-90"
              >
                Посмотреть
              </a>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default banner variants
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-gray-200 ${sizeCls}
      bg-gradient-to-br from-orange-400 to-pink-500`}>
      {(ad as any)?.imageUrl ? (
        <>
          <a
            href={`/api/ads/click?adId=${(ad as any).id}&to=${encodeURIComponent((ad as any).hrefUrl ?? '/')}`}
            className="absolute inset-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={(ad as any).imageUrl} alt={(ad as any).title ?? 'Реклама'} fill sizes="100vw" className="object-cover" />
          </a>
          {/* маяк показа */}
          <AdImpression adId={(ad as any).id} cityId={city?.id ?? null} />
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold">Реклама</div>
            <div className="text-lg sm:text-xl opacity-90 mt-2">Ваш баннер здесь</div>
          </div>
        </div>
      )}
    </div>
  )
}

function pickWeighted<T extends { weight?: number }>(arr: T[]): T | null {
  if (!arr.length) return null
  const weights = arr.map(a => Math.max(1, a.weight ?? 1))
  const sum = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * sum
  for (let i = 0; i < arr.length; i++) {
    if ((r -= weights[i]) <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}
