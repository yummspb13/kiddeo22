'use client';

import { useState } from 'react';
import { Unbounded } from 'next/font/google';
import './styles.css';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

// Данные категорий
const categories = {
  '📌 Мастер-классы': [
    'Прочий досуг', 'Библиотеки', 'Аквапарки', 'Для особых детей', 
    'Кулинарные занятия', 'Зоопарки, океанариумы', 'Аттракционы', 
    'Театры и цирки', 'Музеи', 'Парки / экотропы / площадки', 
    'Салоны красоты с няней'
  ],
  '📌 Спорт': [
    'Танцы', 'Бокс', 'Художественная гимнастика', 'Айкидо', 
    'Баскетбол', 'Лыжи', 'Плавание', 'Футбол', 'Фехтование', 
    'Фигурное катание', 'Скейт / ролики / BMX', 'Теннис', 
    'Лёгкая атлетика', 'Гольф', 'Беговые клубы', 'Ещё'
  ],
  '📌 Образование': [
    'Основное образование', 'Частные школы', 'Частные детсады', 
    'Для особых детей', 'ВУЗы', 'Военные учебные учреждения', 
    'Раннее развитие', 'Образование за рубежом', 'Монтессори', 
    'Онлайн-школы', 'Вальдорф', 'Дополнительное образование', 
    'Художественное', 'Музыка', 'Робототехника', 'Театр', 
    'Языки', 'Мастер-классы', 'Кружки'
  ],
  '📌 Медицина': [
    'Логопед', 'Психолог (в будущем)'
  ],
  '📌 Лагеря': [
    'Летние лагеря', 'Спортивные лагеря', 'Обучающие лагеря', 
    'Творческие лагеря', 'Приключенческие лагеря'
  ]
};

export default function TestTabsPage() {
  const [activeTab, setActiveTab] = useState('📌 Мастер-классы');

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Тестовая страница табов
          </h1>
          <p className="text-xl text-gray-600">
            Выберите лучший вариант UI для категорий мест
          </p>
        </div>

        {/* Вариант 1: Классические табы */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 1: Классические табы</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-6 py-3 font-medium transition-all duration-200 ${
                    activeTab === category
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 2: Pill табы */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 2: Pill табы</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-2 mb-6">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-sm hover:from-blue-100 hover:to-purple-100 transition-all cursor-pointer border border-blue-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 3: Аккордеон */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 3: Аккордеон</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {Object.keys(categories).map((category, categoryIndex) => (
              <div key={category} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => setActiveTab(activeTab === category ? '' : category)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-lg">{category}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      activeTab === category ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeTab === category && (
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categories[category as keyof typeof categories].map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Вариант 4: Карточки с hover */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 4: Карточки с hover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(categories).map((category) => (
              <div
                key={category}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  activeTab === category ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setActiveTab(category)}
              >
                <div className="text-2xl mb-3">{category.split(' ')[0]}</div>
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <p className="text-sm text-gray-600">
                  {categories[category as keyof typeof categories].length} категорий
                </p>
                {activeTab === category && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-2">
                      {categories[category as keyof typeof categories].slice(0, 4).map((item, index) => (
                        <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                          {item}
                        </div>
                      ))}
                      {categories[category as keyof typeof categories].length > 4 && (
                        <div className="text-xs text-gray-500">
                          +{categories[category as keyof typeof categories].length - 4} ещё
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Вариант 5: Горизонтальный скролл */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 5: Горизонтальный скролл</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex overflow-x-auto space-x-4 pb-4 mb-6 scrollbar-hide">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    activeTab === category
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg text-sm hover:from-green-100 hover:to-blue-100 transition-all cursor-pointer border border-green-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 6: Модальные табы */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 6: Модальные табы</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    activeTab === category
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.split(' ')[0]}</div>
                  <div className="text-sm font-medium">{category}</div>
                </button>
              ))}
            </div>
            {activeTab && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{activeTab}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories[activeTab as keyof typeof categories].map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg text-sm hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Вариант 7: Древовидная структура */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 7: Древовидная структура</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-2">
              {Object.keys(categories).map((category) => (
                <div key={category} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setActiveTab(activeTab === category ? '' : category)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{category.split(' ')[0]}</span>
                      <span className="font-medium">{category}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        activeTab === category ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {activeTab === category && (
                    <div className="px-4 pb-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-3">
                        {categories[category as keyof typeof categories].map((item, index) => (
                          <div
                            key={index}
                            className="p-2 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 8: Фильтр с поиском */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 8: Фильтр с поиском</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Поиск категорий..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === category
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg text-sm hover:from-orange-100 hover:to-red-100 transition-all cursor-pointer border border-orange-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 9: Табы с картинками */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 9: Табы с картинками</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    activeTab === category
                      ? 'ring-4 ring-blue-500 shadow-xl transform scale-105'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                >
                  <div className="w-32 h-24 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                    <div className="text-3xl">{category.split(' ')[0]}</div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end">
                    <div className="p-2 text-white text-sm font-medium truncate w-full">
                      {category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-sm hover:from-purple-100 hover:to-pink-100 transition-all cursor-pointer border border-purple-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 10: Анимированные иконки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 10: Анимированные иконки</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`group relative p-4 rounded-xl transition-all duration-300 ${
                    activeTab === category
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-xl transform scale-110'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <div className="text-4xl mb-2 group-hover:animate-bounce">
                    {category.split(' ')[0]}
                  </div>
                  <div className="text-sm font-medium">{category}</div>
                  {activeTab === category && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-sm hover:from-green-100 hover:to-blue-100 transition-all cursor-pointer border border-green-200 hover:animate-pulse"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 11: Карусель с автопрокруткой */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 11: Карусель с автопрокруткой</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="relative overflow-hidden">
              <div className="flex space-x-4 animate-scroll">
                {Object.keys(categories).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`flex-shrink-0 p-4 rounded-xl transition-all duration-300 ${
                      activeTab === category
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-xl transform scale-110'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    <div className="text-3xl mb-2">{category.split(' ')[0]}</div>
                    <div className="text-sm font-medium">{category}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg text-sm hover:from-orange-100 hover:to-red-100 transition-all cursor-pointer border border-orange-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 12: 3D карточки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 12: 3D карточки</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`group perspective-1000 transform transition-all duration-300 hover:scale-105 ${
                    activeTab === category
                      ? 'rotate-y-12 scale-110'
                      : 'hover:rotate-y-6'
                  }`}
                >
                  <div className="relative w-full h-32 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="text-4xl mb-2 group-hover:animate-spin">{category.split(' ')[0]}</div>
                      <div className="text-sm font-medium text-center">{category}</div>
                    </div>
                    {activeTab === category && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {activeTab && (
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{activeTab}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories[activeTab as keyof typeof categories].map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg text-sm hover:bg-indigo-100 transition-all cursor-pointer border border-indigo-200 hover:shadow-md"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Вариант 13: Волновые табы */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 13: Волновые табы</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`relative overflow-hidden px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTab === category
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{category.split(' ')[0]}</span>
                    <span className="text-sm">{category}</span>
                  </div>
                  {activeTab === category && (
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg text-sm hover:from-cyan-100 hover:to-blue-100 transition-all cursor-pointer border border-cyan-200 hover:animate-pulse"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Вариант 14: Плавающие элементы */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Вариант 14: Плавающие элементы</h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.keys(categories).map((category, index) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`group relative p-4 rounded-xl transition-all duration-500 ${
                    activeTab === category
                      ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-xl transform scale-110'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'float 3s ease-in-out infinite'
                  }}
                >
                  <div className="text-3xl mb-2 group-hover:animate-bounce">{category.split(' ')[0]}</div>
                  <div className="text-sm font-medium">{category}</div>
                  {activeTab === category && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories[activeTab as keyof typeof categories].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg text-sm hover:from-pink-100 hover:to-rose-100 transition-all cursor-pointer border border-pink-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Инструкции */}
        <section className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Инструкции для тестирования</h2>
          <div className="space-y-4 text-blue-800">
            <p>• Протестируйте каждый вариант на удобство использования</p>
            <p>• Обратите внимание на скорость навигации между категориями</p>
            <p>• Проверьте, как выглядит на мобильных устройствах</p>
            <p>• Выберите вариант, который лучше всего подходит для вашего дизайна</p>
            <p>• Учтите, что категорий будет много, поэтому важна масштабируемость</p>
            <p>• <strong>Новые варианты:</strong> Протестируйте динамичные варианты с анимациями</p>
          </div>
        </section>
      </div>
    </div>
  );
}
