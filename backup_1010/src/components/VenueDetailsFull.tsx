'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Heart,
  Share2,
  Building
} from 'lucide-react';
import Gallery from './Gallery'
import SimpleVenueReviews from './SimpleVenueReviews';
import VenueMap from './VenueMap';
import PublicQA from './PublicQA';
import PublicNews from './PublicNews';

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
  ageFrom?: number | null;
  ageTo?: number | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  district?: string | null;
  metro?: string | null;
  additionalImages?: string[];
  isFree?: boolean;
  features?: Array<{ icon?: string; text: string }>
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

export default function VenueDetailsFull({ venue, similarVenues, city }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'qa' | 'news'>('description')
  
  // Изображения с учетом тарифа (обложка + additionalImages уже ограничены на сервере)
  const galleryImages = [venue.coverImage, ...(venue as any).additionalImages || []].filter(Boolean) as string[];

  // Вычисляем средний рейтинг из реальных отзывов
  const averageRating = (() => {
    if (!venue.Review || venue.Review.length === 0) return '0.0';
    const totalRating = venue.Review.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / venue.Review.length).toFixed(1);
  })();

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[250px] overflow-hidden rounded-t-3xl max-w-7xl mx-auto px-4">
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 via-transparent to-pink-800/20"></div>
          <div 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
            className="absolute inset-0 opacity-30"
          ></div>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-ping"></div>
        
        {/* Контент */}
        <div className="relative z-10 h-full flex items-start pt-8">
          <div className="max-w-7xl mx-auto px-4 w-full">
            {/* Кнопка избранного */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={toggleFavorite}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Заголовок и информация */}
            <div className="text-white">
              <h1 className="text-5xl font-black mb-6 font-unbounded">
                {venue.name}
              </h1>
              
              
              <div className="flex items-center space-x-8 text-sm font-medium font-unbounded">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="w-6 h-6 mr-3" />
                  <span>{venue.address}</span>
                </div>
                
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-6 h-6 mr-3 fill-current text-yellow-400" />
                  <span>{averageRating} ({venue.Review?.length || 0} отзывов)</span>
                </div>
                
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Users className="w-6 h-6 mr-3" />
                  <span>
                    {venue.ageFrom != null ? `${venue.ageFrom}+ лет` : 'Возраст не указан'}
                  </span>
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
          {/* Левая колонка - Описание / Вкладки */}
          <div className="lg:col-span-2">
                      {/* Галерея изображений */}
                      <div className="mb-8 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                        <Gallery
                          images={galleryImages}
                          variant="slider"
                        />
                      </div>

            {/* Вкладки */}
            <div className="mt-10 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl transition-all duration-300">
              {/* Табы */}
              <div className="flex flex-wrap gap-2 px-4 pt-4">
                {[
                  { id: 'description', label: 'Описание' },
                  { id: 'features', label: 'Особенности' },
                  { id: 'qa', label: 'Задайте вопрос' },
                  { id: 'news', label: 'Новости' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`font-unbounded px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Контент табов */}
              <div className="p-8">
                {activeTab === 'description' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Описание</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg font-unbounded whitespace-pre-line">
                        {venue.description || 'Описание места будет добавлено позже.'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-unbounded">Особенности</h2>
                    {venue.features && venue.features.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {venue.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                              {(f.icon || '•').slice(0, 1)}
                            </span>
                            <span className="text-gray-800 text-lg font-unbounded">{f.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 font-unbounded">Информация об особенностях будет добавлена позже.</p>
                    )}
                  </div>
                )}

                {activeTab === 'qa' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Задайте вопрос</h2>
                    <PublicQA venueId={venue.id} />
                  </div>
                )}

                {activeTab === 'news' && (
                  <PublicNews venueId={venue.id} />
                )}
              </div>
            </div>

            {/* Карта */}
            {venue.lat && venue.lng && (
              <div className="mt-10 overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-8 pb-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 font-unbounded">Локация на карте</h2>
                  {venue.address && <div className="mt-1 text-lg text-gray-600 font-unbounded">{venue.address}</div>}
                </div>
                <div className="p-8 pt-0">
                  <VenueMap 
                    lat={venue.lat} 
                    lng={venue.lng} 
                    venueName={venue.name}
                    address={venue.address}
                    className="h-96"
                  />
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
                    onClick={toggleFavorite}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                      isFavorite
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-red-300'
                    } font-unbounded`}
                  >
                    <Heart className={`w-6 h-6 inline mr-3 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </button>
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300 font-unbounded">
                    <Share2 className="w-6 h-6 inline mr-3" />
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
                      <MapPin className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Адрес</div>
                      <div className="text-sm text-gray-600 font-unbounded">{venue.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Район</div>
                      <div className="text-sm text-gray-600 font-unbounded">{venue.district || 'Не указан'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Метро</div>
                      <div className="text-sm text-gray-600 font-unbounded">{venue.metro || 'Не указано'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Возраст</div>
                      <div className="text-sm text-gray-600 font-unbounded">5-12 лет</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 font-unbounded">Режим работы</div>
                      <div className="text-sm text-gray-600 font-unbounded">Ежедневно 9:00 - 21:00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Организатор */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-unbounded">Организатор</h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-2xl flex items-center justify-center">
                    <Building className="w-8 h-8 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg font-unbounded">{venue.vendor.displayName}</div>
                    <div className="text-sm text-gray-500 font-unbounded">{venue.subcategory.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Отзывы на всю ширину */}
            <div className="lg:col-span-3 mt-10">
              <SimpleVenueReviews venueId={venue.id} />
            </div>
        </div>
      </div>

      {/* Похожие места */}
      <div className="mt-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">Похожие места</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {similarVenues.slice(0, 6).map((similarVenue, index) => (
            <Link key={similarVenue.id} href={`/city/${city.slug}/venue/${similarVenue.slug}`}>
              <div 
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}