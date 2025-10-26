'use client';

import Link from 'next/link';
import { Star, Crown, Gift } from 'lucide-react';

export default function TestVenueTariffsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-6 font-unbounded">
            Тестовые страницы мест по тарифам
          </h1>
          <p className="text-xl text-gray-600 font-unbounded">
            Сравните, как выглядят страницы мест с разными тарифами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* БЕСПЛАТНЫЙ тариф */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <Gift className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-center font-unbounded">БЕСПЛАТНЫЙ</h2>
              <p className="text-center text-green-100 mt-2 font-unbounded">🆓 Free Tariff</p>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-unbounded">Попугайня</h3>
              <p className="text-gray-600 mb-6 font-unbounded">
                Зоопарк с экзотическими птицами. Идеальное место для семейного отдыха.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  4 фотографии
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Описание места
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Адрес + координаты
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Отзывы клиентов
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Район и метро
                </li>
              </ul>
              <Link 
                href="/test-venue-tariffs/free"
                className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
              >
                Посмотреть страницу
              </Link>
            </div>
          </div>

          {/* СУПЕР тариф */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-center font-unbounded">СУПЕР</h2>
              <p className="text-center text-blue-100 mt-2 font-unbounded">⭐ Super Tariff</p>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-unbounded">Детская студия "Ням-Ням"</h3>
              <p className="text-gray-600 mb-6 font-unbounded">
                Профессиональная детская студия с современным оборудованием.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  10 фотографий
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Цена от (поле для ввода)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Расширенное описание с фото
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Вопросы/Ответы от клиентов
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Аналитика
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Особенности места (иконки)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Новости (3 поста в месяц)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Возрастные ограничения
                </li>
              </ul>
              <Link 
                href="/test-venue-tariffs/super"
                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
              >
                Посмотреть страницу
              </Link>
            </div>
          </div>

          {/* МАКСИМУМ тариф */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-center font-unbounded">МАКСИМУМ</h2>
              <p className="text-center text-purple-100 mt-2 font-unbounded">👑 Maximum Tariff</p>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-unbounded">Премиум центр "Звездочка"</h3>
              <p className="text-gray-600 mb-6 font-unbounded">
                Эксклюзивный детский центр с премиальным сервисом.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Все возможности Супер тарифа
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  20 фотографий
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Возможность добавить видео
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Товары и услуги в карточке
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Специальная аналитика
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Чат с клиентами (Скоро)
                </li>
              </ul>
              <Link 
                href="/test-venue-tariffs/maximum"
                className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 transform hover:scale-105 font-unbounded"
              >
                Посмотреть страницу
              </Link>
            </div>
          </div>
        </div>

        {/* Дополнительные страницы */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Навигация</h2>
            <p className="text-gray-600 mb-6 font-unbounded">
              Удобная навигация между всеми тестовыми страницами
            </p>
            <a 
              href="/test-venue-tariffs/navigation"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded"
            >
              Перейти к навигации
            </a>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-unbounded">Сравнение в реальном времени</h2>
            <p className="text-gray-600 mb-6 font-unbounded">
              Переключайтесь между тарифами и смотрите изменения
            </p>
            <a 
              href="/test-venue-tariffs/comparison"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded"
            >
              Сравнить тарифы
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
            Сравнение возможностей тарифов
          </h2>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-bold text-gray-900 font-unbounded">Возможность</th>
                    <th className="text-center py-4 px-6 font-bold text-green-600 font-unbounded">Бесплатно</th>
                    <th className="text-center py-4 px-6 font-bold text-blue-600 font-unbounded">Супер</th>
                    <th className="text-center py-4 px-6 font-bold text-purple-600 font-unbounded">Максимум</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Фотографии</td>
                    <td className="text-center py-4 px-6 font-unbounded">4</td>
                    <td className="text-center py-4 px-6 font-unbounded">10</td>
                    <td className="text-center py-4 px-6 font-unbounded">20</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Описание</td>
                    <td className="text-center py-4 px-6 font-unbounded">Базовое</td>
                    <td className="text-center py-4 px-6 font-unbounded">Расширенное с фото</td>
                    <td className="text-center py-4 px-6 font-unbounded">Расширенное с фото</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Адрес + координаты</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Отзывы</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Район и метро</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Цена от (поле ввода)</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Вопросы/Ответы</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Аналитика</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅ Специальная</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Особенности (иконки)</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Новости (3 поста/месяц)</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Возрастные ограничения</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Видео</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Товары и услуги</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">✅</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-unbounded">Чат с клиентами</td>
                    <td className="text-center py-4 px-6 font-unbounded">❌</td>
                    <td className="text-center py-4 px-6 font-unbounded">Скоро</td>
                    <td className="text-center py-4 px-6 font-unbounded">Скоро</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
