import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import VenueTemplateSelector from '@/components/VenueTemplateSelector'

export const dynamic = 'force-dynamic'

interface VenuePageProps {
  params: Promise<{ slug: string }>
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params

  // Получаем место по slug
  const venue = await prisma.venuePartner.findUnique({
    where: { slug },
    include: {
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
      },
      city: {
        select: {
          name: true,
          slug: true
        }
      },
      parameters: {
        include: {
          parameter: {
            select: {
              name: true,
              type: true
            }
          }
        }
      },
      _count: {
        select: {
          parameters: true
        }
      }
    }
  })

  if (!venue) {
    notFound()
  }

  // Получаем похожие места (того же типа в том же городе)
  const similarVenues = await prisma.venuePartner.findMany({
    where: {
      AND: [
        { id: { not: venue.id } },
        { subcategoryId: venue.subcategoryId },
        { cityId: venue.cityId },
        { status: 'ACTIVE' }
      ]
    },
    take: 6,
    include: {
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
      },
      _count: {
        select: {
          parameters: true
        }
      }
    }
  })

  // Преобразуем данные в формат, ожидаемый компонентом
  const venueData = {
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    address: venue.address || '',
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
    priceFrom: null, // Для бесплатного тарифа
    priceTo: null,
    isFree: venue.tariff === 'FREE',
    capacity: null, // Для бесплатного тарифа
    vendor: {
      id: venue.vendor.id,
      displayName: venue.vendor.displayName,
      description: venue.vendor.description,
      logo: venue.vendor.logo,
      website: venue.vendor.website,
      phone: venue.vendor.phone,
      email: venue.vendor.email,
      address: venue.vendor.address
    },
    subcategory: venue.subcategory,
    _count: venue._count
  }

  const similarVenuesData = similarVenues.map(venue => ({
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    address: venue.address || '',
    heroImage: venue.coverImage,
    coverImage: venue.coverImage,
    vendor: {
      displayName: venue.vendor.displayName,
      logo: venue.vendor.logo
    },
    subcategory: venue.subcategory,
    _count: venue._count
  }))

  const cityData = {
    id: venue.city.id,
    name: venue.city.name,
    slug: venue.city.slug
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <VenueTemplateSelector 
            venue={venueData}
            similarVenues={similarVenuesData}
            city={cityData}
          />
        </div>
      </main>
    </div>
  )
}
