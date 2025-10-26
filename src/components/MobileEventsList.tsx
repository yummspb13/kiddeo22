'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import AfishaEventCard from '@/components/AfishaEventCard';
import { declensionEvents } from '@/lib/declension';

interface Event {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  coverImage: string | null;
  venue: string | null;
  isPaid: boolean;
  minPrice?: number | null;
  ageFrom: number | null;
  ageTo: number | null;
  afishaCategory?: {
    name: string;
  } | null;
}

interface MobileEventsListProps {
  citySlug: string;
  initialEvents: Event[];
  searchParams: Record<string, string | string[] | undefined>;
}

export default function MobileEventsList({ 
  citySlug, 
  initialEvents, 
  searchParams 
}: MobileEventsListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasMore: false,
    totalEvents: initialEvents?.length || 0,
  });
  const routerSearchParams = useSearchParams();

  // Pull to refresh functionality
  const { elementRef, isRefreshing, refresherProps } = usePullToRefresh({
    onRefresh: async () => {
      await loadEvents(true);
    },
    threshold: 100,
  });

  const loadEvents = async (force = false) => {
    if (loading && !force) return;
    
    if (!citySlug) {
      console.error('MobileEventsList: citySlug is not defined');
      return;
    }
    
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') {
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
      
      const url = `/api/events?city=${citySlug}&${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Добавляем timeout для предотвращения зависания
        signal: AbortSignal.timeout(30000) // 30 секунд timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, hasMore: false, totalEvents: 0 });
      } else {
        console.error('MobileEventsList: Response not ok:', response.status);
        // Устанавливаем пустой массив при ошибке
        setEvents([]);
        setPagination({ page: 1, totalPages: 1, hasMore: false, totalEvents: 0 });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('MobileEventsList: Request was aborted');
        return;
      }
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce для loadEvents
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEvents();
    }, 300); // Увеличиваем задержку до 300ms

    return () => clearTimeout(timeoutId);
  }, [searchParams, citySlug, routerSearchParams]);


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

      {/* Events List - Using AfishaEventCard for consistent design */}
      <div className="grid grid-cols-1 gap-6 p-4">
        {events.map((event) => (
          <AfishaEventCard 
            key={event.id} 
            event={event} 
            citySlug={citySlug} 
          />
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
            {loading ? 'Загрузка...' : `Показать еще 20 ${declensionEvents(20)}`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">События не найдены</h3>
          <p className="text-gray-500 mb-4">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              // Clear all filters
              const filterParams = ['categories', 'ages', 'prices', 'quickFilters', 'free', 'dateFrom', 'dateTo', 'q'];
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
      {loading && events.length > 0 && (
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
