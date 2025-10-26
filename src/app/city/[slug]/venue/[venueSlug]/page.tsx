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
    // ПАРАЛЛЕЛЬНО получаем город и место
    const [city, venue] = await Promise.all([
      withTimeout(
        prisma.city.findUnique({
          where: { slug },
          select: { id: true, name: true, slug: true, isPublic: true }
        }),
        1000,
        'city lookup'
      ),
      withTimeout(
        prisma.venuePartner.findFirst({
          where: {
            slug: venueSlug,
            city: { slug },
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
            lat: true,
            lng: true,
            district: true,
            metro: true,
            priceFrom: true,
            priceTo: true,
            ageFrom: true,
            ageTo: true,
            richDescription: true,
            workingHours: true,
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
                userId: true,
                displayName: true,
                description: true,
                logo: true,
                website: true,
                phone: true,
                email: true,
                address: true
              }
            }
          }
        }),
        2000,
        'venue lookup'
      )
    ]);

    if (!city) {
      console.log(`🔍 City not found for slug: ${slug}`)
      notFound();
    }

    if (!city.isPublic) {
      console.log(`🔍 City ${slug} is not public`)
      notFound();
    }

    if (!venue) {
      console.log(`🔍 Venue not found for slug: ${venueSlug} in city: ${slug}`)
      notFound();
    }

    // Получаем отзывы и похожие места ПАРАЛЛЕЛЬНО с основными данными
    const [reviews, similarVenuesRaw] = await Promise.all([
      withTimeout(
        prisma.venueReview.findMany({
          where: {
            venueId: venue.id,
            status: 'APPROVED'
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        1000,
        'reviews'
      ) || [],
      withTimeout(
        prisma.venuePartner.findMany({
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
            address: true,
            coverImage: true,
            description: true,
            district: true,
            metro: true,
            priceFrom: true,
            priceTo: true,
            tariff: true,
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
          take: 6,
          orderBy: { createdAt: 'desc' }
        }),
        1500,
        'similar venues'
      ) || []
    ]);
    
    // Упрощенное преобразование similarVenues
    const similarVenues = (similarVenuesRaw || []).map(v => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      address: v.address || '',
      heroImage: v.coverImage,
      coverImage: v.coverImage,
      priceFrom: v.priceFrom,
      priceTo: v.priceTo,
      isFree: v.tariff === 'FREE',
      vendor: v.vendor,
      subcategory: v.subcategory,
      averageRating: null,
      _count: { reviews: 0, parameters: 0 }
    }));

    const duration = Date.now() - startTime
    if (duration > 2000) {
      console.warn(`⚠️ Slow venue page load: ${duration}ms for ${venueSlug}`)
    }

    // Преобразуем данные в формат, ожидаемый компонентом
    const venueData = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address || '',
      description: venue.description,
      heroImage: venue.coverImage,
      coverImage: venue.coverImage,
      subcategoryId: venue.subcategoryId,
      vendorId: venue.vendorId,
      cityId: venue.cityId,
      tariff: venue.tariff as 'FREE' | 'SUPER' | 'MAXIMUM',
      status: venue.status,
      moderationReason: venue.moderationReason,
      createdAt: venue.createdAt.toISOString(),
      updatedAt: venue.updatedAt.toISOString(),
      priceFrom: venue.priceFrom ?? null,
      priceTo: venue.priceTo ?? null,
      isFree: venue.tariff === 'FREE',
      lat: venue.lat,
      lng: venue.lng,
      district: venue.district,
      metro: venue.metro,
      // Упрощенная обработка additionalImages
      additionalImages: venue.additionalImages ? JSON.parse(venue.additionalImages) : [],
      ageFrom: venue.ageFrom ?? null,
      ageTo: venue.ageTo ?? null,
      workingHours: venue.workingHours ?? null,
      richDescription: venue.richDescription ?? null,
      vendor: venue.vendor,
      subcategory: venue.subcategory,
      Review: reviews?.map(review => ({
        id: parseInt(review.id),
        rating: review.rating,
        comment: review.comment || '',
        createdAt: review.createdAt.toISOString(),
        User_Review_userIdToUser: {
          name: review.user.name || '',
          image: review.user.image
        }
      })) || [],
      _count: {
        parameters: venue.tariff === 'FREE' ? 5 : 10
      },
      features: []
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Навигационные хлебные крошки */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center space-x-3 text-sm">
                <a 
                  href={`/city/${city.slug}/cat/venues`} 
                  className="text-gray-500 hover:text-violet-600 transition-all duration-300 font-unbounded font-medium hover:scale-105"
                >
                  Места
                </a>
                <span className="text-gray-400 font-unbounded">/</span>
                <a 
                  href={`/city/${city.slug}/cat/venues?category=${venue.subcategory.category.slug}`} 
                  className="text-gray-500 hover:text-violet-600 transition-all duration-300 font-unbounded font-medium hover:scale-105"
                >
                  {venue.subcategory.category.name}
                </a>
                <span className="text-gray-400 font-unbounded">/</span>
                <a 
                  href={`/city/${city.slug}/cat/${venue.subcategory.category.slug}/${venue.subcategory.slug}`} 
                  className="text-gray-500 hover:text-violet-600 transition-all duration-300 font-unbounded font-medium hover:scale-105"
                >
                  {venue.subcategory.name}
                </a>
              </nav>
              <a 
                href={`/city/${city.slug}/cat/${venue.subcategory.category.slug}/${venue.subcategory.slug}`}
                className="group flex items-center text-violet-600 hover:text-violet-700 font-unbounded font-bold transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">←</span>
                <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent group-hover:from-violet-700 group-hover:to-pink-700 transition-all duration-300">
                  Назад к категориям
                </span>
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