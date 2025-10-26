'use client';

import { useState } from 'react';
import VenueDetailsFull from '@/components/VenueDetailsFull';

type Venue = {
  id: number;
  name: string;
  slug: string;
  address: string;
  heroImage: string | null;
  coverImage: string | null;
  tariff: 'FREE' | 'SUPER' | 'MAXIMUM';
  priceFrom?: number | null;
  priceTo?: number | null;
  isFree?: boolean;
  capacity?: number | null;
  vendor: {
    id: number;
    displayName: string;
    description?: string | null;
    logo: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  subcategory: {
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
    };
  };
  _count: {
    parameters: number;
  };
  Review?: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    User_Review_userIdToUser: {
      name: string;
      image: string | null;
    };
  }>;
};

type SimilarVenue = {
  id: number;
  name: string;
  slug: string;
  address: string;
  heroImage: string | null;
  vendor: {
    displayName: string;
    logo: string | null;
  };
  subcategory: {
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
    };
  };
  _count: {
    parameters: number;
  };
};

type Props = {
  venue: Venue;
  similarVenues: SimilarVenue[];
  city: {
    id: number;
    name: string;
    slug: string;
  };
};

export default function VenueTemplateSelector({ venue, similarVenues, city }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);

  // В зависимости от тарифа выбираем разные возможности
  const getTariffFeatures = (tariff: string) => {
    switch (tariff) {
      case 'FREE':
        return {
          maxImages: 3,
          showAdvancedInfo: false,
          showContactDetails: false,
          showReviews: false,
          showVideo: false,
          showPremiumFeatures: false
        };
      case 'SUPER':
        return {
          maxImages: 10,
          showAdvancedInfo: true,
          showContactDetails: true,
          showReviews: true,
          showVideo: false,
          showPremiumFeatures: false
        };
      case 'MAXIMUM':
        return {
          maxImages: 25,
          showAdvancedInfo: true,
          showContactDetails: true,
          showReviews: true,
          showVideo: true,
          showPremiumFeatures: true
        };
      default:
        return {
          maxImages: 3,
          showAdvancedInfo: false,
          showContactDetails: false,
          showReviews: false,
          showVideo: false,
          showPremiumFeatures: false
        };
    }
  };

  const features = getTariffFeatures(venue.tariff);

  // Обогащаем данные места в зависимости от тарифа
  const enrichedVenue = {
    ...venue,
    // Для бесплатного тарифа ограничиваем количество изображений
    images: venue.heroImage ? [venue.heroImage] : [],
    // Добавляем дополнительные поля в зависимости от тарифа
    showAdvancedInfo: features.showAdvancedInfo,
    showContactDetails: features.showContactDetails,
    showReviews: features.showReviews,
    showVideo: features.showVideo,
    showPremiumFeatures: features.showPremiumFeatures,
    maxImages: features.maxImages
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section с разными стилями для разных тарифов */}
      <div className={`relative h-[250px] overflow-hidden rounded-t-3xl max-w-7xl mx-auto px-4 ${
        venue.tariff === 'FREE' ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500' :
        venue.tariff === 'SUPER' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500' :
        venue.tariff === 'MAXIMUM' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-500' :
        'bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800'
      }`}>
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20"></div>
        <div 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
          className="absolute inset-0 opacity-30"
        ></div>
        
        {/* Декоративные элементы в зависимости от тарифа */}
        {venue.tariff === 'FREE' && (
          <>
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-bounce"></div>
          </>
        )}
        {venue.tariff === 'SUPER' && (
          <>
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-blue-400/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-400/20 rounded-full animate-ping"></div>
          </>
        )}
        {venue.tariff === 'MAXIMUM' && (
          <>
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-ping"></div>
            <div className="absolute top-40 right-1/3 w-8 h-8 bg-purple-400/20 rounded-full animate-pulse"></div>
          </>
        )}
        
        {/* Контент */}
        <div className="relative z-10 h-full flex items-start pt-8">
          <div className="max-w-7xl mx-auto px-4 w-full">
            {/* Кнопка избранного */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            {/* Заголовок и информация */}
            <div className="text-white">
              <h1 className="text-5xl font-black mb-6 font-unbounded">
                {venue.name}
              </h1>
              
              {/* Тариф с разными стилями */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold font-unbounded ${
                  venue.tariff === 'FREE' ? 'bg-green-100 text-green-800' :
                  venue.tariff === 'SUPER' ? 'bg-blue-100 text-blue-800' :
                  venue.tariff === 'MAXIMUM' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {venue.tariff === 'FREE' ? '🆓 Бесплатный тариф' :
                   venue.tariff === 'SUPER' ? '⭐ Супер тариф' :
                   venue.tariff === 'MAXIMUM' ? '👑 Максимум тариф' :
                   'Тариф'}
                </span>
              </div>
              
              <div className="flex items-center space-x-8 text-sm font-medium font-unbounded">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{venue.address}</span>
                </div>
                
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-6 h-6 mr-3 fill-current text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>4.8 (12 отзывов)</span>
                </div>
                
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>5-12 лет</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Волновая граница */}
      <div className="relative -mt-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 transform rotate-180">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".8" fill="white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".9" fill="white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white"></path>
        </svg>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Левая колонка - Описание */}
          <div className="lg:col-span-2">
            {/* Главное изображение */}
            <div className="relative mb-6 group">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02]">
                <img 
                  src={venue.heroImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&crop=center&auto=format&q=80'} 
                  alt={venue.name}
                  className="w-full h-full object-cover transition-all duration-700"
                />
              </div>
            </div>

            {/* Описание */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Описание</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg font-unbounded">
                  {venue.vendor.description || 'Описание места будет добавлено позже.'}
                </p>
              </div>
            </div>

            {/* Дополнительные возможности в зависимости от тарифа */}
            {features.showAdvancedInfo && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Дополнительная информация</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2 font-unbounded">Особенности</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Современное оборудование</li>
                      <li>• Опытные педагоги</li>
                      <li>• Индивидуальный подход</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-2 font-unbounded">Программы</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Развивающие занятия</li>
                      <li>• Творческие мастер-классы</li>
                      <li>• Спортивные программы</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Видео для максимум тарифа */}
            {features.showVideo && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Видео о месте</h2>
                <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-purple-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      <p className="text-gray-600 font-unbounded">Видео о месте</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - Информация */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Цена и бронирование */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="text-4xl font-black text-gray-900 mb-3 font-unbounded">
                    {venue.tariff === 'FREE' ? 'Бесплатно' : 
                     venue.tariff === 'SUPER' ? `${venue.priceFrom || 0}₽ - ${venue.priceTo || 0}₽` :
                     venue.tariff === 'MAXIMUM' ? `${venue.priceFrom || 0}₽ - ${venue.priceTo || 0}₽` :
                     'Цена по запросу'}
                  </div>
                  <div className="text-sm text-gray-500 font-unbounded">
                    {venue.tariff === 'FREE' ? 'Бесплатное место' : 'за час аренды'}
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => alert('Функция бронирования в разработке')}
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-unbounded"
                  >
                    Забронировать
                  </button>
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      isFavorite
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-red-300'
                    } font-unbounded`}
                  >
                    <svg className="w-6 h-6 inline mr-3" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </button>
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300 font-unbounded">
                    <svg className="w-6 h-6 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Поделиться
                  </button>
                </div>
              </div>

              {/* Информация о месте */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-unbounded">Информация о месте</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Адрес</div>
                      <div className="text-sm text-gray-600 font-unbounded">{venue.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Район</div>
                      <div className="text-sm text-gray-600 font-unbounded">{venue.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Возраст</div>
                      <div className="text-sm text-gray-600 font-unbounded">5-12 лет</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Режим работы</div>
                      <div className="text-sm text-gray-600 font-unbounded">Ежедневно 9:00 - 21:00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Контактная информация для супер и максимум тарифов */}
              {features.showContactDetails && (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-unbounded">Контакты</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-600 font-unbounded">{venue.vendor.phone}</span>
                    </div>
                    {venue.vendor.email && (
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 font-unbounded">{venue.vendor.email}</span>
                      </div>
                    )}
                    {venue.vendor.website && (
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <a href={venue.vendor.website} className="text-sm text-blue-600 hover:text-blue-800 font-unbounded" target="_blank" rel="noopener noreferrer">
                          {venue.vendor.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Организатор */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-unbounded">Организатор</h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg font-unbounded">{venue.vendor.displayName}</div>
                    <div className="text-sm text-gray-500 font-unbounded">{venue.subcategory.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Похожие места */}
      <div className="mt-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">Похожие места</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {similarVenues.slice(0, 6).map((similarVenue, index) => (
            <div 
              key={similarVenue.id}
              className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img 
                  src={similarVenue.heroImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&crop=center&auto=format&q=80'} 
                  alt={similarVenue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-3 text-lg font-unbounded group-hover:text-violet-600 transition-colors duration-200">{similarVenue.name}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-unbounded">{similarVenue.address}</span>
                  <span className="font-bold text-violet-600 font-unbounded">
                    {'Бесплатно'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
