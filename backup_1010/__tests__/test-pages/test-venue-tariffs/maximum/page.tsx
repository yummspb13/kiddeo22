'use client';

import { useState } from 'react';
import VenueDetailsFull from '@/components/VenueDetailsFull';

export default function TestVenueMaximumPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  // Тестовые данные для места с МАКСИМУМ тарифом
  const testVenue = {
    id: 3,
    name: 'Премиум детский центр "Звездочка"',
    slug: 'premium-detskiy-tsentr-zvezdochka',
    address: 'ул. Красная площадь, 1, Москва',
    heroImage: '/uploads/venue-hero.jpg',
    coverImage: '/uploads/venue-cover.jpg',
    subcategoryId: 3,
    vendorId: 3,
    cityId: 1,
    tariff: 'MAXIMUM', // МАКСИМУМ тариф
    status: 'ACTIVE',
    moderationReason: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    priceFrom: 5000, // Высокие цены для максимум тарифа
    priceTo: 15000,
    isFree: false,
    capacity: 50,
    // Координаты
    lat: 55.7539,
    lng: 37.6208,
    // Район и метро
    district: 'Центральный район',
    metro: 'Охотный ряд',
    // 20 фотографий для максимум тарифа
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
      '/uploads/venue-10.jpg',
      '/uploads/venue-11.jpg',
      '/uploads/venue-12.jpg',
      '/uploads/venue-13.jpg',
      '/uploads/venue-14.jpg',
      '/uploads/venue-15.jpg',
      '/uploads/venue-16.jpg',
      '/uploads/venue-17.jpg',
      '/uploads/venue-18.jpg',
      '/uploads/venue-19.jpg',
      '/uploads/venue-20.jpg'
    ],
    // Видео для максимум тарифа
    videos: [
      {
        id: 1,
        title: 'Экскурсия по центру',
        url: '/uploads/video-tour.mp4',
        thumbnail: '/uploads/video-thumb-1.jpg',
        duration: '3:45'
      },
      {
        id: 2,
        title: 'Мастер-класс по рисованию',
        url: '/uploads/video-masterclass.mp4',
        thumbnail: '/uploads/video-thumb-2.jpg',
        duration: '8:20'
      }
    ],
    // Возрастные ограничения
    ageFrom: 2,
    ageTo: 16,
    vendor: {
      id: 3,
      displayName: 'Премиум центр "Звездочка"',
      description: 'Эксклюзивный детский центр с премиальным сервисом. У нас работают лучшие педагоги, используется самое современное оборудование, а помещения оформлены по индивидуальному дизайну. Мы предлагаем полный спектр развивающих программ для детей от 2 до 16 лет.',
      logo: '/uploads/vendor-logo.jpg',
      website: 'https://zvezdochka-premium.ru',
      phone: '+7 (495) 999-99-99',
      email: 'info@zvezdochka-premium.ru',
      address: 'ул. Красная площадь, 1, Москва'
    },
    subcategory: {
      id: 3,
      name: 'Премиум центры',
      slug: 'premium-tsentry',
      category: {
        id: 3,
        name: 'Премиум',
        slug: 'premium'
      }
    },
    // Отзывы для максимум тарифа
    Review: [
      {
        id: 1,
        rating: 5,
        comment: 'Невероятный центр! Все на высшем уровне. Ребенок просто в восторге.',
        createdAt: '2024-01-25T10:30:00Z',
        User_Review_userIdToUser: {
          name: 'Ольга Премиум',
          image: '/uploads/user-1.jpg'
        }
      },
      {
        id: 2,
        rating: 5,
        comment: 'Стоит своих денег. Персонал на уровне 5-звездочного отеля.',
        createdAt: '2024-01-22T14:20:00Z',
        User_Review_userIdToUser: {
          name: 'Дмитрий VIP',
          image: '/uploads/user-2.jpg'
        }
      },
      {
        id: 3,
        rating: 5,
        comment: 'Лучший детский центр в городе! Рекомендую всем.',
        createdAt: '2024-01-20T16:45:00Z',
        User_Review_userIdToUser: {
          name: 'Анна Люкс',
          image: '/uploads/user-3.jpg'
        }
      }
    ],
    // Вопросы и ответы для максимум тарифа
    QnA: [
      {
        id: 1,
        question: 'Какие VIP услуги включены в тариф?',
        answer: 'В тариф включены: персональный менеджер, индивидуальные занятия, питание от шеф-повара, трансфер и многое другое.',
        createdAt: '2024-01-15T09:00:00Z',
        author: 'VIP менеджер'
      },
      {
        id: 2,
        question: 'Можно ли заказать индивидуальную программу?',
        answer: 'Конечно! Мы создаем индивидуальные программы для каждого ребенка с учетом его особенностей и интересов.',
        createdAt: '2024-01-12T11:30:00Z',
        author: 'VIP менеджер'
      }
    ],
    // Особенности места (иконки) для максимум тарифа
    features: [
      { id: 1, name: 'VIP парковка', icon: '🚗' },
      { id: 2, name: 'Wi-Fi премиум', icon: '📶' },
      { id: 3, name: 'Климат-контроль', icon: '❄️' },
      { id: 4, name: 'Доступ для инвалидов', icon: '♿' },
      { id: 5, name: 'VIP кафе', icon: '☕' },
      { id: 6, name: 'Персональный менеджер', icon: '👨‍💼' },
      { id: 7, name: 'Трансфер', icon: '🚐' },
      { id: 8, name: 'Спа-зона', icon: '🧘' }
    ],
    // Новости (3 поста в месяц) для максимум тарифа
    news: [
      {
        id: 1,
        title: 'Новая VIP программа "Гений"',
        content: 'Представляем эксклюзивную программу развития для одаренных детей с индивидуальным подходом.',
        image: '/uploads/news-1.jpg',
        createdAt: '2024-01-28T10:00:00Z'
      },
      {
        id: 2,
        title: 'Мастер-класс от звезды',
        content: 'Приглашаем на мастер-класс от известного художника. Количество мест ограничено!',
        image: '/uploads/news-2.jpg',
        createdAt: '2024-01-25T14:00:00Z'
      },
      {
        id: 3,
        title: 'Эксклюзивная экскурсия',
        content: 'VIP экскурсия в музей для наших клиентов. Трансфер и обед включены.',
        image: '/uploads/news-3.jpg',
        createdAt: '2024-01-22T16:00:00Z'
      }
    ],
    // Товары и услуги для максимум тарифа
    products: [
      {
        id: 1,
        name: 'Набор для творчества "Маленький художник"',
        price: 2500,
        image: '/uploads/product-1.jpg',
        description: 'Профессиональный набор для рисования с качественными материалами'
      },
      {
        id: 2,
        name: 'Индивидуальное занятие с педагогом',
        price: 5000,
        image: '/uploads/product-2.jpg',
        description: 'Персональное занятие с опытным педагогом по выбранному направлению'
      },
      {
        id: 3,
        name: 'VIP день рождения',
        price: 15000,
        image: '/uploads/product-3.jpg',
        description: 'Организация незабываемого дня рождения с полным сервисом'
      }
    ],
    // Специальная аналитика для максимум тарифа
    analytics: {
      views: 1250,
      bookings: 45,
      revenue: 675000,
      rating: 4.9,
      conversionRate: 3.6,
      topFeatures: ['VIP сервис', 'Индивидуальные занятия', 'Трансфер'],
      monthlyGrowth: 15.2
    },
    _count: {
      parameters: 25 // Максимум параметров для максимум тарифа
    }
  };

  // Тестовые данные для похожих мест
  const testSimilarVenues = [
    {
      id: 4,
      name: 'Элитный детский сад "Академия"',
      slug: 'elitnyy-detskiy-sad-akademiya',
      address: 'ул. Тверская, 50, Москва',
      heroImage: '/uploads/venue-2.jpg',
      coverImage: '/uploads/venue-2-cover.jpg',
      vendor: {
        displayName: 'Академия "Элит"',
        logo: '/uploads/vendor-2-logo.jpg'
      },
      subcategory: {
        name: 'Элитные сады',
        slug: 'elitnye-sady',
        category: {
          name: 'Премиум',
          slug: 'premium'
        }
      },
      _count: {
        parameters: 20
      }
    },
    {
      id: 5,
      name: 'VIP детский клуб "Премьер"',
      slug: 'vip-detskiy-klub-premier',
      address: 'ул. Арбат, 100, Москва',
      heroImage: '/uploads/venue-3.jpg',
      coverImage: '/uploads/venue-3-cover.jpg',
      vendor: {
        displayName: 'Клуб "Премьер"',
        logo: '/uploads/vendor-3-logo.jpg'
      },
      subcategory: {
        name: 'VIP клубы',
        slug: 'vip-kluby',
        category: {
          name: 'Премиум',
          slug: 'premium'
        }
      },
      _count: {
        parameters: 22
      }
    },
    {
      id: 6,
      name: 'Люкс студия "Гений"',
      slug: 'lyuks-studiya-geniy',
      address: 'ул. Кузнецкий мост, 200, Москва',
      heroImage: '/uploads/venue-4.jpg',
      coverImage: '/uploads/venue-4-cover.jpg',
      vendor: {
        displayName: 'Студия "Гений"',
        logo: '/uploads/vendor-4-logo.jpg'
      },
      subcategory: {
        name: 'Люкс студии',
        slug: 'lyuks-studii',
        category: {
          name: 'Премиум',
          slug: 'premium'
        }
      },
      _count: {
        parameters: 18
      }
    },
    {
      id: 7,
      name: 'Эксклюзивный театр "Магия"',
      slug: 'eksklyuzivnyy-teatr-magiya',
      address: 'ул. Петровка, 300, Москва',
      heroImage: '/uploads/venue-5.jpg',
      coverImage: '/uploads/venue-5-cover.jpg',
      vendor: {
        displayName: 'Театр "Магия"',
        logo: '/uploads/vendor-5-logo.jpg'
      },
      subcategory: {
        name: 'Эксклюзивные театры',
        slug: 'eksklyuzivnye-teatry',
        category: {
          name: 'Премиум',
          slug: 'premium'
        }
      },
      _count: {
        parameters: 15
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
          <h1 className="text-3xl font-bold text-gray-900">Тест страницы места - МАКСИМУМ тариф</h1>
          <p className="mt-2 text-lg text-gray-600">Премиум детский центр "Звездочка" - пример места с максимум тарифом</p>
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
