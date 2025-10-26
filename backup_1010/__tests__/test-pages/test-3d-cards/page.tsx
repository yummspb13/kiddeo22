'use client';

import { useState } from 'react';
import { Unbounded } from 'next/font/google';
import { Calendar, Users, Star, Heart, Eye, Clock, MapPin, DollarSign, Sparkles, Zap, Target, Award, ArrowRight } from 'lucide-react';
import './styles.css';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

// Данные категорий с подкатегориями и их данными
const categories = {
  '📌 Мастер-классы': [
    { name: 'Мастер-классы', count: 1, image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', price: 'от 500 ₽' },
    { name: 'Спектакли', count: 1, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', price: 'от 800 ₽' },
    { name: 'Концерты', count: 1, image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop', price: 'от 600 ₽' },
    { name: 'Спорт', count: 2, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', price: 'от 300 ₽' },
    { name: 'Фестивали', count: 1, image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop', price: 'от 200 ₽' },
    { name: 'Экскурсии', count: 1, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop', price: 'от 400 ₽' },
    { name: 'Кино', count: 1, image: 'https://images.unsplash.com/photo-1489599808888-0b0a4b0b0b0b?w=400&h=300&fit=crop', price: 'от 250 ₽' }
  ],
  '📌 Спорт': [
    { name: 'Танцы', count: 15, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', price: 'от 400 ₽' },
    { name: 'Бокс', count: 8, image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop', price: 'от 600 ₽' },
    { name: 'Художественная гимнастика', count: 12, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', price: 'от 500 ₽' },
    { name: 'Айкидо', count: 6, image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop', price: 'от 700 ₽' },
    { name: 'Баскетбол', count: 10, image: 'https://images.unsplash.com/photo-1546519638-68e109491ffa?w=400&h=300&fit=crop', price: 'от 300 ₽' },
    { name: 'Лыжи', count: 5, image: 'https://images.unsplash.com/photo-1551524164-6cf2ac531f54?w=400&h=300&fit=crop', price: 'от 800 ₽' },
    { name: 'Плавание', count: 18, image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop', price: 'от 400 ₽' },
    { name: 'Футбол', count: 20, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop', price: 'от 350 ₽' }
  ],
  '📌 Образование': [
    { name: 'Частные школы', count: 25, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop', price: 'от 15000 ₽' },
    { name: 'Частные детсады', count: 30, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop', price: 'от 12000 ₽' },
    { name: 'Раннее развитие', count: 45, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop', price: 'от 800 ₽' },
    { name: 'Монтессори', count: 12, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop', price: 'от 1000 ₽' },
    { name: 'Художественное', count: 35, image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', price: 'от 600 ₽' },
    { name: 'Музыка', count: 28, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop', price: 'от 700 ₽' },
    { name: 'Робототехника', count: 15, image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop', price: 'от 900 ₽' },
    { name: 'Языки', count: 40, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop', price: 'от 500 ₽' }
  ],
  '📌 Медицина': [
    { name: 'Логопед', count: 8, image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', price: 'от 2000 ₽' },
    { name: 'Психолог', count: 5, image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', price: 'от 2500 ₽' }
  ],
  '📌 Лагеря': [
    { name: 'Летние лагеря', count: 12, image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a8?w=400&h=300&fit=crop', price: 'от 15000 ₽' },
    { name: 'Спортивные лагеря', count: 8, image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a8?w=400&h=300&fit=crop', price: 'от 18000 ₽' },
    { name: 'Обучающие лагеря', count: 6, image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a8?w=400&h=300&fit=crop', price: 'от 20000 ₽' },
    { name: 'Творческие лагеря', count: 10, image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c2a8?w=400&h=300&fit=crop', price: 'от 16000 ₽' }
  ]
};

export default function Test3DCardsPage() {
  const [activeTab, setActiveTab] = useState('📌 Мастер-классы');

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Готовый дизайн страницы мест
          </h1>
          <p className="text-xl text-gray-600">
            Pill табы + карточки подкатегорий в едином блоке
          </p>
        </div>

        {/* Единый блок: Pill табы + карточки подкатегорий */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Pill табы категорий */}
            <div className="flex flex-wrap gap-2 mb-8">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    activeTab === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Карточки подкатегорий */}
            {activeTab && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories[activeTab as keyof typeof categories].map((subcategory, index) => (
                  <SubcategoryCard 
                    key={index} 
                    subcategory={subcategory} 
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Инструкции */}
        <section className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Как это работает в живую</h2>
          <div className="space-y-4 text-blue-800">
            <p>• <strong>Единый блок:</strong> Pill табы и карточки в одном контейнере</p>
            <p>• <strong>Без заголовков:</strong> Чистый интерфейс без лишних подписей</p>
            <p>• <strong>Интерактивность:</strong> Клик по табу → показ карточек подкатегорий</p>
            <p>• <strong>Адаптивность:</strong> 1-4 колонки в зависимости от экрана</p>
            <p>• <strong>Hover-эффекты:</strong> Поднятие карточек, масштабирование изображений</p>
            <p>• <strong>Готово к использованию:</strong> Можно интегрировать в основную страницу</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// Компонент карточки подкатегории в стиле афиши (из CategoryCards.tsx)
function SubcategoryCard({ subcategory, index }: { subcategory: any; index: number }) {
  return (
    <div 
      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-32"
      style={{
        animationDelay: `${index * 0.1}s`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Фоновое изображение */}
      <div className="absolute inset-0">
        <img 
          src={subcategory.image}
          alt={subcategory.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
      </div>

      {/* Счетчик событий */}
      <div className="absolute bottom-0 right-2" style={{ transform: 'translateY(25%)' }}>
        <div className="text-white text-[9rem] font-bold opacity-50">
          {subcategory.count}
        </div>
      </div>

      {/* Контент */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4">
        <div className="text-white">
          <h3 className="text-lg font-bold mb-1 drop-shadow-lg">
            {subcategory.name}
          </h3>
          <p className="text-sm text-white/90 drop-shadow-lg">
            {subcategory.price}
          </p>
        </div>
      </div>
    </div>
  );
}
