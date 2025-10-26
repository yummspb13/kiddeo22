'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { getPriceDisplay } from '@/utils/priceDisplay';

interface VenueCardProps {
  venue: {
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
    rating: number;
    reviewsCount: number;
    address: string;
    category: string;
    isNew?: boolean;
    isRecommended?: boolean;
  };
  index?: number;
  citySlug?: string;
}

export default function VenueCard({ venue, index = 0, citySlug = 'moskva' }: VenueCardProps) {
  const getPriceInfo = () => {
    // Парсим цену из строки для совместимости
    let priceFrom: number | null = null;
    let priceTo: number | null = null;
    
    if (venue.price && venue.price !== 'Бесплатно') {
      const priceMatch = venue.price.match(/(\d+)/);
      if (priceMatch) {
        priceFrom = parseInt(priceMatch[1]);
      }
    }
    
    return getPriceDisplay({
      tariff: priceFrom ? 'SUPER' : 'FREE',
      priceFrom,
      priceTo,
      isFree: venue.price === 'Бесплатно'
    });
  };

  return (
    <Link
      href={`/city/${citySlug}/venue/${venue.id}`}
      className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
      style={{
        animationDelay: `${index * 150}ms`,
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'forwards'
      }}
    >
      {/* Venue Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {venue.image && venue.image.trim() !== '' ? (
          <Image
            src={venue.image}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
            <Star className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 group-hover:scale-105 transition-transform duration-300">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg font-unbounded">
            {venue.isNew ? 'НОВИНКА' : venue.isRecommended ? 'РЕКОМЕНДУЕМ' : venue.category}
          </span>
        </div>

        {/* Rating badge */}
        {venue.rating > 0 && (
          <div className="absolute top-4 right-4 group-hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg font-unbounded">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{venue.rating}</span>
              {venue.reviewsCount > 0 && (
                <span className="ml-1 text-gray-600">({venue.reviewsCount})</span>
              )}
            </div>
          </div>
        )}

        {/* Hover overlay with action */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
              <ArrowRight className="w-6 h-6 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

        {/* Text content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors line-clamp-2 font-unbounded group-hover:scale-105 transform transition-transform duration-300">
            {venue.name}
          </h3>

          {/* Address */}
          {venue.address && (
            <div className="flex items-center mb-3 text-white/90 group-hover:text-white transition-colors duration-300">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{venue.address}</span>
            </div>
          )}

          {/* Action button */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 font-unbounded">
                {getPriceInfo().mainText}
              </span>
              <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300 font-unbounded">
                {getPriceInfo().subText || (venue.price !== 'Бесплатно' ? 'за услугу' : 'вход свободный')}
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-all duration-300 transform group-hover:scale-105 font-unbounded">
              Подробнее
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
