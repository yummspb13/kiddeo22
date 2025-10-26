import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Unbounded } from 'next/font/google';
import VenueCategories from '@/components/VenueCategories';
import VenueSections from '@/components/VenueSections';
import VenueSearchBox from '@/components/VenueSearchBox';
import AddVenueSuggestion from '@/components/AddVenueSuggestion';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VenuesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  // Получаем город
  const city = await prisma.city.findUnique({
    where: { slug, isPublic: true },
    select: { id: true, name: true, slug: true },
  });

  if (!city) {
    return notFound();
  }

  // Получаем места/услуги (все + первые 6 для блока "Новые в каталоге")
  const rawVenues = await prisma.venuePartner.findMany({
    where: {
      cityId: city.id,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      address: true,
      priceFrom: true,
      priceTo: true,
      district: true,
      metro: true,
      coverImage: true,
      additionalImages: true,
      vendor: {
        select: {
          id: true,
          displayName: true,
        },
      },
      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  // Берем первые 8 для блока "Новые в каталоге" (по 4 в строку)
  const newVenues = rawVenues.slice(0, 8);

  // Получаем рекламные места для раздела "Рекомендуем"
  // Показываем только места с тарифом SUPER или MAXIMUM (рекламные места)
  const allRecommendedVenues = await prisma.venuePartner.findMany({
    where: {
      cityId: city.id,
      status: 'ACTIVE',
      tariff: { in: ['SUPER', 'MAXIMUM'] },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      coverImage: true,
      additionalImages: true,
      priceFrom: true,
      priceTo: true,
      tariff: true,
      address: true,
      district: true,
      subcategory: {
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { tariff: 'desc' }, // Сначала MAXIMUM, потом SUPER
      { createdAt: 'desc' },
    ],
  });

  // Рандомно выбираем максимум 6 мест для отображения
  const recommendedVenues = allRecommendedVenues
    .sort(() => Math.random() - 0.5) // Перемешиваем массив
    .slice(0, 6); // Берем первые 6


  // Преобразуем данные для блока "Новые в каталоге" (теперь в стиле CatalogVenueCard)
  const transformedNewVenues = newVenues.map((venue: any) => {
    // Используем coverImage или fallback
    let heroImage = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop';
    if (venue.coverImage) {
      heroImage = venue.coverImage;
    }

    // Парсим дополнительные изображения
    let images = [heroImage];
    if (venue.additionalImages) {
      try {
        const parsedImages = JSON.parse(venue.additionalImages);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          images = [heroImage, ...parsedImages.slice(0, 2)]; // Берем до 3 изображений
        }
      } catch (error) {
        console.error('Error parsing additionalImages:', error);
      }
    }

    return {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      description: venue.description || 'Интересное место для детей',
      heroImage: heroImage,
      images: images,
      priceFrom: venue.priceFrom,
      priceTo: venue.priceTo,
      tariff: venue.tariff || 'FREE',
      isFree: !venue.priceFrom,
      averageRating: 4.5, // Пока используем дефолтный рейтинг
      reviewsCount: 0, // Пока нет отзывов
      address: venue.address || venue.district || 'Адрес не указан',
      subcategory: venue.subcategory?.name || 'Место',
      isNew: true,
    };
  });

  // Преобразуем данные для блока "Рекомендуем" (теперь в стиле VenueCard)
  const transformedRecommendedVenues: Array<{
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
    rating: number;
    reviewsCount: number;
    address: string;
    category: string;
    isRecommended: boolean;
  }> = recommendedVenues.map((venue: any) => {
    // Используем coverImage или fallback
    let imageUrl = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop';
    if (venue.coverImage) {
      imageUrl = venue.coverImage;
    }

    // Форматируем цену
    let priceText = 'Бесплатно';
    if (venue.priceFrom) {
      priceText = `от ${venue.priceFrom.toLocaleString()} ₽`;
    }

    return {
      id: venue.id, // Используем id для типа
      name: venue.name,
      description: venue.description || 'Интересное место для детей',
      image: imageUrl,
      price: priceText,
      rating: 4.5, // Пока используем дефолтный рейтинг
      reviewsCount: 0, // Пока нет отзывов
      address: venue.address || venue.district || 'Адрес не указан',
      category: venue.subcategory?.category?.name || 'Место',
      isRecommended: true,
    };
  });

  // Получаем категории для фильтрации
  const categories = await prisma.venueCategory.findMany({
    where: {
      subcategories: {
        some: {
          partners: {
            some: {
              cityId: city.id,
              status: 'ACTIVE',
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/pictures/venue_hero.png)'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Места в {city.name}</h1>
          <p className="text-xl mb-8">Найдите интересные места для всей семьи</p>
          
          {/* Venue Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <VenueSearchBox citySlug={city.slug} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories Section - New Design */}
        <VenueCategories citySlug={city.slug} />

        {/* Venue Sections - Collections, Recommended, New */}
        <VenueSections 
          citySlug={city.slug} 
          newVenues={transformedNewVenues as any}
          recommendedVenues={transformedRecommendedVenues}
        />

        {/* Add Venue Suggestion Block */}
        <AddVenueSuggestion citySlug={city.slug} />

      </main>
    </div>
  );
}

