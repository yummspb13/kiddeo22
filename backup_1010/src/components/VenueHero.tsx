'use client';

import { MapPin, Star, Users, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type VenueHeroProps = {
  title: string;
  address: string;
  rating: number;
  reviewsCount: number;
  ageFrom?: number;
  ageTo?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  cityName?: string;
  citySlug?: string;
  venueSlug?: string;
};

export default function VenueHero({
  title,
  address,
  rating,
  reviewsCount,
  ageFrom,
  ageTo,
  isFavorite = false,
  onToggleFavorite = () => {},
  cityName = 'Город',
  citySlug = 'city',
  venueSlug = 'venue'
}: VenueHeroProps) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) {
      return `${ageFrom}-${ageTo} лет`;
    } else if (ageFrom) {
      return `от ${ageFrom} лет`;
    } else if (ageTo) {
      return `до ${ageTo} лет`;
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Хлебные крошки */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              Главная
            </Link>
            <ChevronRight className="w-4 h-4 text-white/60" />
            <Link 
              href={`/city/${citySlug}`} 
              className="text-white/80 hover:text-white transition-colors"
            >
              {cityName}
            </Link>
            <ChevronRight className="w-4 h-4 text-white/60" />
            <span className="text-gray-900 font-medium">{title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section - точная копия из kr-marketplace */}
      <div className="relative h-[250px] overflow-hidden rounded-t-3xl">
        {/* Анимированный фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 via-transparent to-pink-800/20"></div>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Плавающие элементы */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-ping"></div>
        
        <div className="relative z-10 h-full flex items-start pt-8">
          <div className="max-w-7xl mx-auto px-4 w-full">
            {/* Кнопка избранного в правом верхнем углу */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={onToggleFavorite}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="text-white">
              <h1 className="text-5xl font-black mb-6 font-unbounded animate-fade-in-up">
                {title}
              </h1>
              <div className="flex items-center space-x-8 text-sm font-medium animate-fade-in-up animation-delay-200 font-unbounded">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="w-6 h-6 mr-3" />
                  <span className="font-unbounded">{address}</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-6 h-6 mr-3 fill-current text-yellow-400" />
                  <span className="font-unbounded">{rating.toFixed(1)} ({reviewsCount} отзывов)</span>
                </div>
                {getAgeRange() && (
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Users className="w-6 h-6 mr-3" />
                    <span className="font-unbounded">{getAgeRange()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Волны под херо блоком - точная копия из kr-marketplace */}
      <div className="relative -mt-20">
        <svg className="w-full h-24 transform rotate-180" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".8" fill="white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".9" fill="white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="white"></path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}