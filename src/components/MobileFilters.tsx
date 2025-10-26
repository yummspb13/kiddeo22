'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Check } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import { ageBuckets, priceBuckets } from '@/config/afishaFilters';

interface MobileFiltersProps {
  categoryStats: Array<{ category: string | null; count: number }>;
  ageStats: Array<{ age: string | null; count: number }>;
  priceStats: Array<{ price: string | null; count: number }>;
  quickFilters: Array<{ id: number; name: string; order: number }>;
  citySlug: string;
}

export default function MobileFilters({
  categoryStats,
  ageStats,
  priceStats,
  quickFilters,
  citySlug
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Подсчитываем активные фильтры
  useEffect(() => {
    if (!searchParams) return;
    
    let count = 0;
    
    // Категории
    const categories = searchParams.get('categories')?.split(',') || [];
    count += categories.length;
    
    // Возраст
    const ages = searchParams.get('age')?.split(',') || [];
    count += ages.length;
    
    // Цена
    const prices = searchParams.get('price')?.split(',') || [];
    count += prices.length;
    
    // Быстрые фильтры
    const quickFilterIds = searchParams.get('quickFilters')?.split(',') || [];
    count += quickFilterIds.length;
    
    // Другие фильтры
    if (searchParams.get('free') === '1') count++;
    if (searchParams.get('dateFrom')) count++;
    if (searchParams.get('dateTo')) count++;
    
    setActiveFiltersCount(count);
  }, [searchParams]);

  const clearAllFilters = () => {
    const url = new URL(window.location.href);
    // Удаляем все параметры фильтрации
    const filterParams = ['categories', 'ages', 'prices', 'quickFilters', 'free', 'dateFrom', 'dateTo'];
    filterParams.forEach(param => url.searchParams.delete(param));
    router.push(url.pathname + url.search, { scroll: false });
    setIsOpen(false);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const url = new URL(window.location.href);
    const categoriesParam = url.searchParams.get('categories');
    const currentCategories: string[] = categoriesParam ? categoriesParam.split(',') : [];
    
    let newCategories: string[];
    if (checked) {
      newCategories = [...currentCategories, category];
    } else {
      newCategories = currentCategories.filter(c => c !== category);
    }
    
    if (newCategories.length > 0) {
      url.searchParams.set('categories', newCategories.join(','));
    } else {
      url.searchParams.delete('categories');
    }
    
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleAgeChange = (age: string, checked: boolean) => {
    const url = new URL(window.location.href);
    const ageParam = url.searchParams.get('age');
    const currentAges: string[] = ageParam ? ageParam.split(',') : [];
    
    let newAges: string[];
    if (checked) {
      newAges = [...currentAges, age];
    } else {
      newAges = currentAges.filter(a => a !== age);
    }
    
    if (newAges.length > 0) {
      url.searchParams.set('age', newAges.join(','));
    } else {
      url.searchParams.delete('age');
    }
    
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handlePriceChange = (price: string, checked: boolean) => {
    const url = new URL(window.location.href);
    const priceParam = url.searchParams.get('price');
    const currentPrices: string[] = priceParam ? priceParam.split(',') : [];
    
    let newPrices: string[];
    if (checked) {
      newPrices = [...currentPrices, price];
    } else {
      newPrices = currentPrices.filter(p => p !== price);
    }
    
    if (newPrices.length > 0) {
      url.searchParams.set('price', newPrices.join(','));
    } else {
      url.searchParams.delete('price');
    }
    
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleQuickFilterChange = (filterId: number, checked: boolean) => {
    const url = new URL(window.location.href);
    const quickFiltersParam = url.searchParams.get('quickFilters');
    const currentFilters: string[] = quickFiltersParam ? quickFiltersParam.split(',') : [];
    
    let newFilters: string[];
    if (checked) {
      newFilters = [...currentFilters, filterId.toString()];
    } else {
      newFilters = currentFilters.filter(f => f !== filterId.toString());
    }
    
    if (newFilters.length > 0) {
      url.searchParams.set('quickFilters', newFilters.join(','));
    } else {
      url.searchParams.delete('quickFilters');
    }
    
    router.push(url.pathname + url.search, { scroll: false });
  };

  const handleFreeToggle = () => {
    if (!searchParams) return;
    
    const url = new URL(window.location.href);
    if (searchParams.get('free') === '1') {
      url.searchParams.delete('free');
    } else {
      url.searchParams.set('free', '1');
    }
    router.push(url.pathname + url.search, { scroll: false });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors md:hidden min-h-touch min-w-touch"
        aria-label="Открыть фильтры"
      >
        <Filter className="w-6 h-6" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Filters Drawer */}
      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Фильтры"
        position="bottom"
        size="lg"
        className="!bottom-[-48px]"
      >
        {/* Scrollable Content */}
        <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
          {/* Header with Clear All */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 text-sm font-medium hover:underline transition-colors"
              >
                Очистить все
              </button>
            )}
          </div>

          {/* Active Filters Badges */}
          {activeFiltersCount > 0 && (
            <div className="pb-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Активные фильтры</h3>
              <div className="flex flex-wrap gap-2">
                {/* Categories */}
                {searchParams?.get('categories')?.split(',').map(category => (
                  <button
                    key={`category-${category}`}
                    onClick={() => handleCategoryChange(category, false)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <span>{category}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}

                {/* Ages */}
                {searchParams?.get('age')?.split(',').map(age => (
                  <button
                    key={`age-${age}`}
                    onClick={() => handleAgeChange(age, false)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors"
                  >
                    <span>{ageBuckets.find(bucket => bucket.slug === age)?.label || age}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}

                {/* Prices */}
                {searchParams?.get('price')?.split(',').map(price => (
                  <button
                    key={`price-${price}`}
                    onClick={() => handlePriceChange(price, false)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full hover:bg-purple-200 transition-colors"
                  >
                    <span>{priceBuckets.find(bucket => bucket.slug === price)?.label || price}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}

                {/* Quick Filters */}
                {searchParams?.get('quickFilters')?.split(',').map(filterId => {
                  const filter = quickFilters.find(f => f.id.toString() === filterId);
                  return filter ? (
                    <button
                      key={`quick-${filterId}`}
                      onClick={() => handleQuickFilterChange(parseInt(filterId), false)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full hover:bg-orange-200 transition-colors"
                    >
                      <span>{filter.name}</span>
                      <X className="w-3 h-3" />
                    </button>
                  ) : null;
                })}

                {/* Free Filter */}
                {searchParams?.get('free') === '1' && (
                  <button
                    onClick={handleFreeToggle}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full hover:bg-red-200 transition-colors"
                  >
                    <span>Бесплатно</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Filters */}
          {quickFilters.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1.5">Быстрые фильтры</h3>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => {
                  const isActive = searchParams?.get('quickFilters')?.split(',').includes(filter.id.toString()) || false;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => handleQuickFilterChange(filter.id, !isActive)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Free Events Toggle */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1.5">Тип события</h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={searchParams?.get('free') === '1'}
                  onChange={handleFreeToggle}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  searchParams?.get('free') === '1'
                    ? 'bg-red-600 border-red-600'
                    : 'bg-white border-gray-300 hover:border-red-400'
                }`}>
                  {searchParams?.get('free') === '1' && (
                    <Check className="w-3 h-3 text-white m-0.5" />
                  )}
                </div>
              </div>
              <span className="text-sm font-medium">Только бесплатные</span>
            </label>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Категории</h3>
            <div className="space-y-1">
              {categoryStats.map(({ category, count }) => {
                if (!category) return null;
                
                const currentCategories = searchParams?.get('categories')?.split(',') || [];
                const isChecked = currentCategories.includes(category);
                
                return (
                  <label key={category} className="flex items-center justify-between py-2 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCategoryChange(category, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          isChecked
                            ? 'bg-red-600 border-red-600'
                            : 'bg-white border-gray-300 hover:border-red-400'
                        }`}>
                          {isChecked && (
                            <Check className="w-3 h-3 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <span className="text-xs text-gray-500">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Age Groups */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Возраст</h3>
            <div className="space-y-1">
              {ageStats.map(({ age, count }) => {
                if (!age) return null;
                
                const currentAges = searchParams?.get('age')?.split(',') || [];
                const isChecked = currentAges.includes(age);
                
                return (
                  <label key={age} className="flex items-center justify-between py-2 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleAgeChange(age, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          isChecked
                            ? 'bg-red-600 border-red-600'
                            : 'bg-white border-gray-300 hover:border-red-400'
                        }`}>
                          {isChecked && (
                            <Check className="w-3 h-3 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {ageBuckets.find(bucket => bucket.slug === age)?.label || age}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Ranges */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Цена</h3>
            <div className="space-y-1">
              {priceStats.map(({ price, count }) => {
                if (!price) return null;
                
                const currentPrices = searchParams?.get('price')?.split(',') || [];
                const isChecked = currentPrices.includes(price);
                
                return (
                  <label key={price} className="flex items-center justify-between py-2 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handlePriceChange(price, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          isChecked
                            ? 'bg-red-600 border-red-600'
                            : 'bg-white border-gray-300 hover:border-red-400'
                        }`}>
                          {isChecked && (
                            <Check className="w-3 h-3 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {priceBuckets.find(bucket => bucket.slug === price)?.label || price}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Apply Button */}
        <div className="p-4 pt-3 border-t border-gray-100" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-touch shadow-sm"
          >
            Применить фильтры
          </button>
        </div>
      </MobileDrawer>
    </>
  );
}
