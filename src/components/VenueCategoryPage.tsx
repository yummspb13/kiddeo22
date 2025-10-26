"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Filter, 
  X,
  ChevronDown,
  Search,
  Heart,
  Calendar,
  Clock,
  Building,
  Coffee,
  Camera
} from "lucide-react"
import { VenueImageCarousel } from '@/components/VenueImageCarousel'
import DynamicFilters from './DynamicFilters'
import { useFilterConfig } from '@/hooks/useFilterConfig'

interface Venue {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  address: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  isFree: boolean;
  isIndoor: boolean | null;
  district: string | null;
  vendor: {
    id: number;
    displayName: string;
    logo: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  _count: {
    reviews: number;
    bookings: number;
  };
}

interface CategoryInfo {
  name: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface Subcategory {
  id: string;
  name: string;
  count: number;
}

interface VenueCategoryPageProps {
  categoryInfo: CategoryInfo;
  cityName: string;
  citySlug: string;
  venues: Venue[];
  subcategories: Subcategory[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function VenueCategoryPage({
  categoryInfo,
  cityName,
  citySlug,
  venues,
  subcategories,
  searchParams
}: VenueCategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const router = useRouter();

  // Получаем конфигурацию фильтров для категории мест
  const { filters, loading: filtersLoading, error: filtersError } = useFilterConfig({
    scope: 'VENUE_CATEGORY',
    cityId: 1, // Москва по умолчанию
    categoryId: 1 // Можно передавать из пропсов
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  // Фильтрация мест
  const filteredVenues = venues.filter((venue) => {
    // Поиск по названию и описанию
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        venue.title.toLowerCase().includes(query) ||
        venue.description?.toLowerCase().includes(query) ||
        venue.vendor.displayName.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Фильтр по подкатегории
    if (selectedSubcategory !== 'all') {
      if (selectedSubcategory === 'free' && !venue.isFree) return false;
      if (selectedSubcategory === 'popular' && venue._count.reviews < 5) return false;
      if (selectedSubcategory === 'new' && venue.createdAt) {
        const daysSinceCreated = Math.floor((Date.now() - new Date(venue.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated > 30) return false;
      }
    }

    // Фильтр по цене
    if (priceFilter !== 'all') {
      if (priceFilter === 'free' && !venue.isFree) return false;
      if (priceFilter === 'paid' && venue.isFree) return false;
      if (priceFilter === 'low' && (venue.priceFrom || 0) > 1000) return false;
      if (priceFilter === 'medium' && ((venue.priceFrom || 0) < 1000 || (venue.priceFrom || 0) > 3000)) return false;
      if (priceFilter === 'high' && (venue.priceFrom || 0) < 3000) return false;
    }

    // Фильтр по локации
    if (locationFilter !== 'all') {
      if (locationFilter === 'indoor' && venue.isIndoor !== true) return false;
      if (locationFilter === 'outdoor' && venue.isIndoor !== false) return false;
    }

    return true;
  });

  const formatPrice = (venue: Venue) => {
    if (venue.isFree) return 'Бесплатно';
    if (venue.priceFrom && venue.priceTo) {
      return `${venue.priceFrom}₽ - ${venue.priceTo}₽`;
    }
    if (venue.priceFrom) {
      return `от ${venue.priceFrom}₽`;
    }
    return 'Цена по запросу';
  };

  return (
    <div className="flex gap-8">
      {/* Левая панель фильтров */}
      <div className="w-80 flex-shrink-0">
        {filtersLoading ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : filtersError ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <p className="text-red-600">Ошибка загрузки фильтров: {filtersError}</p>
          </div>
        ) : (
          <DynamicFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {/* Основной контент */}
      <div className="flex-1">
        {/* Category Header */}
        <div className={`${categoryInfo.bgColor} ${categoryInfo.borderColor} border-2 rounded-2xl p-8 mb-8`}>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-4xl">{categoryInfo.emoji}</div>
            <div>
              <h1 className={`text-3xl font-bold ${categoryInfo.textColor}`}>
                {categoryInfo.name}
              </h1>
              <p className={`${categoryInfo.textColor} opacity-80`}>
                {categoryInfo.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className={`${categoryInfo.textColor} opacity-80`}>
              {filteredVenues.length} мест найдено
            </div>
            <div className={`${categoryInfo.textColor} opacity-80`}>
              в {cityName}
            </div>
          </div>
        </div>

        {/* Subcategory Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedSubcategory === sub.id
                    ? `${categoryInfo.bgColor} ${categoryInfo.textColor} border ${categoryInfo.borderColor}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub.name} {sub.popular && <span className="text-yellow-500">⭐</span>} ({sub.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              citySlug={citySlug}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryInfo.emoji}</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Места не найдены
            </h3>
            <p className="text-gray-600 mb-6">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubcategory('all');
                setPriceFilter('all');
                setLocationFilter('all');
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCard({ 
  venue, 
  citySlug, 
  formatPrice 
}: { 
  venue: Venue; 
  citySlug: string;
  formatPrice: (venue: Venue) => string;
}) {
  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.slug}`}
      className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-violet-300"
    >
      <div className="flex h-80">
        {/* Левая часть - изображение с каруселью */}
        <div className="w-[32rem] h-80 flex-shrink-0 relative overflow-hidden">
          <VenueImageCarousel venueId={venue.id} />
          
          {/* Бейдж */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded">
              {venue.id % 2 === 0 ? 'Подарок' : 'Новинка'}
            </span>
          </div>
        </div>

        {/* Правая часть - информация */}
        <div className="flex-1 px-6 pb-6 pt-0 flex flex-col justify-between">
          {/* Название места с кнопкой избранного */}
          <div className="flex items-center justify-between mb-3 h-20">
            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-violet-600 transition-colors flex-1">
              {venue.title}
            </h3>
            <button className="text-slate-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Рейтинг и отзывы */}
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center text-red-500">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span className="font-medium">4.{(venue.id % 3) + 5}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span>{venue._count.reviews} оценок</span>
            <span className="text-slate-400">•</span>
            <span>{venue._count.bookings} отзывов</span>
          </div>

          {/* Основные характеристики */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 mr-2 text-slate-500" />
              <span>2 часа</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Building className="w-4 h-4 mr-2 text-slate-500" />
              <span>{(venue.id % 50) + 30} кв.м</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 mr-2 text-slate-500" />
              <span>до {(venue.id % 30) + 10} чел.</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 bg-violet-50 px-3 py-2 rounded-lg text-center">
              {formatPrice(venue)}
            </div>
          </div>

          {/* Удобства */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Coffee className="w-3 h-3 mr-1" />
                Кухня
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Coffee className="w-3 h-3 mr-1" />
                Посуда
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Camera className="w-3 h-3 mr-1" />
                Фото зона
              </span>
            </div>
          </div>

          {/* Адрес и карта */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              <span className="truncate">{venue.address || venue.district || 'Адрес не указан'}</span>
            </div>
            <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
              <MapPin className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
