'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Heart, Share2, Filter } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  priceFrom: number | null;
  priceTo: number | null;
  district: string | null;
  metro: string | null;
  coverImage: string | null;
  additionalImages: string[];
  vendor: {
    id: string;
    displayName: string;
  };
  subcategory: {
    id: string;
    name: string;
    slug: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

interface MobileVenuesListProps {
  citySlug: string;
  initialVenues: Venue[];
  searchParams: Record<string, string | string[] | undefined>;
}

export default function MobileVenuesList({ 
  citySlug, 
  initialVenues, 
  searchParams 
}: MobileVenuesListProps) {
  const [venues, setVenues] = useState<Venue[]>(initialVenues || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false,
    totalVenues: initialVenues?.length || 0,
  });
  const routerSearchParams = useSearchParams();

  // Pull to refresh functionality
  const { elementRef, isRefreshing, refresherProps } = usePullToRefresh({
    onRefresh: async () => {
      await loadVenues(true);
    },
    threshold: 100,
  });

  const loadVenues = async (force = false) => {
    if (loading && !force) return;
    
    if (!citySlug) {
      console.error('MobileVenuesList: citySlug is not defined');
      return;
    }
    
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
      
      const url = `/api/venues?city=${citySlug}&${params.toString()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, hasMore: false, totalVenues: 0 });
      } else {
        console.error('MobileVenuesList: Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce для loadVenues
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVenues();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchParams, citySlug, routerSearchParams]);

  const formatPrice = (priceFrom: number | null, priceTo: number | null) => {
    if (priceFrom === null && priceTo === null) return 'Цена не указана';
    if (priceFrom === null) return `до ${priceTo} ₽`;
    if (priceTo === null) return `от ${priceFrom} ₽`;
    if (priceFrom === priceTo) return `${priceFrom} ₽`;
    return `${priceFrom} - ${priceTo} ₽`;
  };

  const handleFavorite = (venueId: string) => {
    // TODO: Implement favorite functionality
    console.log('Toggle favorite for venue:', venueId);
  };

  const handleShare = (venue: Venue) => {
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: venue.description,
        url: `/venue/${venue.slug}`,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/venue/${venue.slug}`);
    }
  };

  return (
    <div ref={elementRef} className="min-h-screen bg-gray-50">
      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div {...refresherProps}>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="ml-2 text-sm text-gray-600">Обновление...</span>
          </div>
        </div>
      )}

      {/* Venues List */}
      <div className="space-y-4 p-4">
        {venues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Venue Image */}
            <div className="relative h-48 bg-gray-200">
              {venue.coverImage ? (
                <Image
                  src={venue.coverImage}
                  alt={venue.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => handleFavorite(venue.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  aria-label="Добавить в избранное"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleShare(venue)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                  aria-label="Поделиться"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 text-gray-900 rounded-full text-sm font-medium">
                  {venue.subcategory.category.name}
                </span>
              </div>
            </div>

            {/* Venue Content */}
            <div className="p-4">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {venue.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {venue.description}
              </p>

              {/* Address */}
              <div className="flex items-start text-sm text-gray-500 mb-3">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{venue.address}</span>
              </div>

              {/* Metro and District */}
              {(venue.metro || venue.district) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {venue.metro && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {venue.metro}
                    </span>
                  )}
                  {venue.district && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {venue.district}
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(venue.priceFrom, venue.priceTo)}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.5</span>
                </div>
              </div>

              {/* Vendor */}
              <div className="text-xs text-gray-500 mb-4">
                от {venue.vendor.displayName}
              </div>

              {/* Action Button */}
              <Link
                href={`/venue/${venue.slug}`}
                className="block w-full bg-red-600 text-white text-center py-3 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-touch"
              >
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="p-4">
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('page', (pagination.page + 1).toString());
              window.location.href = url.toString();
            }}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 min-h-touch"
          >
            {loading ? 'Загрузка...' : `Показать еще 20 мест`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {venues.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Места не найдены</h3>
          <p className="text-gray-500 mb-4">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              // Clear all filters
              const filterParams = ['categories', 'districts', 'metro', 'priceFrom', 'priceTo', 'q'];
              filterParams.forEach(param => url.searchParams.delete(param));
              window.location.href = url.toString();
            }}
            className="text-red-600 font-medium hover:underline"
          >
            Очистить фильтры
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && venues.length > 0 && (
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
    </div>
  );
}
