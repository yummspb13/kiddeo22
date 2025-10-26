'use client';

import { useState } from 'react';
import { Unbounded } from 'next/font/google';
import VenueCategories from '@/components/VenueCategories';
import VenueSections from '@/components/VenueSections';

const unbounded = Unbounded({ subsets: ['cyrillic', 'latin'] });

export default function TestCategoryPage() {
  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Тестовая страница категории</h1>
          <p className="text-gray-600 mt-1">Проверка UI компонентов для страницы мест</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-20 rounded-3xl mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Места в Москве</h1>
            <p className="text-xl mb-8">Найдите интересные места для всей семьи</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                type="text" 
                placeholder="Поиск мест..." 
                className="px-6 py-3 rounded-lg text-gray-900 w-full sm:w-96"
              />
              <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
                Найти
              </button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Категории мест</h2>
            <VenueCategories />
          </div>
        </section>

        {/* Sections */}
        <section className="mb-12">
          <VenueSections />
        </section>

        {/* All Venues Section */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Все места</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Сортировка:</span>
                <select className="bg-white rounded-lg px-4 py-2 border">
                  <option>По популярности</option>
                  <option>По цене</option>
                  <option>По рейтингу</option>
                </select>
              </div>
            </div>
            
            {/* Placeholder for venues grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-3xl p-6 text-center">
                  <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Место {index + 1}</h3>
                  <p className="text-gray-600 mb-4">Описание места</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">от 500 ₽</span>
                    <div className="flex items-center text-sm text-gray-500">
                      ⭐ 4.5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
