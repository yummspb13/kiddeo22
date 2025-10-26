import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import VenueCategoryPage from '@/components/VenueCategoryPage';
import Breadcrumbs from '@/components/Breadcrumbs';

const categoryMap = {
  'master-classes': {
    name: 'Мастер-классы',
    emoji: '🎨',
    description: 'Арт-студии, лепка, творческие классы',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200'
  },
  'leisure': {
    name: 'Прочий досуг',
    emoji: '🧸',
    description: 'Зоопарки, театры, аквапарки, фермы',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  'sports': {
    name: 'Спорт',
    emoji: '⚽️',
    description: 'Спортшколы, секции, бассейны',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  'education': {
    name: 'Образование',
    emoji: '📚',
    description: 'Детсады, школы, подготовка, онлайн-курсы',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  'medicine': {
    name: 'Медицина',
    emoji: '🩺',
    description: 'Логопеды, детские психологи, офтальмологи',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  'camps': {
    name: 'Лагеря',
    emoji: '🏕',
    description: 'Городские и загородные, с уклоном (спорт/арт)',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  'nannies': {
    name: 'Няни',
    emoji: '👩‍🍼',
    description: 'Агентства, частные профили',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  }
};

type Props = {
  params: Promise<{ slug: string; category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VenueCategoryPageRoute({ params, searchParams }: Props) {
  const { slug, category } = await params;
  const sp = await searchParams;
  const subcategory = sp.subcategory as string;

  // Получаем город
  const city = await prisma.city.findUnique({
    where: { slug, isPublic: true },
    select: { id: true, name: true, slug: true },
  });

  if (!city) {
    notFound();
  }

  // Проверяем, что категория существует
  const categoryInfo = categoryMap[category as keyof typeof categoryMap];
  if (!categoryInfo) {
    notFound();
  }

  // Определяем, что отображать - подкатегорию или основную категорию
  const displayInfo = subcategory ? {
    name: subcategory,
    emoji: categoryInfo.emoji,
    description: `${subcategory} в ${city.name}`,
    color: categoryInfo.color,
    bgColor: categoryInfo.bgColor,
    textColor: categoryInfo.textColor,
    borderColor: categoryInfo.borderColor
  } : categoryInfo;

  // Получаем места/услуги для данной категории
  const venues = await prisma.listing.findMany({
    where: {
      cityId: city.id,
      type: { in: ['VENUE', 'SERVICE'] },
      isActive: true,
      // Здесь можно добавить фильтрацию по категории, если она есть в БД
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
      _count: {
        select: {
          Review: true,
          bookings: true,
        },
      },
    },
    orderBy: [
      { isFree: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  // Получаем подкатегории (можно расширить в будущем)
  const subcategories = [
    { id: 'all', name: 'Все', count: venues.length },
    { id: 'popular', name: 'Популярные', count: Math.floor(venues.length * 0.3) },
    { id: 'new', name: 'Новинки', count: Math.floor(venues.length * 0.2) },
    { id: 'free', name: 'Бесплатные', count: venues.filter(v => v.isFree).length },
  ];

  return (
    <div>
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: city.name, href: `/city/${city.slug}` },
            { label: 'Места', href: `/city/${city.slug}/cat/venues` },
            { label: categoryInfo.name, href: `/city/${city.slug}/cat/venues/${category}` },
            ...(subcategory ? [{ label: subcategory, href: `/city/${city.slug}/cat/venues/${category}?subcategory=${subcategory}` }] : [])
          ]}
        />

        <VenueCategoryPage
          categoryInfo={displayInfo}
          cityName={city.name}
          citySlug={city.slug}
          venues={venues as any}
          subcategories={subcategories}
          searchParams={sp}
        />
      </div>
    </div>
  );
}
