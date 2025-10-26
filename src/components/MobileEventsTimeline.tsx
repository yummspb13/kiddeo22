'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Search, Filter } from 'lucide-react';
import MobileFilters from './MobileFilters';
import { getCityWeekend } from '@/lib/timezone';

interface MobileEventsTimelineProps {
  categoryStats: Array<{ category: string | null; count: number }>;
  ageStats: Array<{ label: string; count: number }>;
  priceStats: Array<{ label: string; count: number }>;
  quickFilters: Array<{ id: number; label: string; order: number }>;
  citySlug: string;
}

export default function MobileEventsTimeline({
  categoryStats,
  ageStats,
  priceStats,
  quickFilters,
  citySlug
}: MobileEventsTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Инициализируем поисковый запрос из URL
  useEffect(() => {
    const q = searchParams?.get('q');
    if (q !== searchQuery) {
      setSearchQuery(q || '');
    }
  }, [searchParams, searchQuery]);

  // Функция для проверки, является ли диапазон дат выходными
  const isWeekendRange = (dateFrom: string, dateTo: string) => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const fromDay = fromDate.getDay();
    const toDay = toDate.getDay();
    
    // Проверяем, что это суббота-воскресенье (6-0)
    return fromDay === 6 && toDay === 0;
  };
  
  // Получаем выбранную дату из URL
  const selectedDateFrom = searchParams?.get('dateFrom');
  const selectedDateTo = searchParams?.get('dateTo');
  const isDateSelected = selectedDateFrom && selectedDateTo && selectedDateFrom === selectedDateTo;
  
  // Проверяем, активна ли кнопка "Сегодня"
  const todayDate = new Date().toISOString().split('T')[0];
  const isTodayActive = isDateSelected && selectedDateFrom === todayDate && selectedDateTo === todayDate;
  
  // Проверяем, активен ли фильтр выходных
  const isWeekendActive = selectedDateFrom && selectedDateTo && 
    isWeekendRange(selectedDateFrom, selectedDateTo);

  // Получаем активные фильтры
  const isFreeActive = searchParams?.get('free') === '1';

  const handleDateClick = (urlDate: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('dateFrom', urlDate);
    url.searchParams.set('dateTo', urlDate);
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleWeekendClick = () => {
    const url = new URL(window.location.href);
    if (isWeekendActive) {
      url.searchParams.delete('dateFrom');
      url.searchParams.delete('dateTo');
    } else {
      // Получаем выходные в часовом поясе города
      const { saturday, sunday } = getCityWeekend(citySlug);
      url.searchParams.set('dateFrom', saturday);
      url.searchParams.set('dateTo', sunday);
    }
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (searchQuery.trim()) {
      url.searchParams.set('q', searchQuery.trim());
    } else {
      url.searchParams.delete('q');
    }
    router.push(url.pathname + url.search, { scroll: false });
  };

  const clearSearch = () => {
    setSearchQuery('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Генерируем даты для горизонтального скролла
  const generateDateButtons = () => {
    const dates: Array<{
      date: Date;
      label: string;
      isActive: boolean;
      isToday: boolean;
    }> = [];
    const today = new Date();
    
    // Сегодня
    dates.push({
      date: today,
      label: 'Сегодня',
      isActive: !!isTodayActive,
      isToday: true
    });
    
    // Следующие 7 дней
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date,
        label: date.toLocaleDateString('ru', { weekday: 'short', day: 'numeric' }),
        isActive: Boolean(isDateSelected && selectedDateFrom === date.toISOString().split('T')[0]),
        isToday: false
      });
    }
    
    return dates;
  };

  const dateButtons = generateDateButtons();


  return (
    <div className="md:hidden">
      {/* Search Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200s py-3">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Поиск событий..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
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

      {/* Date Timeline - Horizontal Scroll */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
          {/* Сегодня */}
          <button
            onClick={() => handleDateClick(todayDate)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-w-[120px] text-center ${
              isTodayActive
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Сегодня
          </button>

          {/* Выходные */}
          <button
            onClick={handleWeekendClick}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-w-[90px] text-center ${
              isWeekendActive
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Выходные
          </button>

          {/* Остальные даты */}
          {dateButtons.slice(1).map(({ date, label, isActive }) => (
            <button
              key={date.toISOString().split('T')[0]}
              onClick={() => handleDateClick(date.toISOString().split('T')[0])}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-w-[90px] text-center ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* All Filters - Combined */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {/* Бесплатные события */}
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              if (isFreeActive) {
                url.searchParams.delete('free');
              } else {
                url.searchParams.set('free', '1');
              }
              router.push(url.pathname + url.search, { scroll: false });
            }}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              isFreeActive
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎁 Бесплатно
          </button>

          {/* В эти выходные */}
          <button
            onClick={handleWeekendClick}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              isWeekendActive
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔥 В эти выходные
          </button>

          {/* Быстрые фильтры */}
          {quickFilters.map((filter) => {
            const isActive = searchParams?.get('quickFilters')?.split(',').includes(filter.id.toString()) || false;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  const url = new URL(window.location.href);
                  const quickFiltersParam = url.searchParams.get('quickFilters');
                  const currentFilters: string[] = quickFiltersParam ? quickFiltersParam.split(',') : [];
                  
                  let newFilters: string[];
                  if (isActive) {
                    newFilters = currentFilters.filter(f => f !== filter.id.toString());
                  } else {
                    newFilters = [...currentFilters, filter.id.toString()];
                  }
                  
                  if (newFilters.length > 0) {
                    url.searchParams.set('quickFilters', newFilters.join(','));
                  } else {
                    url.searchParams.delete('quickFilters');
                  }
                  
                  router.push(url.pathname + url.search, { scroll: false });
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {(filter.label && filter.label.trim()) || 
                 'Пушкинская карта' || 
                 `Фильтр ${filter.id}` || 
                 'Фильтр'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Filters Component */}
      <MobileFilters
        categoryStats={categoryStats}
        ageStats={ageStats.map(stat => ({ age: stat.label, count: stat.count }))}
        priceStats={priceStats.map(stat => ({ price: stat.label, count: stat.count }))}
        quickFilters={quickFilters.map(filter => ({ id: filter.id, name: filter.label, order: filter.order }))}
        citySlug={citySlug}
      />
    </div>
  );
}
