'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, MapPin, Star, Heart, Share2 } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

interface CatalogItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  type: 'event' | 'venue';
  startDate?: string;
  endDate?: string;
  venue?: string;
  address?: string;
  priceFrom?: number | null;
  priceTo?: number | null;
  district?: string | null;
  metro?: string | null;
  categories?: string[];
  ageFrom?: number | null;
  ageTo?: number | null;
}

interface MobileCatalogProps {
  citySlug: string;
  initialItems: CatalogItem[];
  searchParams: Record<string, string | string[] | undefined>;
  categories: Array<{ name: string; slug: string; count: number }>;
  districts: Array<{ name: string; count: number }>;
  metroStations: Array<{ name: string; count: number }>;
}

export default function MobileCatalog({
  citySlug,
  initialItems,
  searchParams,
  categories,
  districts,
  metroStations
}: MobileCatalogProps) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const routerSearchParams = useSearchParams();

  // Подсчитываем активные фильтры
  useEffect(() => {
    let count = 0;
    
    // Категории
    const selectedCategories = routerSearchParams.get('categories')?.split(',') || [];
    count += selectedCategories.length;
    
    // Районы
    const selectedDistricts = routerSearchParams.get('districts')?.split(',') || [];
    count += selectedDistricts.length;
    
    // Метро
    const selectedMetro = routerSearchParams.get('metro')?.split(',') || [];
    count += selectedMetro.length;
    
    // Поиск
    if (routerSearchParams.get('q')) count++;
    
    setActiveFiltersCount(count);
  }, [routerSearchParams]);

  const loadItems = async (force = false) => {
    if (loading && !force) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Добавляем параметры из URL
      routerSearchParams.forEach((value, key) => {
        params.set(key, value);
      });
      
      // Добавляем параметры из пропсов
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && !routerSearchParams.has(key)) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','));
          } else {
            params.set(key, value);
          }
        }
      });
      
      const url = `/api/catalog?city=${citySlug}&${params.toString()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      } else {
        console.error('MobileCatalog: Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error loading catalog items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce для loadItems
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadItems();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchParams, citySlug, routerSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (searchQuery.trim()) {
      url.searchParams.set('q', searchQuery.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.location.href = url.toString();
  };

  const clearSearch = () => {
    setSearchQuery('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.location.href = url.toString();
  };

  const clearAllFilters = () => {
    const url = new URL(window.location.href);
    const filterParams = ['categories', 'districts', 'metro', 'q', 'type'];
    filterParams.forEach(param => url.searchParams.delete(param));
    window.location.href = url.toString();
    setIsFiltersOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (priceFrom: number | null, priceTo: number | null) => {
    if (priceFrom === null && priceTo === null) return 'Цена не указана';
    if (priceFrom === null) return `до ${priceTo} ₽`;
    if (priceTo === null) return `от ${priceFrom} ₽`;
    if (priceFrom === priceTo) return `${priceFrom} ₽`;
    return `${priceFrom} - ${priceTo} ₽`;
  };

  const formatAge = (ageFrom: number | null, ageTo: number | null) => {
    if (ageFrom === null && ageTo === null) return null;
    if (ageFrom === null) return `до ${ageTo} лет`;
    if (ageTo === null) return `от ${ageFrom} лет`;
    if (ageFrom === ageTo) return `${ageFrom} лет`;
    return `${ageFrom}-${ageTo} лет`;
  };

  const handleFavorite = (itemId: string) => {
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for item:', itemId);
  };

  const handleShare = (item: CatalogItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: `/${item.type}/${item.slug}`,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/${item.type}/${item.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск событий и мест..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Button */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors min-h-touch"
        >
          <Filter className="w-5 h-5 mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4 p-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Item Image */}
            <div className="relative h-48 bg-gray-200">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  {item.type === 'event' ? (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <MapPin className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => handleFavorite(item.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  aria-label="Добавить в избранное"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleShare(item)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  aria-label="Поделиться"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Type badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.type === 'event' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {item.type === 'event' ? 'Событие' : 'Место'}
                </span>
              </div>
            </div>

            {/* Item Content */}
            <div className="p-4">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Event specific info */}
              {item.type === 'event' && item.startDate && (
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(item.startDate)}</span>
                </div>
              )}

              {/* Venue specific info */}
              {item.type === 'venue' && item.address && (
                <div className="flex items-start text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{item.address}</span>
                </div>
              )}

              {/* Metro and District */}
              {(item.metro || item.district) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.metro && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {item.metro}
                    </span>
                  )}
                  {item.district && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {item.district}
                    </span>
                  )}
                </div>
              )}

              {/* Age and Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {formatAge(item.ageFrom, item.ageTo) && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {formatAge(item.ageFrom, item.ageTo)}
                  </span>
                )}
                {item.categories?.slice(0, 2).map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {item.categories && item.categories.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{item.categories.length - 2}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(item.priceFrom, item.priceTo)}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.5</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/${item.type}/${item.slug}`}
                className="block w-full bg-red-600 text-white text-center py-3 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-touch"
              >
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ничего не найдено</h3>
          <p className="text-gray-500 mb-4">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
          <button
            onClick={clearAllFilters}
            className="text-red-600 font-medium hover:underline"
          >
            Очистить фильтры
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && items.length > 0 && (
        <div className="p-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Drawer */}
      <MobileDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        title="Фильтры"
        position="bottom"
        size="lg"
      >
        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Header with Clear All */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Фильтры</h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 text-sm font-medium hover:underline"
              >
                Очистить все
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Категории</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map((category) => {
                const isChecked = routerSearchParams.get('categories')?.split(',').includes(category.slug) || false;
                return (
                  <label key={category.slug} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const url = new URL(window.location.href);
                          const currentCategories = url.searchParams.get('categories')?.split(',') || [];
                          let newCategories: string[];
                          if (e.target.checked) {
                            newCategories = [...currentCategories, category.slug];
                          } else {
                            newCategories = currentCategories.filter(c => c !== category.slug);
                          }
                          if (newCategories.length > 0) {
                            url.searchParams.set('categories', newCategories.join(','));
                          } else {
                            url.searchParams.delete('categories');
                          }
                          window.location.href = url.toString();
                        }}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">({category.count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Districts */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Районы</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {districts.map((district) => {
                const isChecked = routerSearchParams.get('districts')?.split(',').includes(district.name) || false;
                return (
                  <label key={district.name} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const url = new URL(window.location.href);
                          const currentDistricts = url.searchParams.get('districts')?.split(',') || [];
                          let newDistricts: string[];
                          if (e.target.checked) {
                            newDistricts = [...currentDistricts, district.name];
                          } else {
                            newDistricts = currentDistricts.filter(d => d !== district.name);
                          }
                          if (newDistricts.length > 0) {
                            url.searchParams.set('districts', newDistricts.join(','));
                          } else {
                            url.searchParams.delete('districts');
                          }
                          window.location.href = url.toString();
                        }}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium">{district.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">({district.count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Metro Stations */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Метро</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {metroStations.map((station) => {
                const isChecked = routerSearchParams.get('metro')?.split(',').includes(station.name) || false;
                return (
                  <label key={station.name} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const url = new URL(window.location.href);
                          const currentMetro = url.searchParams.get('metro')?.split(',') || [];
                          let newMetro: string[];
                          if (e.target.checked) {
                            newMetro = [...currentMetro, station.name];
                          } else {
                            newMetro = currentMetro.filter(m => m !== station.name);
                          }
                          if (newMetro.length > 0) {
                            url.searchParams.set('metro', newMetro.join(','));
                          } else {
                            url.searchParams.delete('metro');
                          }
                          window.location.href = url.toString();
                        }}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium">{station.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">({station.count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-touch"
            >
              Применить фильтры
            </button>
          </div>
        </div>
      </MobileDrawer>
    </div>
  );
}
