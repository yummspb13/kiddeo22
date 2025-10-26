'use client';

import React, { useState } from 'react';
import { Unbounded } from 'next/font/google';
// import VenueCard from '@/components/VenueCard';

const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'] });

export default function TestVenueCardPage() {
  const [selectedCard, setSelectedCard] = useState<string>('default');

  const testVenues = {
    default: {
      id: 1,
      name: "Детский центр 'Солнышко'",
      description: "Развивающие занятия для детей от 1 года. Логопед, психолог, творческие мастер-классы",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      price: "от 800 ₽",
      rating: 4.8,
      reviewsCount: 127,
      address: "м. Сокольники",
      category: "Развитие",
      isNew: false,
      isRecommended: false
    },
    new: {
      id: 2,
      name: "Спортивный клуб 'Олимпиец'",
      description: "Гимнастика, плавание, единоборства для детей от 3 лет. Современное оборудование",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      price: "от 1200 ₽",
      rating: 4.6,
      reviewsCount: 89,
      address: "м. ВДНХ",
      category: "Спорт",
      isNew: true,
      isRecommended: false
    },
    recommended: {
      id: 3,
      name: "Театр кукол 'Малыш'",
      description: "Спектакли для детей от 2 лет. Интерактивные представления, мастер-классы",
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
      price: "от 600 ₽",
      rating: 4.9,
      reviewsCount: 203,
      address: "м. Тверская",
      category: "Театр",
      isNew: false,
      isRecommended: true
    }
  };

  const cardTypes = [
    { key: 'default', label: 'Обычная карточка', description: 'Стандартная карточка места' },
    { key: 'new', label: 'Новая карточка', description: 'С бейджем "НОВИНКА"' },
    { key: 'recommended', label: 'Рекомендуемая', description: 'С бейджем "РЕКОМЕНДУЕМ"' }
  ];

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Тестовая страница карточки места</h1>
          <p className="text-gray-600 mt-1">Проверка UI карточки места в разных состояниях</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Выберите тип карточки для тестирования</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedCard(type.key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCard === type.key
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold mb-1">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Card Preview */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Предварительный просмотр</h2>
            <div className="flex justify-center">
              <div className="w-80">
                {/* <VenueCard venue={testVenues[selectedCard as keyof typeof testVenues]} /> */}
                <div className="p-4 border rounded-lg bg-gray-100">
                  <p>VenueCard component not available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Preview */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">В сетке (как на странице)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* <VenueCard venue={testVenues.default} /> */}
              {/* <VenueCard venue={testVenues.new} /> */}
              {/* <VenueCard venue={testVenues.recommended} /> */}
              <div className="p-4 border rounded-lg bg-gray-100">
                <p>VenueCard components not available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hover States */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Состояния при наведении</h2>
            <p className="text-gray-600 mb-4">Наведите курсор на карточки ниже, чтобы увидеть hover-эффекты</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                {/* <VenueCard venue={testVenues.default} /> */}
                <div className="p-4 border rounded-lg bg-gray-100">
                  <p>VenueCard component not available</p>
                </div>
                <p className="text-center mt-2 text-sm text-gray-500">Обычная карточка</p>
              </div>
              <div className="group">
                {/* <VenueCard venue={testVenues.new} /> */}
                <div className="p-4 border rounded-lg bg-gray-100">
                  <p>VenueCard component not available</p>
                </div>
                <p className="text-center mt-2 text-sm text-gray-500">Новая карточка</p>
              </div>
              <div className="group">
                {/* <VenueCard venue={testVenues.recommended} /> */}
                <div className="p-4 border rounded-lg bg-gray-100">
                  <p>VenueCard component not available</p>
                </div>
                <p className="text-center mt-2 text-sm text-gray-500">Рекомендуемая</p>
              </div>
            </div>
          </div>
        </section>

        {/* Card Details */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Детали карточки</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Текущая карточка:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(testVenues[selectedCard as keyof typeof testVenues], null, 2)}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Стили карточки:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Основная карточка: <code className="bg-gray-200 px-1 rounded">rounded-3xl</code></li>
                    <li>• Изображение: <code className="bg-gray-200 px-1 rounded">rounded-3xl</code></li>
                    <li>• Бейджи: <code className="bg-gray-200 px-1 rounded">rounded-2xl</code></li>
                    <li>• Hover-эффекты: масштабирование и поднятие</li>
                    <li>• Анимации: плавные переходы 500ms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
