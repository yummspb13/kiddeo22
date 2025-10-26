'use client';

import Link from 'next/link';
import { ArrowRight, Star, Crown, Gift, Home, TestTube } from 'lucide-react';

export default function TestVenueNavigationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-6 font-unbounded">
            Тестовые страницы мест
          </h1>
          <p className="text-xl text-gray-600 font-unbounded">
            Сравните разные тарифы и шаблоны страниц мест
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Тестовые страницы тарифов */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <TestTube className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-center font-unbounded">Тестовые тарифы</h2>
              <p className="text-center text-blue-100 mt-2 font-unbounded">Сравните разные тарифы</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <Link 
                  href="/test-venue-tariffs"
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
                >
                  <div className="flex items-center justify-center">
                    <Gift className="w-6 h-6 mr-3" />
                    Все тарифы
                  </div>
                </Link>
                <Link 
                  href="/test-venue-tariffs/free"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
                >
                  <div className="flex items-center justify-center">
                    <Gift className="w-6 h-6 mr-3" />
                    Бесплатный тариф
                  </div>
                </Link>
                <Link 
                  href="/test-venue-tariffs/super"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
                >
                  <div className="flex items-center justify-center">
                    <Star className="w-6 h-6 mr-3" />
                    Супер тариф
                  </div>
                </Link>
                <Link 
                  href="/test-venue-tariffs/maximum"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
                >
                  <div className="flex items-center justify-center">
                    <Crown className="w-6 h-6 mr-3" />
                    Максимум тариф
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Реальные страницы мест */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <Home className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-center font-unbounded">Реальные места</h2>
              <p className="text-center text-purple-100 mt-2 font-unbounded">Страницы реальных мест</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <Link 
                  href="/venue/popugaynya"
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
                >
                  <div className="flex items-center justify-center">
                    <Gift className="w-6 h-6 mr-3" />
                    Попугайня (Бесплатно)
                  </div>
                </Link>
                <Link 
                  href="/test-venue-full"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
                >
                  <div className="flex items-center justify-center">
                    <TestTube className="w-6 h-6 mr-3" />
                    Тестовая страница
                  </div>
                </Link>
                <div className="text-center text-gray-500 text-sm font-unbounded py-4">
                  Больше мест будет добавлено позже
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Сравнительная таблица */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center font-unbounded">
            Сравнение возможностей тарифов
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 font-unbounded">Возможность</th>
                  <th className="text-center py-4 px-6 font-bold text-green-600 font-unbounded">🆓 Бесплатно</th>
                  <th className="text-center py-4 px-6 font-bold text-blue-600 font-unbounded">⭐ Супер</th>
                  <th className="text-center py-4 px-6 font-bold text-purple-600 font-unbounded">👑 Максимум</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-unbounded">Цена за час</td>
                  <td className="text-center py-4 px-6 font-unbounded">Бесплатно</td>
                  <td className="text-center py-4 px-6 font-unbounded">1500₽ - 3000₽</td>
                  <td className="text-center py-4 px-6 font-unbounded">5000₽ - 15000₽</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Параметры места</td>
                  <td className="text-center py-4 px-6 font-unbounded">5</td>
                  <td className="text-center py-4 px-6 font-unbounded">10</td>
                  <td className="text-center py-4 px-6 font-unbounded">25</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Фотографии</td>
                  <td className="text-center py-4 px-6 font-unbounded">1-3</td>
                  <td className="text-center py-4 px-6 font-unbounded">5-10</td>
                  <td className="text-center py-4 px-6 font-unbounded">15+</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Описание</td>
                  <td className="text-center py-4 px-6 font-unbounded">Краткое</td>
                  <td className="text-center py-4 px-6 font-unbounded">Подробное</td>
                  <td className="text-center py-4 px-6 font-unbounded">Полное + видео</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Контактная информация</td>
                  <td className="text-center py-4 px-6 font-unbounded">Телефон</td>
                  <td className="text-center py-4 px-6 font-unbounded">Телефон + Email</td>
                  <td className="text-center py-4 px-6 font-unbounded">Все + Сайт</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Отзывы и рейтинги</td>
                  <td className="text-center py-4 px-6 font-unbounded">❌</td>
                  <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  <td className="text-center py-4 px-6 font-unbounded">✅ + VIP</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Дополнительная информация</td>
                  <td className="text-center py-4 px-6 font-unbounded">❌</td>
                  <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  <td className="text-center py-4 px-6 font-unbounded">✅ + Премиум</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-unbounded">Видео о месте</td>
                  <td className="text-center py-4 px-6 font-unbounded">❌</td>
                  <td className="text-center py-4 px-6 font-unbounded">❌</td>
                  <td className="text-center py-4 px-6 font-unbounded">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Быстрые ссылки */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
            Быстрые ссылки
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/test-venue-tariffs"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded"
            >
              <TestTube className="w-5 h-5 mr-2" />
              Все тестовые тарифы
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/venue/popugaynya"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded"
            >
              <Home className="w-5 h-5 mr-2" />
              Попугайня
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              href="/test-venue-full"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded"
            >
              <TestTube className="w-5 h-5 mr-2" />
              Тестовая страница
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
