'use client';

import { useState } from 'react';
import VenueDetailsFull from '@/components/VenueDetailsFull';

export default function TestVenueSuperPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  // Тестовые данные для места с СУПЕР тарифом
  const testVenue = {
    id: 2,
    name: 'Детская студия "Ням-Ням"',
    slug: 'detskaya-studiya-nyam-nyam',
    address: 'ул. Тверская, 15, Москва',
    heroImage: '/uploads/venue-hero.jpg',
    coverImage: '/uploads/venue-cover.jpg',
    subcategoryId: 2,
    vendorId: 2,
    cityId: 1,
    tariff: 'SUPER', // СУПЕР тариф
    status: 'ACTIVE',
    moderationReason: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    priceFrom: 1500, // Диапазон цен для супер тарифа
    priceTo: 3000,
    isFree: false,
    capacity: 20,
    // Координаты
    lat: 55.7558,
    lng: 37.6176,
    // Район и метро
    district: 'Тверской район',
    metro: 'Тверская',
    // 10 фотографий для супер тарифа
    additionalImages: [
      '/uploads/venue-1.jpg',
      '/uploads/venue-2.jpg', 
      '/uploads/venue-3.jpg',
      '/uploads/venue-4.jpg',
      '/uploads/venue-5.jpg',
      '/uploads/venue-6.jpg',
      '/uploads/venue-7.jpg',
      '/uploads/venue-8.jpg',
      '/uploads/venue-9.jpg',
      '/uploads/venue-10.jpg'
    ],
    // Возрастные ограничения
    ageFrom: 3,
    ageTo: 12,
    vendor: {
      id: 2,
      displayName: 'Студия "Ням-Ням"',
      description: 'Профессиональная детская студия с современным оборудованием и опытными педагогами. Мы создаем уютную атмосферу для развития творческих способностей детей. У нас есть кулинарные мастер-классы, уроки рисования, лепки и многое другое.',
      logo: '/uploads/vendor-logo.jpg',
      website: 'https://nyam-nyam.ru',
      phone: '+7 (495) 123-45-67',
      email: 'info@nyam-nyam.ru',
      address: 'ул. Тверская, 15, Москва'
    },
    subcategory: {
      id: 2,
      name: 'Детские студии',
      slug: 'detskie-studii',
      category: {
        id: 2,
        name: 'Образование',
        slug: 'obrazovanie'
      }
    },
    // Отзывы для супер тарифа
    Review: [
      {
        id: 1,
        rating: 5,
        comment: 'Отличная студия! Ребенок в восторге от мастер-классов по кулинарии.',
        createdAt: '2024-01-20T10:30:00Z',
        User_Review_userIdToUser: {
          name: 'Елена Смирнова',
          image: '/uploads/user-1.jpg'
        }
      },
      {
        id: 2,
        rating: 5,
        comment: 'Прекрасные педагоги, очень внимательные к детям. Рекомендую!',
        createdAt: '2024-01-18T14:20:00Z',
        User_Review_userIdToUser: {
          name: 'Александр Козлов',
          image: '/uploads/user-2.jpg'
        }
      },
      {
        id: 3,
        rating: 4,
        comment: 'Хорошая студия, но цены немного высокие. Качество занятий отличное.',
        createdAt: '2024-01-15T16:45:00Z',
        User_Review_userIdToUser: {
          name: 'Мария Волкова',
          image: '/uploads/user-3.jpg'
        }
      }
    ],
    // Вопросы и ответы для супер тарифа
    QnA: [
      {
        id: 1,
        question: 'С какого возраста можно записаться на занятия?',
        answer: 'Мы принимаем детей от 3 лет. Для малышей у нас есть специальные адаптированные программы.',
        createdAt: '2024-01-10T09:00:00Z',
        author: 'Администратор студии'
      },
      {
        id: 2,
        question: 'Нужно ли приносить с собой материалы для занятий?',
        answer: 'Все необходимые материалы мы предоставляем. Вам нужно только принести хорошее настроение!',
        createdAt: '2024-01-08T11:30:00Z',
        author: 'Администратор студии'
      }
    ],
    // Особенности места (иконки) для супер тарифа
    features: [
      { id: 1, name: 'Парковка', icon: '🚗' },
      { id: 2, name: 'Wi-Fi', icon: '📶' },
      { id: 3, name: 'Кондиционер', icon: '❄️' },
      { id: 4, name: 'Доступ для инвалидов', icon: '♿' },
      { id: 5, name: 'Кафе', icon: '☕' }
    ],
    // Новости (3 поста в месяц) для супер тарифа
    news: [
      {
        id: 1,
        title: 'Новый мастер-класс по выпечке!',
        content: 'Приглашаем всех на наш новый мастер-класс по выпечке пирожных. Дети научатся готовить вкусные десерты!',
        image: '/uploads/news-1.jpg',
        createdAt: '2024-01-25T10:00:00Z'
      },
      {
        id: 2,
        title: 'Летний лагерь 2024',
        content: 'Записывайтесь на наш летний творческий лагерь! 5 дней увлекательных занятий и развлечений.',
        image: '/uploads/news-2.jpg',
        createdAt: '2024-01-20T14:00:00Z'
      },
      {
        id: 3,
        title: 'Выставка детских работ',
        content: 'В конце месяца состоится выставка работ наших учеников. Приходите поддержать юных художников!',
        image: '/uploads/news-3.jpg',
        createdAt: '2024-01-15T16:00:00Z'
      }
    ],
    _count: {
      parameters: 10 // Больше параметров для супер тарифа
    }
  };

  // Тестовые данные для похожих мест
  const testSimilarVenues = [
    {
      id: 3,
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
      id: 4,
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
      id: 5,
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
          <h1 className="text-3xl font-bold text-gray-900">Тест страницы места - СУПЕР тариф</h1>
          <p className="mt-2 text-lg text-gray-600">Детская студия "Ням-Ням" - пример места с супер тарифом</p>
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
