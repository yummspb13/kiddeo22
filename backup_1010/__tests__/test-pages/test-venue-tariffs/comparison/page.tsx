'use client';

import { useState } from 'react';
import VenueTemplateSelector from '@/components/VenueTemplateSelector';

export default function TestVenueComparisonPage() {
  const [selectedTariff, setSelectedTariff] = useState<'FREE' | 'SUPER' | 'MAXIMUM'>('FREE');

  // Тестовые данные для разных тарифов
  const venues = {
    FREE: {
      id: 1,
      name: 'Попугайня',
      slug: 'popugaynya',
      address: 'Санкт-Петербург, пр. Стачек, д. 39',
      heroImage: '/uploads/venue-hero.jpg',
      coverImage: '/uploads/venue-cover.jpg',
      subcategoryId: 1,
      vendorId: 1,
      cityId: 1,
      tariff: 'FREE' as const,
      status: 'ACTIVE',
      moderationReason: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      priceFrom: null,
      priceTo: null,
      isFree: true,
      capacity: 15,
      vendor: {
        id: 1,
        displayName: 'Зоопарк "Попугайня"',
        description: 'Уютный зоопарк с экзотическими птицами и животными. Идеальное место для семейного отдыха с детьми.',
        logo: '/uploads/vendor-logo.jpg',
        website: 'https://popugaynya.ru',
        phone: '+7 (812) 123-45-67',
        email: 'info@popugaynya.ru',
        address: 'Санкт-Петербург, пр. Стачек, д. 39'
      },
      subcategory: {
        name: 'Зоопарки',
        slug: 'zooparki',
        category: {
          name: 'Развлечения',
          slug: 'razvlecheniya'
        }
      },
      _count: {
        parameters: 5
      }
    },
    SUPER: {
      id: 2,
      name: 'Детская студия "Ням-Ням"',
      slug: 'detskaya-studiya-nyam-nyam',
      address: 'ул. Тверская, 15, Москва',
      heroImage: '/uploads/venue-hero.jpg',
      coverImage: '/uploads/venue-cover.jpg',
      subcategoryId: 2,
      vendorId: 2,
      cityId: 1,
      tariff: 'SUPER' as const,
      status: 'ACTIVE',
      moderationReason: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      priceFrom: 1500,
      priceTo: 3000,
      isFree: false,
      capacity: 20,
      vendor: {
        id: 2,
        displayName: 'Студия "Ням-Ням"',
        description: 'Профессиональная детская студия с современным оборудованием и опытными педагогами. Мы создаем уютную атмосферу для развития творческих способностей детей.',
        logo: '/uploads/vendor-logo.jpg',
        website: 'https://nyam-nyam.ru',
        phone: '+7 (495) 123-45-67',
        email: 'info@nyam-nyam.ru',
        address: 'ул. Тверская, 15, Москва'
      },
      subcategory: {
        name: 'Детские студии',
        slug: 'detskie-studii',
        category: {
          name: 'Образование',
          slug: 'obrazovanie'
        }
      },
      _count: {
        parameters: 10
      }
    },
    MAXIMUM: {
      id: 3,
      name: 'Премиум детский центр "Звездочка"',
      slug: 'premium-detskiy-tsentr-zvezdochka',
      address: 'ул. Красная площадь, 1, Москва',
      heroImage: '/uploads/venue-hero.jpg',
      coverImage: '/uploads/venue-cover.jpg',
      subcategoryId: 3,
      vendorId: 3,
      cityId: 1,
      tariff: 'MAXIMUM' as const,
      status: 'ACTIVE',
      moderationReason: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      priceFrom: 5000,
      priceTo: 15000,
      isFree: false,
      capacity: 50,
      vendor: {
        id: 3,
        displayName: 'Премиум центр "Звездочка"',
        description: 'Эксклюзивный детский центр с премиальным сервисом. У нас работают лучшие педагоги, используется самое современное оборудование, а помещения оформлены по индивидуальному дизайну.',
        logo: '/uploads/vendor-logo.jpg',
        website: 'https://zvezdochka-premium.ru',
        phone: '+7 (495) 999-99-99',
        email: 'info@zvezdochka-premium.ru',
        address: 'ул. Красная площадь, 1, Москва'
      },
      subcategory: {
        name: 'Премиум центры',
        slug: 'premium-tsentry',
        category: {
          name: 'Премиум',
          slug: 'premium'
        }
      },
      _count: {
        parameters: 25
      }
    }
  };

  const similarVenues = [
    {
      id: 2,
      name: 'Детский зоопарк "Лесная сказка"',
      slug: 'detskiy-zoopark-lesnaya-skazka',
      address: 'ул. Невский проспект, 25, СПб',
      heroImage: '/uploads/venue-2.jpg',
      coverImage: '/uploads/venue-2-cover.jpg',
      vendor: {
        displayName: 'Зоопарк "Лесная сказка"',
        logo: '/uploads/vendor-2-logo.jpg'
      },
      subcategory: {
        name: 'Зоопарки',
        slug: 'zooparki',
        category: {
          name: 'Развлечения',
          slug: 'razvlecheniya'
        }
      },
      _count: {
        parameters: 3
      }
    },
    {
      id: 3,
      name: 'Парк птиц "Крылья"',
      slug: 'park-ptits-krylya',
      address: 'ул. Московский проспект, 10, СПб',
      heroImage: '/uploads/venue-3.jpg',
      coverImage: '/uploads/venue-3-cover.jpg',
      vendor: {
        displayName: 'Парк "Крылья"',
        logo: '/uploads/vendor-3-logo.jpg'
      },
      subcategory: {
        name: 'Парки',
        slug: 'parki',
        category: {
          name: 'Развлечения',
          slug: 'razvlecheniya'
        }
      },
      _count: {
        parameters: 4
      }
    }
  ];

  const cityData = {
    id: 1,
    name: 'Москва',
    slug: 'moskva'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-unbounded">
            Сравнение тарифов в реальном времени
          </h1>
          <p className="text-lg text-gray-600 font-unbounded">
            Переключайтесь между тарифами и смотрите, как меняется страница места
          </p>
        </div>
      </header>

      {/* Переключатель тарифов */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setSelectedTariff('FREE')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded ${
                selectedTariff === 'FREE'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🆓 Бесплатный
            </button>
            <button
              onClick={() => setSelectedTariff('SUPER')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded ${
                selectedTariff === 'SUPER'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⭐ Супер
            </button>
            <button
              onClick={() => setSelectedTariff('MAXIMUM')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-unbounded ${
                selectedTariff === 'MAXIMUM'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👑 Максимум
            </button>
          </div>
        </div>
      </div>

      {/* Отображение выбранного тарифа */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <VenueTemplateSelector 
            venue={venues[selectedTariff]}
            similarVenues={similarVenues}
            city={cityData}
          />
        </div>
      </main>

      {/* Информация о текущем тарифе */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-unbounded">
              Текущий тариф: {venues[selectedTariff].name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 font-unbounded">
                  {venues[selectedTariff].tariff === 'FREE' ? 'Бесплатно' : 
                   venues[selectedTariff].tariff === 'SUPER' ? `${venues[selectedTariff].priceFrom}₽ - ${venues[selectedTariff].priceTo}₽` :
                   venues[selectedTariff].tariff === 'MAXIMUM' ? `${venues[selectedTariff].priceFrom}₽ - ${venues[selectedTariff].priceTo}₽` :
                   'Цена по запросу'}
                </div>
                <div className="text-sm text-gray-500 font-unbounded">Цена за час</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 font-unbounded">
                  {venues[selectedTariff]._count.parameters}
                </div>
                <div className="text-sm text-gray-500 font-unbounded">Параметров места</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 font-unbounded">
                  {venues[selectedTariff].capacity || 'N/A'}
                </div>
                <div className="text-sm text-gray-500 font-unbounded">Вместимость</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
