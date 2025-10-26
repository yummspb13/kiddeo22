'use client';

import { useState } from 'react';
import { MapPin, Star, Users, Heart, Clock, Calendar, Phone, Mail, Globe } from 'lucide-react';
import VenueHero from '@/components/VenueHero';

// Компонент 1: Градиентный с волнистой границей
function GradientHeroWithWave({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="relative overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-16 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 font-unbounded">
            {title}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="font-medium">{address}</span>
            </div>
            
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <Star className="w-5 h-5 mr-2 fill-current" />
              <span className="font-medium">{rating.toFixed(1)} ({reviewsCount} отзывов)</span>
            </div>
            
            {getAgeRange() && (
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">{getAgeRange()}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button className="text-white/80 hover:text-white transition-colors">
              <Heart className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative -mt-1">
        <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

// Компонент 2: С изображением и оверлеем
function ImageOverlayHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="relative h-96 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative h-full flex items-center justify-center text-white">
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 font-unbounded">
            {title}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="font-medium">{address}</span>
            </div>
            
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Star className="w-5 h-5 mr-2 fill-current" />
              <span className="font-medium">{rating.toFixed(1)} ({reviewsCount})</span>
            </div>
            
            {getAgeRange() && (
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">{getAgeRange()}</span>
              </div>
            )}
          </div>
          
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full px-6 py-3 font-medium">
            <Heart className="w-5 h-5 inline mr-2" />
            Добавить в избранное
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент 3: Карточный стиль с тенью
function CardStyleHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-8 relative">
        <div className="absolute top-4 right-4">
          <button className="text-white/80 hover:text-white transition-colors">
            <Heart className="w-6 h-6" />
          </button>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 font-unbounded">
          {title}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <MapPin className="w-5 h-5 mr-3" />
            <div>
              <div className="text-sm opacity-80">Адрес</div>
              <div className="font-medium">{address}</div>
            </div>
          </div>
          
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <Star className="w-5 h-5 mr-3 fill-current" />
            <div>
              <div className="text-sm opacity-80">Рейтинг</div>
              <div className="font-medium">{rating.toFixed(1)} ({reviewsCount} отзывов)</div>
            </div>
          </div>
          
          {getAgeRange() && (
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <Users className="w-5 h-5 mr-3" />
              <div>
                <div className="text-sm opacity-80">Возраст</div>
                <div className="font-medium">{getAgeRange()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент 4: Минималистичный с акцентом
function MinimalistHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-sm font-medium mb-6">
          Место для детей
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 font-unbounded">
          {title}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2 text-purple-600" />
            <span className="font-medium">{address}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
            <span className="font-medium">{rating.toFixed(1)} ({reviewsCount} отзывов)</span>
          </div>
          
          {getAgeRange() && (
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-pink-600" />
              <span className="font-medium">{getAgeRange()}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Забронировать
          </button>
          <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
            <Heart className="w-4 h-4 inline mr-2" />
            В избранное
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент 5: С анимированным фоном
function AnimatedHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white py-20">
      {/* Анимированные элементы */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <h1 className="text-4xl sm:text-6xl font-bold text-center mb-8 font-unbounded">
          {title}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 hover:bg-white/30 transition-colors">
            <MapPin className="w-6 h-6 mr-3" />
            <div>
              <div className="text-sm opacity-80">Адрес</div>
              <div className="font-semibold">{address}</div>
            </div>
          </div>
          
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 hover:bg-white/30 transition-colors">
            <Star className="w-6 h-6 mr-3 fill-current" />
            <div>
              <div className="text-sm opacity-80">Рейтинг</div>
              <div className="font-semibold">{rating.toFixed(1)} ({reviewsCount})</div>
            </div>
          </div>
          
          {getAgeRange() && (
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 hover:bg-white/30 transition-colors">
              <Users className="w-6 h-6 mr-3" />
              <div>
                <div className="text-sm opacity-80">Возраст</div>
                <div className="font-semibold">{getAgeRange()}</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105">
            <Heart className="w-5 h-5 inline mr-2" />
            В избранное
          </button>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105">
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент 6: Неоморфизм с геометрией
function NeomorphicHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 py-20 relative overflow-hidden">
      {/* Геометрические элементы */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -translate-x-16 -translate-y-16"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
              ✨ Премиум место
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-unbounded">
              {title}
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Адрес</div>
                  <div className="font-semibold text-gray-900">{address}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Рейтинг</div>
                  <div className="font-semibold text-gray-900">{rating.toFixed(1)} ({reviewsCount} отзывов)</div>
                </div>
              </div>
            </div>
            
            {getAgeRange() && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Возраст</div>
                    <div className="font-semibold text-gray-900">{getAgeRange()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
              <Heart className="w-5 h-5 inline mr-2" />
              В избранное
            </button>
            <button className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg border border-gray-200">
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент 7: Стеклянный морфизм
function GlassmorphismHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="text-center mb-10">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 font-unbounded">
                {title}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-pink-400 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 font-medium">Адрес</div>
                    <div className="font-semibold text-white">{address}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <Star className="w-7 h-7 text-yellow-400 fill-current" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 font-medium">Рейтинг</div>
                    <div className="font-semibold text-white">{rating.toFixed(1)} ({reviewsCount})</div>
                  </div>
                </div>
              </div>
              
              {getAgeRange() && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70 font-medium">Возраст</div>
                      <div className="font-semibold text-white">{getAgeRange()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-6">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 border border-white/30">
                <Heart className="w-5 h-5 inline mr-2" />
                В избранное
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                Забронировать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент 8: Брутализм с яркими акцентами
function BrutalistHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="bg-black text-white py-20 relative overflow-hidden">
      {/* Геометрические элементы */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 transform rotate-45 -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 transform rotate-12 translate-y-24 -translate-x-24"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-400 transform -rotate-12 -translate-x-16 -translate-y-16"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="bg-white text-black p-12 border-8 border-yellow-400 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-block bg-yellow-400 text-black px-6 py-3 text-lg font-bold mb-6 transform -rotate-2">
              🔥 ГОРЯЧЕЕ МЕСТО
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-black mb-6 font-unbounded transform -rotate-1">
              {title}
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-pink-500 text-white p-6 border-4 border-black transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-none flex items-center justify-center mr-4 border-4 border-black">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase">Адрес</div>
                  <div className="font-black text-lg">{address}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-cyan-400 text-black p-6 border-4 border-black transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-none flex items-center justify-center mr-4 border-4 border-black">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase">Рейтинг</div>
                  <div className="font-black text-lg">{rating.toFixed(1)} ({reviewsCount})</div>
                </div>
              </div>
            </div>
            
            {getAgeRange() && (
              <div className="bg-yellow-400 text-black p-6 border-4 border-black transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-16 h-16 bg-pink-500 text-white rounded-none flex items-center justify-center mr-4 border-4 border-black">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase">Возраст</div>
                    <div className="font-black text-lg">{getAgeRange()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-6">
            <button className="bg-black text-yellow-400 px-8 py-4 font-black text-lg border-4 border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-105">
              <Heart className="w-6 h-6 inline mr-2" />
              В ИЗБРАННОЕ
            </button>
            <button className="bg-pink-500 text-white px-8 py-4 font-black text-lg border-4 border-black hover:bg-cyan-400 hover:text-black transition-all duration-300 transform hover:scale-105">
              ЗАБРОНИРОВАТЬ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент 9: Анимированная волна с градиентом
function AnimatedWaveHero({ title, address, rating, reviewsCount, ageFrom, ageTo }: any) {
  const getAgeRange = () => {
    if (ageFrom && ageTo) return `${ageFrom}-${ageTo} лет`;
    if (ageFrom) return `от ${ageFrom} лет`;
    if (ageTo) return `до ${ageTo} лет`;
    return null;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white rounded-3xl">
      {/* Анимированные частицы */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-1/3 w-5 h-5 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* Kiddeo рекомендует - левый верхний угол */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Kiddeo рекомендует
            </div>
            
            {/* Кнопка избранного - правый верхний угол */}
            <button className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 font-unbounded animate-fade-in">
              Изумрудный город
            </h1>
            
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Волшебная история о приключениях девочки Дороти в стране Оз. 
              Яркий музыкальный спектакль для всей семьи с потрясающими декорациями и костюмами.
            </p>
          </div>
          
          
        </div>
      </div>

      {/* Анимированная волна */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="w-full h-48 text-white transform rotate-180 scale-x-[1.3] origin-center" 
          viewBox="0 0 1200 180" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
              <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,0.6)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
            </linearGradient>
            <linearGradient id="waveGradientWhite" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.8)' }} />
              <stop offset="50%" style={{ stopColor: 'rgba(255,255,255,1)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0.8)' }} />
            </linearGradient>
          </defs>
          
          {/* Первая волна - полностью белая */}
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            fill="white"
            className="animate-wave-1"
          />
          
          {/* Вторая волна - полупрозрачная */}
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24c13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            fill="url(#waveGradient)"
            opacity="0.7"
            className="animate-wave-2"
          />
          
          {/* Третья волна - белая */}
          <path 
            d="M0,0V30.81C13,51.92,27.64,71.86,47.69,87.05,99.41,126.27,165,126,224.58,106.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24c13,51.92,27.64,71.86,47.69,87.05,99.41,126.27,165,126,224.58,106.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            fill="url(#waveGradientWhite)"
            opacity="0.6"
            className="animate-wave-3"
          />
          
          {/* Четвертая волна - полупрозрачная */}
          <path 
            d="M0,0V60.81C13,81.92,27.64,101.86,47.69,117.05,99.41,156.27,165,156,224.58,136.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            fill="url(#waveGradient)"
            opacity="0.4"
            className="animate-wave-1"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes wave-1 {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
          100% { transform: translateX(0) translateY(0); }
        }
        
        @keyframes wave-2 {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(5px); }
          100% { transform: translateX(0) translateY(0); }
        }
        
        @keyframes wave-3 {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-15px) translateY(-5px); }
          100% { transform: translateX(0) translateY(0); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-wave-1 {
          animation: wave-1 8s ease-in-out infinite;
        }
        
        .animate-wave-2 {
          animation: wave-2 6s ease-in-out infinite reverse;
        }
        
        .animate-wave-3 {
          animation: wave-3 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function TestVenueHeroesPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  const testVenue = {
    title: "Тестовый вендор 8",
    address: "Адрес тестового вендора 8, г. Москва",
    rating: 0.0,
    reviewsCount: 0,
    ageFrom: 5,
    ageTo: 12,
    cityName: "Москва",
    citySlug: "moskva"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Тест херо-блоков для мест</h1>
          <p className="mt-2 text-lg text-gray-600">9 различных дизайнов херо-блоков для страниц мест</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 space-y-16">
        {/* Точная копия дизайна с фото */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Точная копия дизайна с фото</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <VenueHero 
              {...testVenue}
              isFavorite={isFavorite}
              onToggleFavorite={() => setIsFavorite(!isFavorite)}
            />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Точная копия дизайна с хлебными крошками, градиентным фоном, волнистой границей и всеми элементами как на фото.</p>
            </div>
          </div>
        </section>

        {/* Вариант 1: Градиентный с волнистой границей */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Градиентный с волнистой границей</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <GradientHeroWithWave {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Классический дизайн с градиентным фоном, волнистой нижней границей и тремя информационными бейджами.</p>
            </div>
          </div>
        </section>

        {/* Вариант 2: С изображением и оверлеем */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. С изображением и оверлеем</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ImageOverlayHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Современный дизайн с градиентным оверлеем поверх изображения и горизонтальным расположением информации.</p>
            </div>
          </div>
        </section>

        {/* Вариант 3: Карточный стиль */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Карточный стиль с тенью</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <CardStyleHero {...testVenue} />
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-gray-600">Элегантный карточный дизайн с сеткой информационных блоков и кнопкой избранного в углу.</p>
            </div>
          </div>
        </section>

        {/* Вариант 4: Минималистичный */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Минималистичный с акцентом</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <MinimalistHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Чистый минималистичный дизайн с акцентным бейджем и кнопками действий внизу.</p>
            </div>
          </div>
        </section>

        {/* Вариант 5: С анимированным фоном */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. С анимированным фоном</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <AnimatedHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Динамичный дизайн с анимированными элементами фона и интерактивными блоками информации.</p>
            </div>
          </div>
        </section>

        {/* Вариант 6: Неоморфизм с геометрией */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Неоморфизм с геометрией</h2>
          <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
            <NeomorphicHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Современный неоморфный дизайн с мягкими тенями, геометрическими элементами и премиальным ощущением.</p>
            </div>
          </div>
        </section>

        {/* Вариант 7: Стеклянный морфизм */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Стеклянный морфизм</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <GlassmorphismHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Элегантный стеклянный морфизм с размытым фоном, прозрачными элементами и современной эстетикой.</p>
            </div>
          </div>
        </section>

        {/* Вариант 8: Брутализм с яркими акцентами */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Брутализм с яркими акцентами</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <BrutalistHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Смелый бруталистический дизайн с яркими цветами, геометрическими формами и дерзкой типографикой.</p>
            </div>
          </div>
        </section>

        {/* Вариант 9: Анимированная волна с градиентом */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Анимированная волна с градиентом</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <AnimatedWaveHero {...testVenue} />
            <div className="p-6 bg-white">
              <p className="text-gray-600">Потрясающий дизайн с живой анимированной волной, градиентным фоном, летающими частицами и интерактивными элементами!</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
