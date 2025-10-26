'use client';

import { useState } from 'react';
import VenueDetailsFull from '@/components/VenueDetailsFull';

export default function TestVenueFullPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  // Тестовые данные для места
  const testVenue = {
    id: 1,
    name: 'Детская студия "Ням-Ням"',
    slug: 'detskaya-studiya-nyam-nyam',
    address: 'ул. Тверская, 15, Москва',
    heroImage: '/uploads/venue-hero.jpg',
    coverImage: '/uploads/venue-cover.jpg',
    subcategoryId: 1,
    vendorId: 1,
    cityId: 1,
    tariff: 'PAID',
    status: 'ACTIVE',
    moderationReason: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    priceFrom: 1500,
    priceTo: 3000,
    isFree: false,
    capacity: 20,
    vendor: {
      id: 1,
      displayName: 'Студия "Ням-Ням"',
      description: 'Профессиональная детская студия с современным оборудованием и опытными педагогами. Мы создаем уютную атмосферу для развития творческих способностей детей.',
      logo: '/uploads/vendor-logo.jpg',
      website: 'https://nyam-nyam.ru',
      phone: '+7 (495) 123-45-67',
      email: 'info@nyam-nyam.ru',
      address: 'ул. Тверская, 15, Москва'
    },
    subcategory: {
      id: 1,
      name: 'Детские студии',
      slug: 'detskie-studii',
      category: {
        id: 1,
        name: 'Образование',
        slug: 'obrazovanie'
      }
    },
    _count: {
      parameters: 10
    }
  };

  // Тестовые данные для похожих мест
  const testSimilarVenues = [
    {
      id: 2,
      name: 'Детский клуб "Радуга"',
      slug: 'detskiy-klub-raduga',
      address: 'ул. Арбат, 25, Москва',
      heroImage: '/uploads/venue-2.jpg',
      coverImage: '/uploads/venue-2-cover.jpg',
      vendor: {
        displayName: 'Клуб "Радуга"',
        logo: '/uploads/vendor-2-logo.jpg'
      },
      subcategory: {
        name: 'Детские клубы',
        slug: 'detskie-kluby',
        category: {
          name: 'Развлечения',
          slug: 'razvlecheniya'
        }
      },
      _count: {
        parameters: 8
      }
    },
    {
      id: 3,
      name: 'Студия рисования "Кисточка"',
      slug: 'studiya-risovaniya-kistochka',
      address: 'ул. Кузнецкий мост, 10, Москва',
      heroImage: '/uploads/venue-3.jpg',
      coverImage: '/uploads/venue-3-cover.jpg',
      vendor: {
        displayName: 'Студия "Кисточка"',
        logo: '/uploads/vendor-3-logo.jpg'
      },
      subcategory: {
        name: 'Художественные студии',
        slug: 'hudozhestvennye-studii',
        category: {
          name: 'Творчество',
          slug: 'tvorchestvo'
        }
      },
      _count: {
        parameters: 12
      }
    },
    {
      id: 4,
      name: 'Детский театр "Сказка"',
      slug: 'detskiy-teatr-skazka',
      address: 'ул. Петровка, 5, Москва',
      heroImage: '/uploads/venue-4.jpg',
      coverImage: '/uploads/venue-4-cover.jpg',
      vendor: {
        displayName: 'Театр "Сказка"',
        logo: '/uploads/vendor-4-logo.jpg'
      },
      subcategory: {
        name: 'Театры',
        slug: 'teatry',
        category: {
          name: 'Искусство',
          slug: 'iskusstvo'
        }
      },
      _count: {
        parameters: 6
      }
    },
    {
      id: 5,
      name: 'Детский сад "Солнышко"',
      slug: 'detskiy-sad-solnyshko',
      address: 'ул. Ленинский проспект, 50, Москва',
      heroImage: '/uploads/venue-5.jpg',
      coverImage: '/uploads/venue-5-cover.jpg',
      vendor: {
        displayName: 'Детский сад "Солнышко"',
        logo: '/uploads/vendor-5-logo.jpg'
      },
      subcategory: {
        name: 'Детские сады',
        slug: 'detskie-sady',
        category: {
          name: 'Образование',
          slug: 'obrazovanie'
        }
      },
      _count: {
        parameters: 15
      }
    },
    {
      id: 6,
      name: 'Спортивный клуб "Чемпион"',
      slug: 'sportivnyy-klub-chempion',
      address: 'ул. Садовое кольцо, 30, Москва',
      heroImage: '/uploads/venue-6.jpg',
      coverImage: '/uploads/venue-6-cover.jpg',
      vendor: {
        displayName: 'Клуб "Чемпион"',
        logo: '/uploads/vendor-6-logo.jpg'
      },
      subcategory: {
        name: 'Спортивные клубы',
        slug: 'sportivnye-kluby',
        category: {
          name: 'Спорт',
          slug: 'sport'
        }
      },
      _count: {
        parameters: 20
      }
    }
  ];

  const testCity = {
    id: 1,
    name: 'Москва',
    slug: 'moskva'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Тест полной страницы места</h1>
          <p className="mt-2 text-lg text-gray-600">Точная копия страницы места из kr-marketplace</p>
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
