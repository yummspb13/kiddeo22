'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Clock, Users, Filter, ChevronDown, Heart, Building, Camera, Coffee } from 'lucide-react';
import { VenueImageCarousel } from '@/components/VenueImageCarousel';
import { getPriceDisplay } from '@/utils/priceDisplay';

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
  images: string | null;
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
  searchParams: { [key: string]: string | string[] | undefined };
};


export default function VenuesClient({ initialVenues, categories, city, searchParams }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'standard' | 'premium'>('standard');

  // Фильтрация мест
  const filteredVenues = useMemo(() => {
    return initialVenues.filter((venue) => {
      // Поиск по названию и описанию
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          venue.title.toLowerCase().includes(query) ||
          venue.description?.toLowerCase().includes(query) ||
          venue.vendor.displayName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Фильтр по категории
      if (selectedCategory !== 'all') {
        if (venue.category.slug !== selectedCategory) return false;
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
  }, [initialVenues, searchQuery, selectedCategory, priceFilter, locationFilter]);

  const formatPrice = (venue: Venue) => {
    const priceInfo = getPriceDisplay(venue);
    return priceInfo.mainText;
  };

  return (
    <div className="flex gap-8">
      {/* Левая панель фильтров */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-24">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Параметры подбора
          </h3>

          {/* Поиск */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Название места..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Дата и время */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Дата и время праздника
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Начнем в</label>
                <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                  <option>10:00</option>
                  <option>11:00</option>
                  <option>12:00</option>
                  <option>13:00</option>
                  <option>14:00</option>
                  <option>15:00</option>
                  <option>16:00</option>
                  <option>17:00</option>
                  <option>18:00</option>
                  <option>19:00</option>
                  <option>20:00</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Закончим в</label>
                <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                  <option>12:00</option>
                  <option>13:00</option>
                  <option>14:00</option>
                  <option>15:00</option>
                  <option>16:00</option>
                  <option>17:00</option>
                  <option>18:00</option>
                  <option>19:00</option>
                  <option>20:00</option>
                  <option>21:00</option>
                  <option>22:00</option>
                </select>
              </div>
            </div>
          </div>

          {/* Район */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Район
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option>Любой</option>
              <option>Центральный</option>
              <option>Адмиралтейский</option>
              <option>Василеостровский</option>
              <option>Выборгский</option>
              <option>Калининский</option>
              <option>Кировский</option>
              <option>Колпинский</option>
              <option>Красногвардейский</option>
              <option>Красносельский</option>
              <option>Кронштадтский</option>
              <option>Курортный</option>
              <option>Московский</option>
              <option>Невский</option>
              <option>Петроградский</option>
              <option>Петродворцовый</option>
              <option>Приморский</option>
              <option>Пушкинский</option>
              <option>Фрунзенский</option>
            </select>
          </div>

          {/* Популярные фильтры */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              Популярные фильтры
              <ChevronDown className="w-4 h-4 ml-1" />
            </h4>
            
            {/* Цена за час */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Цена 1 часа аренды</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">До 1000₽</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">1000₽ - 2000₽</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">2000₽ - 3000₽</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">От 3000₽</span>
                </label>
              </div>
            </div>

            {/* Вместимость */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Вместимость</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">До 10 человек</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">10-20 человек</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">20-50 человек</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">От 50 человек</span>
                </label>
              </div>
            </div>

            {/* Площадь */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Площадь (кв.м)</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">До 30 кв.м</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">30-50 кв.м</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">50-100 кв.м</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">От 100 кв.м</span>
                </label>
              </div>
            </div>

            {/* Рейтинг */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Рейтинг по отзывам</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">4.5+ звезд</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">4.0+ звезд</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">3.5+ звезд</span>
                </label>
              </div>
            </div>
          </div>

          {/* Дополнительно */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
              Дополнительно
              <ChevronDown className="w-4 h-4 ml-1" />
            </h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Зонирование</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Что еще есть</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Условия</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Правая область с результатами */}
      <div className="flex-1">
        {/* Заголовок результатов */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Найдено {filteredVenues.length} подходящих вариантов
          </h2>
        </div>

        {/* Сетка мест */}
        <div className="space-y-6">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              city={city}
              viewMode={viewMode}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Места не найдены
            </h3>
            <p className="text-slate-600">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCard({ 
  venue, 
  city, 
  viewMode, 
  formatPrice 
}: { 
  venue: Venue; 
  city: City; 
  viewMode: 'standard' | 'premium';
  formatPrice: (venue: Venue) => string;
}) {
  // Горизонтальный формат карточки как на изображении
  return (
    <Link
      href={`/city/${city.slug}/venue/${venue.slug}`}
      className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-violet-300"
    >
      <div className="flex h-80">
        {/* Левая часть - изображение с каруселью */}
        <div className="w-[32rem] h-80 flex-shrink-0 relative overflow-hidden bg-gray-100 rounded-xl" style={{ height: '320px', minHeight: '320px', maxHeight: '320px' }}>
          <VenueImageCarousel 
            venueId={venue.id} 
            images={venue.images || []} 
          />
          
          {/* Бейдж */}
          <div className="absolute bottom-2 left-2 z-20">
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

