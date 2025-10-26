'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Star, MapPin } from 'lucide-react';
import VenueCard from './VenueCard';
import './VenueSections.css';

// Данные для подборок
const collections = [
  {
    id: 1,
    title: 'Лучшие детские кафе Москвы',
    description: 'Топ-10 кафе с детскими площадками и меню для всей семьи',
    coverImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
    eventCount: 12,
    slug: 'best-cafes-moscow'
  },
  {
    id: 2,
    title: 'Спортивные секции для детей',
    description: 'Футбол, танцы, плавание и другие виды спорта',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    eventCount: 18,
    slug: 'sports-sections'
  },
  {
    id: 3,
    title: 'Развивающие центры',
    description: 'Монтессори, робототехника, языки и творчество',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    eventCount: 25,
    slug: 'development-centers'
  }
];

// Данные для новых мест
const newVenues = [
  {
    id: 1,
    name: 'Детский клуб "Радуга"',
    description: 'Развивающие занятия для детей от 2 до 7 лет',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    price: 'от 800 ₽',
    rating: 4.8,
    reviewsCount: 24,
    address: 'м. Сокольники',
    category: 'Развитие',
    isNew: true
  },
  {
    id: 2,
    name: 'Спортивный комплекс "Чемпион"',
    description: 'Футбол, баскетбол, плавание для детей и взрослых',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    price: 'от 1200 ₽',
    rating: 4.9,
    reviewsCount: 156,
    address: 'м. ВДНХ',
    category: 'Спорт',
    isNew: true
  },
  {
    id: 3,
    name: 'Творческая студия "Палитра"',
    description: 'Рисование, лепка, декоративно-прикладное искусство',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    price: 'от 600 ₽',
    rating: 4.7,
    reviewsCount: 89,
    address: 'м. Арбатская',
    category: 'Творчество',
    isNew: true
  },
  {
    id: 4,
    name: 'Языковая школа "Полиглот"',
    description: 'Английский, французский, испанский для детей',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    price: 'от 1000 ₽',
    rating: 4.6,
    reviewsCount: 67,
    address: 'м. Тверская',
    category: 'Образование',
    isNew: true
  },
  {
    id: 5,
    name: 'Танцевальная студия "Грация"',
    description: 'Балет, современные танцы, хип-хоп для всех возрастов',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    price: 'от 900 ₽',
    rating: 4.8,
    reviewsCount: 134,
    address: 'м. Маяковская',
    category: 'Танцы',
    isNew: true
  },
  {
    id: 6,
    name: 'Научная лаборатория "Эксперимент"',
    description: 'Опыты, исследования, научные проекты для детей',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    price: 'от 1100 ₽',
    rating: 4.9,
    reviewsCount: 45,
    address: 'м. Сокольники',
    category: 'Наука',
    isNew: true
  }
];

// Данные для рекомендуемых мест
const recommendedVenues = [
  {
    id: 7,
    name: 'Детский театр "Сказка"',
    description: 'Спектакли, мастер-классы, интерактивные представления',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
    price: 'от 500 ₽',
    rating: 4.9,
    reviewsCount: 278,
    address: 'м. Театральная',
    category: 'Театр',
    isRecommended: true
  },
  {
    id: 8,
    name: 'Аквапарк "Водный мир"',
    description: 'Горки, бассейны, детские зоны для всей семьи',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
    price: 'от 1500 ₽',
    rating: 4.7,
    reviewsCount: 342,
    address: 'м. ВДНХ',
    category: 'Аквапарк',
    isRecommended: true
  },
  {
    id: 9,
    name: 'Музей "Живая история"',
    description: 'Интерактивные экспозиции, экскурсии, мастер-классы',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop',
    price: 'от 300 ₽',
    rating: 4.8,
    reviewsCount: 189,
    address: 'м. Парк Культуры',
    category: 'Музей',
    isRecommended: true
  },
  {
    id: 10,
    name: 'Парк развлечений "Страна чудес"',
    description: 'Аттракционы, игровые зоны, праздники для детей',
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a8?w=400&h=300&fit=crop',
    price: 'от 800 ₽',
    rating: 4.6,
    reviewsCount: 156,
    address: 'м. Сокольники',
    category: 'Развлечения',
    isRecommended: true
  },
  {
    id: 11,
    name: 'Детский сад "Солнышко"',
    description: 'Полный день, развивающие программы, питание',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    price: 'от 25000 ₽',
    rating: 4.9,
    reviewsCount: 67,
    address: 'м. Тверская',
    category: 'Образование',
    isRecommended: true
  },
  {
    id: 12,
    name: 'Спортивный клуб "Олимпиец"',
    description: 'Гимнастика, плавание, единоборства для детей',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop',
    price: 'от 1300 ₽',
    rating: 4.8,
    reviewsCount: 234,
    address: 'м. ВДНХ',
    category: 'Спорт',
    isRecommended: true
  }
];

export default function VenueSections() {
  return (
    <div className="space-y-16">
      {/* Подборки */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Подборки</h2>
          </div>
          <Link 
            href="/collections" 
            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 cursor-pointer"
          >
            Все подборки
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <div className="relative overflow-hidden" style={{ height: '450px' }}>
                <img
                  src={collection.coverImage}
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />

                {/* Dynamic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />

                {/* Collection badge */}
                <div className="absolute top-6 left-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                    ПОДБОРКА
                  </span>
                </div>

                {/* Event count badge */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-base font-semibold text-gray-800 group-hover:scale-110 group-hover:bg-white transition-all duration-300 shadow-lg">
                  {collection.eventCount} мест
                </div>

                {/* Hover overlay with action */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                      <ArrowRight className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Floating decorative elements */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                {/* Text content over image */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-300 transition-colors group-hover:scale-105 transform transition-transform duration-300">
                    {collection.title}
                  </h3>
                  <p className="text-white/90 text-base group-hover:text-white transition-colors duration-300">
                    {collection.description}
                  </p>

                  {/* Progress bar animation */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Новые в каталоге */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-lg">✨</span>
            </div>
            <h2 className="text-3xl font-bold">Новые в каталоге</h2>
          </div>
          <Link 
            href="/city/moskva/cat/venues?filter=new" 
            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 cursor-pointer"
          >
            Все новинки
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newVenues.map((venue, index) => (
            <div
              key={venue.id}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <VenueCard venue={venue} />
            </div>
          ))}
        </div>
      </section>

      {/* Рекомендуем */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Рекомендуем</h2>
          </div>
          <Link 
            href="/city/moskva/cat/venues?filter=recommended" 
            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 cursor-pointer"
          >
            Все рекомендации
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedVenues.map((venue, index) => (
            <div
              key={venue.id}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <VenueCard venue={venue} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
