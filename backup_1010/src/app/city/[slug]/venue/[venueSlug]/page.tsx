import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import VenueDetailsFull from "@/components/VenueDetailsFull";

type Params = { slug: string; venueSlug: string };

// Отключаем статическую генерацию для динамических страниц
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Оптимизированная функция с таймаутом для Prisma
async function withTimeout<T>(promise: Promise<T>, ms: number, name: string): Promise<T | null> {
  const result = await Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => {
      console.warn(`⚠️ Timeout: ${name} exceeded ${ms}ms`)
      resolve(null)
    }, ms))
  ])
  return result
}

export default async function VenuePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const startTime = Date.now()
  const { slug, venueSlug } = await params;

  try {
    // Получаем город (быстро)
    const city = await withTimeout(
      prisma.city.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true, isPublic: true }
      }),
      1000,
      'city lookup'
    )

    if (!city || !city.isPublic) {
      notFound();
    }

    // Получаем место по slug (оптимизированный запрос)
    const venue = await withTimeout(
      prisma.venuePartner.findFirst({
        where: {
          slug: venueSlug,
          cityId: city.id,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          description: true,
          coverImage: true,
          additionalImages: true,
          subcategoryId: true,
          vendorId: true,
          cityId: true,
          tariff: true,
          status: true,
          moderationReason: true,
          priceFrom: true,
          priceTo: true,
          lat: true,
          lng: true,
          district: true,
          metro: true,
          ageFrom: true,
          ageTo: true,
          createdAt: true,
          updatedAt: true,
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          vendor: {
            select: {
              id: true,
              displayName: true,
              description: true,
              logo: true,
              website: true,
              phone: true,
              email: true,
              address: true
            }
          },
          parameters: {
            select: {
              value: true,
              parameter: { select: { name: true } }
            },
            where: {
              parameter: {
                name: { in: ['FEATURES_JSON', 'QA_JSON', 'NEWS_JSON'] }
              }
            }
          }
        }
      }),
      3000,
      'venue lookup'
    )

    if (!venue) {
      notFound();
    }

    // Получаем похожие места ПАРАЛЛЕЛЬНО (не блокируем основной запрос)
    const similarVenuesPromise = prisma.venuePartner.findMany({
      where: {
        subcategoryId: venue.subcategoryId,
        cityId: city.id,
        status: 'ACTIVE',
        id: { not: venue.id }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        coverImage: true,
        description: true,
        district: true,
        metro: true,
        vendor: {
          select: {
            displayName: true,
            logo: true
          }
        },
        subcategory: {
          select: {
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })

    // Ждём похожие места с таймаутом
    const similarVenues = await withTimeout(similarVenuesPromise, 2000, 'similar venues') || [];

    const duration = Date.now() - startTime
    if (duration > 2000) {
      console.warn(`⚠️ Slow venue page load: ${duration}ms for ${venueSlug}`)
    }

    // Преобразуем данные в формат, ожидаемый компонентом
    const venueData = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      description: venue.description,
      heroImage: venue.coverImage,
      coverImage: venue.coverImage,
      subcategoryId: venue.subcategoryId,
      vendorId: venue.vendorId,
      cityId: venue.cityId,
      tariff: venue.tariff,
      status: venue.status,
      moderationReason: venue.moderationReason,
      createdAt: venue.createdAt.toISOString(),
      updatedAt: venue.updatedAt.toISOString(),
      // Для бесплатного тарифа - бесплатно
      priceFrom: venue.tariff === 'FREE' ? null : venue.priceFrom,
      priceTo: venue.tariff === 'FREE' ? null : venue.priceTo,
      isFree: venue.tariff === 'FREE',
      // Координаты
      lat: venue.lat,
      lng: venue.lng,
      // Район и метро
      district: venue.district,
      metro: venue.metro,
      // Ограничение фото по тарифу (включая обложку)
      additionalImages: (() => {
        const cap = venue.tariff === 'FREE' ? 4 : venue.tariff === 'SUPER' ? 10 : 20
        const coverCount = venue.coverImage ? 1 : 0
        const allowedAdditional = Math.max(cap - coverCount, 0)
        const imgs = venue.additionalImages ? JSON.parse(venue.additionalImages) : []
        return Array.isArray(imgs) ? imgs.slice(0, allowedAdditional) : []
      })(),
      // Возраст
      ageFrom: (venue as any).ageFrom ?? null,
      ageTo: (venue as any).ageTo ?? null,
      vendor: venue.vendor,
      subcategory: venue.subcategory,
      // Для бесплатного тарифа отзывы пока не реализованы
      Review: [],
      _count: {
        parameters: venue.tariff === 'FREE' ? 5 : 10
      },
      features: (() => {
        try {
          const params = (venue as any).parameters as Array<{ parameter: { name: string }, value: string }>
          const found = params?.find(p => p.parameter?.name === 'FEATURES_JSON')
          if (found?.value) {
            const parsed = JSON.parse(found.value)
            if (Array.isArray(parsed)) return parsed
          }
        } catch {}
        return []
      })()
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Навигационные хлебные крошки */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center space-x-2 text-sm">
                <a 
                  href={`/city/${city.slug}/cat/venues`} 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Места
                </a>
                <span className="text-gray-400">/</span>
                <a 
                  href={`/city/${city.slug}/cat/${venue.subcategory.category.slug}`} 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {venue.subcategory.category.name}
                </a>
                <span className="text-gray-400">/</span>
                <a 
                  href={`/city/${city.slug}/cat/${venue.subcategory.category.slug}/${venue.subcategory.slug}`} 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {venue.subcategory.name}
                </a>
              </nav>
              <a 
                href={`/city/${city.slug}/cat/${venue.subcategory.category.slug}`}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Назад к категориям
              </a>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <VenueDetailsFull 
              venue={venueData}
              similarVenues={similarVenues}
              city={city}
            />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('❌ Error loading venue page:', error)
    return notFound()
  }
}