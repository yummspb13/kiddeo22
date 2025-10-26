import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import VenueDetailsFull from '@/components/VenueDetailsFull';

type Props = {
  params: Promise<{ slug: string; venueSlug: string }>;
};

export default async function VenuePage({ params }: Props) {
  const { slug, venueSlug } = await params;

  // Получаем город
  const city = await prisma.city.findUnique({
    where: { slug, isPublic: true },
    select: { id: true, name: true, slug: true },
  });

  if (!city) {
    notFound();
  }

  // Получаем место/услугу (упрощенный запрос для отладки)
  const venue = await prisma.listing.findFirst({
    where: {
      slug: venueSlug,
      cityId: city.id,
      type: { in: ['VENUE', 'SERVICE'] },
      isActive: true,
    },
    include: {
      vendor: {
        select: {
          id: true,
          displayName: true,
          logo: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!venue) {
    notFound();
  }

  // Получаем похожие места
  const similarVenues = await prisma.listing.findMany({
    where: {
      cityId: city.id,
      categoryId: venue.categoryId,
      type: { in: ['VENUE', 'SERVICE'] },
      isActive: true,
      id: { not: venue.id },
    },
    include: {
      vendor: {
        select: {
          id: true,
          displayName: true,
          logo: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  // Преобразуем данные для VenueDetailsFull
  const venueData = {
    id: venue.id,
    name: venue.title,
    slug: venue.slug,
    address: venue.address || '',
    heroImage: (() => {
      try {
        const raw = (venue as any).images;
        if (!raw) return null;
        const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
      } catch {
        return null;
      }
    })(),
    coverImage: (() => {
      try {
        const raw = (venue as any).images;
        if (!raw) return null;
        const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(arr) && arr.length > 1 ? arr[1] : null;
      } catch {
        return null;
      }
    })(),
    subcategoryId: venue.categoryId,
    vendorId: venue.vendorId,
    cityId: venue.cityId,
    tariff: venue.isFree ? 'FREE' : 'PAID',
    status: venue.isActive ? 'ACTIVE' : 'INACTIVE',
    moderationReason: null,
    createdAt: venue.createdAt.toISOString(),
    updatedAt: venue.updatedAt.toISOString(),
    priceFrom: venue.priceFrom,
    priceTo: venue.priceTo,
    isFree: venue.isFree,
    capacity: 20, // По умолчанию
    vendor: venue.vendor,
    subcategory: {
      id: venue.category.id,
      name: venue.category.name,
      slug: venue.category.slug,
      category: {
        id: venue.category.id,
        name: venue.category.name,
        slug: venue.category.slug,
      },
    },
    _count: {
      parameters: 0,
    },
    Review: [],
  };

  // Преобразуем похожие места
  const similarVenuesData = similarVenues.map(venue => ({
    id: venue.id,
    name: venue.title,
    slug: venue.slug,
    address: venue.address || '',
    heroImage: (() => {
      try {
        const raw = (venue as any).images;
        if (!raw) return null;
        const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
      } catch {
        return null;
      }
    })(),
    coverImage: null,
    vendor: venue.vendor,
    subcategory: {
      name: venue.category.name,
      slug: venue.category.slug,
      category: {
        name: venue.category.name,
        slug: venue.category.slug,
      },
    },
    _count: {
      parameters: 0,
    },
  }));

  return (
    <VenueDetailsFull 
      venue={venueData}
      similarVenues={similarVenuesData}
      city={city}
    />
  );
}
