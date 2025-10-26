'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  Heart,
  Share2,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type Venue = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  priceFrom: number | null;
  priceTo: number | null;
  isFree: boolean;
  isIndoor: boolean | null;
  district: string | null;
  ageFrom: number | null;
  ageTo: number | null;
  bookingMode: string;
  vendor: {
    id: number;
    displayName: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  Review: Array<{
    id: number;
    rating: number;
    title: string | null;
    content: string;
    createdAt: Date;
    User_Review_userIdToUser: {
      id: number;
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    Review: number;
    bookings: number;
  };
};

type City = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  venue: Venue;
  city: City;
  similarVenues: Array<{
    id: number;
    title: string;
    slug: string;
    description: string | null;
    address: string | null;
    priceFrom: number | null;
    priceTo: number | null;
    isFree: boolean;
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
      Review: number;
      bookings: number;
    };
  }>;
};

export default function VenueDetails({ venue, city, similarVenues }: Props) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bookingMode, setBookingMode] = useState<'instant' | 'request'>('instant');

  const formatPrice = () => {
    if (venue.isFree) return 'Бесплатно';
    if (venue.priceFrom && venue.priceTo) {
      return `${venue.priceFrom}₽ - ${venue.priceTo}₽`;
    }
    if (venue.priceFrom) {
      return `от ${venue.priceFrom}₽`;
    }
    return 'Цена по запросу';
  };

  const averageRating = venue.Review.length > 0 
    ? (venue.Review.reduce((sum, review) => sum + review.rating, 0) / venue.Review.length).toFixed(1)
    : '0.0';

  const ageRange = () => {
    if (venue.ageFrom && venue.ageTo) {
      return `${venue.ageFrom}-${venue.ageTo} лет`;
    }
    if (venue.ageFrom) {
      return `от ${venue.ageFrom} лет`;
    }
    if (venue.ageTo) {
      return `до ${venue.ageTo} лет`;
    }
    return 'Любой возраст';
  };

  const displayedReviews = showAllReviews ? venue.Review : venue.Review.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">
              {venue.category.name}
            </span>
            {venue.isFree && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Бесплатно
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {venue.title}
          </h1>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{venue.address || venue.district || 'Адрес не указан'}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-amber-500" />
              <span>{averageRating} ({venue._count.Review} отзывов)</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{venue._count.bookings} записей</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-lg border ${
              isFavorited
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основной контент */}
        <div className="lg:col-span-2 space-y-8">
          {/* Изображение */}
          <div className="aspect-video bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
              <MapPin className="w-24 h-24 text-violet-300" />
            </div>

          </div>

          {/* Описание */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">О месте</h2>
            <p className="text-slate-600 leading-relaxed">
              {venue.description || 'Описание отсутствует'}
            </p>
          </div>

          {/* Детали */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Детали</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <div className="text-sm text-slate-500">Возраст</div>
                  <div className="font-medium">{ageRange()}</div>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <div className="text-sm text-slate-500">Локация</div>
                  <div className="font-medium">
                    {venue.isIndoor === true ? 'В помещении' : 
                     venue.isIndoor === false ? 'На улице' : 'Не указано'}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <div className="text-sm text-slate-500">Район</div>
                  <div className="font-medium">{venue.district || 'Не указан'}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <div className="text-sm text-slate-500">Рейтинг</div>
                  <div className="font-medium">{averageRating}/5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Отзывы */}
          {venue.Review.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Отзывы ({venue._count.Review})
                </h2>
                {venue.Review.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="flex items-center text-violet-600 hover:text-violet-700"
                  >
                    {showAllReviews ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Скрыть
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Показать все
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {review.User_Review_userIdToUser.image ? (
                          <img
                            src={review.User_Review_userIdToUser.image}
                            alt={review.User_Review_userIdToUser.name || 'Пользователь'}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-200 rounded-full mr-3" />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">
                            {review.User_Review_userIdToUser.name || 'Анонимный пользователь'}
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-amber-500 fill-current'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-slate-900 mb-1">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-slate-600">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Бронирование */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Забронировать
            </h3>
            
            <div className="text-2xl font-bold text-slate-900 mb-4">
              {formatPrice()}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Способ бронирования
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bookingMode"
                      value="instant"
                      checked={bookingMode === 'instant'}
                      onChange={(e) => setBookingMode(e.target.value as 'instant')}
                      className="mr-2"
                    />
                    <span className="text-sm">Мгновенная оплата</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bookingMode"
                      value="request"
                      checked={bookingMode === 'request'}
                      onChange={(e) => setBookingMode(e.target.value as 'request')}
                      className="mr-2"
                    />
                    <span className="text-sm">Запрос-согласование</span>
                  </label>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-95 transition-opacity">
                {bookingMode === 'instant' ? 'Забронировать сейчас' : 'Отправить запрос'}
              </button>
            </div>
          </div>

          {/* Информация о вендоре */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              О компании
            </h3>
            
            <div className="flex items-center mb-4">
              {venue.vendor.logo ? (
                <img
                  src={venue.vendor.logo}
                  alt={venue.vendor.displayName}
                  className="w-12 h-12 rounded-lg mr-3"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-200 rounded-lg mr-3" />
              )}
              <div>
                <div className="font-medium text-slate-900">
                  {venue.vendor.displayName}
                </div>
                <div className="text-sm text-slate-500">
                  {venue.category.name}
                </div>
              </div>
            </div>

            {venue.vendor.description && (
              <p className="text-sm text-slate-600 mb-4">
                {venue.vendor.description}
              </p>
            )}

            <div className="space-y-2">
              {venue.vendor.phone && (
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href={`tel:${venue.vendor.phone}`} className="hover:text-violet-600">
                    {venue.vendor.phone}
                  </a>
                </div>
              )}
              {venue.vendor.email && (
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href={`mailto:${venue.vendor.email}`} className="hover:text-violet-600">
                    {venue.vendor.email}
                  </a>
                </div>
              )}
              {venue.vendor.website && (
                <div className="flex items-center text-sm text-slate-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <a 
                    href={venue.vendor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-violet-600"
                  >
                    Сайт компании
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Похожие места */}
      {similarVenues.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Похожие места
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVenues.map((similarVenue) => (
              <Link
                key={similarVenue.id}
                href={`/city/${city.slug}/venue/${similarVenue.slug}`}
                className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-violet-300"
              >
                <div className="aspect-video bg-gradient-to-br from-violet-50 to-fuchsia-50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-violet-300" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-violet-700 text-xs font-medium rounded">
                      {similarVenue.category.name}
                    </span>
                  </div>
                  {similarVenue.isFree && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                        Бесплатно
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2 mb-2">
                    {similarVenue.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {similarVenue.description || 'Описание отсутствует'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{similarVenue._count.bookings}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        <span>{similarVenue._count.Review}</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {similarVenue.isFree ? 'Бесплатно' : 
                       similarVenue.priceFrom ? `от ${similarVenue.priceFrom}₽` : 'Цена по запросу'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
