'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Clock, Users, Filter, ChevronDown, Heart, Building, Camera, Coffee } from 'lucide-react';
import { VenueImageCarousel } from '@/components/VenueImageCarousel';
import DynamicFilters from '@/components/DynamicFilters';
import { useFilterConfig } from '@/hooks/useFilterConfig';

type Venue = {
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
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type City = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  initialVenues: Venue[];
  categories: Category[];
  city: City;
  searchParams: Record<string, string | string[] | undefined>;
};

export default function VenuesClientWithDynamicFilters({ initialVenues, categories, city, searchParams }: Props) {
  const [venues, setVenues] = useState(initialVenues);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState('relevance');

  // Получаем конфигурацию фильтров для основного раздела "Места"
  const { filters, loading: filtersLoading, error: filtersError } = useFilterConfig({
    scope: 'MAIN_VENUES',
    cityId: city.id
  });

  // Фильтрация и сортировка
  const filteredVenues = useMemo(() => {
    let filtered = venues;

    // Поиск по названию
    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Применяем динамические фильтры
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value) return;

      switch (key) {
        case 'search':
          if (typeof value === 'string' && value.trim()) {
            filtered = filtered.filter(venue =>
              venue.title.toLowerCase().includes(value.toLowerCase()) ||
              venue.description?.toLowerCase().includes(value.toLowerCase())
            );
          }
          break;

        case 'district':
          if (value !== 'Любой') {
            filtered = filtered.filter(venue => venue.district === value);
          }
          break;

        case 'price_0': // До 1000₽
          if (value) {
            filtered = filtered.filter(venue => 
              venue.priceFrom !== null && venue.priceFrom <= 1000
            );
          }
          break;

        case 'price_1': // 1000₽ - 2000₽
          if (value) {
            filtered = filtered.filter(venue => 
              venue.priceFrom !== null && venue.priceFrom >= 1000 && venue.priceFrom <= 2000
            );
          }
          break;

        case 'price_2': // 2000₽ - 3000₽
          if (value) {
            filtered = filtered.filter(venue => 
              venue.priceFrom !== null && venue.priceFrom >= 2000 && venue.priceFrom <= 3000
            );
          }
          break;

        case 'price_3': // От 3000₽
          if (value) {
            filtered = filtered.filter(venue => 
              venue.priceFrom !== null && venue.priceFrom >= 3000
            );
          }
          break;

        case 'capacity_0': // До 10 человек
          if (value) {
            // Здесь нужно добавить поле capacity в модель Venue
            // filtered = filtered.filter(venue => venue.capacity <= 10);
          }
          break;

        case 'area_0': // До 30 кв.м
          if (value) {
            // Здесь нужно добавить поле area в модель Venue
            // filtered = filtered.filter(venue => venue.area <= 30);
          }
          break;

        case 'rating_0': // 4.5+ звезд
          if (value) {
            // Здесь нужно добавить поле rating в модель Venue
            // filtered = filtered.filter(venue => venue.rating >= 4.5);
          }
          break;

        case 'amenities_0': // Кухня
          if (value) {
            // Здесь нужно добавить поле amenities в модель Venue
            // filtered = filtered.filter(venue => venue.amenities?.includes('Кухня'));
          }
          break;
      }
    });

    // Сортировка
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'reviews':
        filtered.sort((a, b) => b._count.reviews - a._count.reviews);
        break;
      default:
        // relevance - по умолчанию
        break;
    }

    return filtered;
  }, [venues, searchQuery, filterValues, sortBy]);

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilterValues({});
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filterValues).filter(value => 
    value !== '' && value !== false && value !== null && value !== undefined
  ).length;

  return (
    <div className="flex gap-8">
      {/* Левая панель с динамическими фильтрами */}
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
        {/* Поиск и сортировка */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск мест..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Фильтры
                {activeFiltersCount > 0 && (
                  <span className="bg-violet-600 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="relevance">По релевантности</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
                <option value="name">По названию</option>
                <option value="reviews">По количеству отзывов</option>
              </select>
            </div>
          </div>

          {/* Активные фильтры */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-slate-600">Активные фильтры:</span>
              {Object.entries(filterValues).map(([key, value]) => {
                if (!value || value === false) return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800"
                  >
                    {key}: {typeof value === 'boolean' ? 'Да' : value}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="ml-1 hover:text-violet-600"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Очистить все
              </button>
            </div>
          )}
        </div>

        {/* Результаты */}
        <div className="mb-4">
          <p className="text-slate-600">
            Найдено <span className="font-semibold">{filteredVenues.length}</span> мест
            {searchQuery && ` по запросу "${searchQuery}"`}
          </p>
        </div>

        {/* Список мест */}
        <div className="space-y-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} city={city} />
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Места не найдены</h3>
            <p className="text-slate-600 mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент карточки места (упрощенная версия)
function VenueCard({ venue, city }: { venue: Venue; city: City }) {
  return (
    <Link
      href={`/city/${city.slug}/venue/${venue.slug}`}
      className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-violet-300"
    >
      <div className="flex h-80">
        <div className="w-[32rem] h-80 flex-shrink-0 relative overflow-hidden">
          <div className="relative group">
            <div className="w-full h-full relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=512&h=320&fit=crop&crop=center&auto=format&q=80"
                alt={venue.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 px-6 pb-6 pt-0 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 h-20">
            <h3 className="text-xl font-semibold text-slate-900 group-hover:text-violet-600 transition-colors flex-1">
              {venue.title}
            </h3>
            <button className="text-slate-400 hover:text-red-500 transition-colors ml-4 flex-shrink-0">
              <Heart className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center text-red-500">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span className="font-medium">4.{Math.floor(venue.id % 3) + 5}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span>{venue._count.reviews} оценок</span>
            <span className="text-slate-400">•</span>
            <span>{venue._count.bookings} бронирований</span>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              <span className="truncate">{venue.address || 'Адрес не указан'}</span>
            </div>
            <div className="text-right">
              {venue.isFree ? (
                <span className="text-green-600 font-semibold">Бесплатно</span>
              ) : (
                <span className="text-slate-900 font-semibold">
                  {venue.priceFrom && venue.priceTo 
                    ? `${venue.priceFrom}₽ - ${venue.priceTo}₽`
                    : venue.priceFrom 
                    ? `от ${venue.priceFrom}₽`
                    : 'Цена по запросу'
                  }
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
