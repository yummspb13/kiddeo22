'use client';

import { useState } from 'react';
import { Unbounded } from 'next/font/google';
import VenueCard from '@/components/VenueCard';

const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'] });

export default function TestSubcategoryPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState('zooparks');

  const subcategories = {
    zooparks: {
      name: 'Зоопарки',
      description: 'Зоопарки, океанариумы и контактные зоопарки для детей',
      icon: '🦁',
      venues: [
        {
          id: 1,
          name: "Московский зоопарк",
          description: "Один из старейших зоопарков России. Более 8000 животных, детская площадка, экскурсии",
          image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
          price: "от 500 ₽",
          rating: 4.7,
          reviewsCount: 1247,
          address: "м. Баррикадная",
          category: "Зоопарк",
          isNew: false,
          isRecommended: true
        },
        {
          id: 2,
          name: "Океанариум 'Москвариум'",
          description: "Самый большой океанариум в Европе. Дельфинарий, шоу с морскими животными",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          price: "от 800 ₽",
          rating: 4.8,
          reviewsCount: 892,
          address: "м. ВДНХ",
          category: "Океанариум",
          isNew: true,
          isRecommended: false
        },
        {
          id: 3,
          name: "Контактный зоопарк 'Лесная сказка'",
          description: "Контактный зоопарк с домашними животными. Можно кормить и гладить животных",
          image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
          price: "от 300 ₽",
          rating: 4.5,
          reviewsCount: 456,
          address: "м. Сокольники",
          category: "Контактный зоопарк",
          isNew: false,
          isRecommended: false
        },
        {
          id: 4,
          name: "Парк птиц 'Воробьи'",
          description: "Парк с экзотическими птицами. Шоу с попугаями, кормление птиц",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
          price: "от 400 ₽",
          rating: 4.6,
          reviewsCount: 234,
          address: "м. Теплый стан",
          category: "Парк птиц",
          isNew: false,
          isRecommended: true
        },
        {
          id: 5,
          name: "Зоопарк 'Сказка'",
          description: "Небольшой зоопарк с домашними животными. Идеально для малышей",
          image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
          price: "от 250 ₽",
          rating: 4.4,
          reviewsCount: 178,
          address: "м. Коломенская",
          category: "Зоопарк",
          isNew: true,
          isRecommended: false
        },
        {
          id: 6,
          name: "Аквариум 'Риф'",
          description: "Аквариум с тропическими рыбами. Интерактивные программы для детей",
          image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
          price: "от 350 ₽",
          rating: 4.3,
          reviewsCount: 123,
          address: "м. Арбатская",
          category: "Аквариум",
          isNew: false,
          isRecommended: false
        }
      ]
    },
    museums: {
      name: 'Музеи',
      description: 'Детские музеи, интерактивные выставки и познавательные центры',
      icon: '🏛️',
      venues: [
        {
          id: 7,
          name: "Музей космонавтики",
          description: "Интерактивный музей космоса. Симуляторы, планетарий, экскурсии",
          image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
          price: "от 400 ₽",
          rating: 4.8,
          reviewsCount: 1567,
          address: "м. ВДНХ",
          category: "Музей",
          isNew: false,
          isRecommended: true
        },
        {
          id: 8,
          name: "Дарвиновский музей",
          description: "Музей эволюции и природы. Интерактивные экспонаты, детские программы",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          price: "от 300 ₽",
          rating: 4.6,
          reviewsCount: 892,
          address: "м. Академическая",
          category: "Музей",
          isNew: true,
          isRecommended: false
        }
      ]
    },
    parks: {
      name: 'Парки',
      description: 'Детские парки, игровые площадки и зоны отдыха',
      icon: '🌳',
      venues: [
        {
          id: 9,
          name: "Парк Сокольники",
          description: "Большой парк с детскими площадками, аттракционами и зоопарком",
          image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
          price: "от 200 ₽",
          rating: 4.5,
          reviewsCount: 2341,
          address: "м. Сокольники",
          category: "Парк",
          isNew: false,
          isRecommended: true
        }
      ]
    }
  };

  const currentSubcategory = subcategories[selectedSubcategory as keyof typeof subcategories];

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Тестовая страница подкатегории</h1>
              <p className="text-gray-600 mt-1">Как будет выглядеть страница конкретной подкатегории</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSubcategory('zooparks')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubcategory === 'zooparks'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🦁 Зоопарки
              </button>
              <button
                onClick={() => setSelectedSubcategory('museums')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubcategory === 'museums'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏛️ Музеи
              </button>
              <button
                onClick={() => setSelectedSubcategory('parks')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubcategory === 'parks'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🌳 Парки
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - Анимированная волна с градиентом */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white rounded-3xl mb-12">
          {/* Анимированные частицы */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute top-20 right-20 w-6 h-6 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-32 right-1/3 w-5 h-5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
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
                
                <div className="text-6xl mb-4">{currentSubcategory.icon}</div>
                <h1 className="text-5xl sm:text-7xl font-bold mb-8 animate-fade-in">
                  {currentSubcategory.name}
                </h1>
                
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  {currentSubcategory.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <input 
                    type="text" 
                    placeholder={`Поиск в ${currentSubcategory.name.toLowerCase()}...`}
                    className="px-6 py-3 rounded-lg text-gray-900 w-full sm:w-96"
                  />
                  <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
                    Найти
                  </button>
                </div>
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
        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Фильтры</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любая</option>
                  <option>До 500 ₽</option>
                  <option>500-1000 ₽</option>
                  <option>От 1000 ₽</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Район</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любой</option>
                  <option>Центральный</option>
                  <option>Северный</option>
                  <option>Южный</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Возраст</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любой</option>
                  <option>0-3 года</option>
                  <option>3-6 лет</option>
                  <option>6+ лет</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Рейтинг</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Любой</option>
                  <option>4.5+ звезд</option>
                  <option>4.0+ звезд</option>
                  <option>3.5+ звезд</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Results Header */}
        <section className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Найдено {currentSubcategory.venues.length} мест</h2>
              <p className="text-gray-600 mt-1">в категории "{currentSubcategory.name}"</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Сортировка:</span>
              <select className="bg-white rounded-lg px-4 py-2 border">
                <option>По популярности</option>
                <option>По цене</option>
                <option>По рейтингу</option>
                <option>По расстоянию</option>
              </select>
            </div>
          </div>
        </section>

        {/* Venues Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSubcategory.venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>

        {/* Pagination */}
        <section className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                ← Предыдущая
              </button>
              <button className="px-3 py-2 bg-purple-500 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Следующая →
              </button>
            </div>
          </div>
        </section>

        {/* Related Categories */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Похожие категории</h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🎠 Аттракционы
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🎭 Театры
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🎨 Мастер-классы
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                🏃‍♂️ Спорт
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
