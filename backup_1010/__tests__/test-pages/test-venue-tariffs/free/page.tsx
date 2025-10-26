'use client';

import { useState } from 'react';
import VenueDetailsFull from '@/components/VenueDetailsFull';

export default function TestVenueFreePage() {
  const [isFavorite, setIsFavorite] = useState(false);

  // Тестовые данные для места с БЕСПЛАТНЫМ тарифом
  const testVenue = {
    id: 1,
    name: 'Попугайня',
    slug: 'popugaynya',
    address: 'Санкт-Петербург, пр. Стачек, д. 39',
    heroImage: '/uploads/venue-hero.jpg',
    coverImage: '/uploads/venue-cover.jpg',
    subcategoryId: 1,
    vendorId: 1,
    cityId: 1,
    tariff: 'FREE', // БЕСПЛАТНЫЙ тариф
    status: 'ACTIVE',
    moderationReason: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    priceFrom: null, // Для бесплатного тарифа
    priceTo: null,   // Для бесплатного тарифа
    isFree: true,    // Бесплатное место
    capacity: 15,
    // Координаты для бесплатного тарифа
    lat: 59.933913,
    lng: 30.319412,
    // Район и метро для бесплатного тарифа
    district: 'Кировский район',
    metro: 'Нарвская',
    // 4 фотографии для бесплатного тарифа
    additionalImages: [
      '/uploads/venue-1.jpg',
      '/uploads/venue-2.jpg', 
      '/uploads/venue-3.jpg',
      '/uploads/venue-4.jpg'
    ],
    vendor: {
      id: 1,
      displayName: 'Зоопарк "Попугайня"',
      description: 'Уютный зоопарк с экзотическими птицами и животными. Идеальное место для семейного отдыха с детьми. У нас можно покормить попугаев, понаблюдать за жизнью животных и узнать много интересного о природе.',
      logo: '/uploads/vendor-logo.jpg',
      website: 'https://popugaynya.ru',
      phone: '+7 (812) 123-45-67',
      email: 'info@popugaynya.ru',
      address: 'Санкт-Петербург, пр. Стачек, д. 39'
    },
    subcategory: {
      id: 1,
      name: 'Зоопарки',
      slug: 'zooparki',
      category: {
        id: 1,
        name: 'Развлечения',
        slug: 'razvlecheniya'
      }
    },
    // Отзывы для бесплатного тарифа
    Review: [
      {
        id: 1,
        rating: 5,
        comment: 'Отличное место для детей! Попугаи очень красивые, дети в восторге.',
        createdAt: '2024-01-15T10:30:00Z',
        User_Review_userIdToUser: {
          name: 'Анна Петрова',
          image: '/uploads/user-1.jpg'
        }
      },
      {
        id: 2,
        rating: 4,
        comment: 'Хорошее место, но немного тесновато. Персонал дружелюбный.',
        createdAt: '2024-01-10T14:20:00Z',
        User_Review_userIdToUser: {
          name: 'Михаил Иванов',
          image: '/uploads/user-2.jpg'
        }
      }
    ],
    _count: {
      parameters: 4 // Базовые параметры для бесплатного тарифа
    }
  };

  // Тестовые данные для похожих мест
  const testSimilarVenues = [
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

  const testCity = {
    id: 1,
    name: 'Санкт-Петербург',
    slug: 'sankt-peterburg'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Тест страницы места - БЕСПЛАТНЫЙ тариф</h1>
          <p className="mt-2 text-lg text-gray-600">Попугайня - пример места с бесплатным тарифом</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <VenueDetailsFull 
            venue={testVenue}
            similarVenues={testSimilarVenues}
            city={testCity}
          />
        </div>
      </main>
    </div>
  );
}
