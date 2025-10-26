'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EventCardWithCart } from '@/components/EventCardWithCart';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CartButton } from '@/components/Cart';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/contexts/CartContext';

export default function CartDemoPage() {
  const { state } = useCart();

  // Демо-события
  const demoEvents = [
    {
      id: '1',
      title: 'Мастер-класс по рисованию для детей',
      description: 'Увлекательный мастер-класс по акварели для детей от 5 лет',
      startDate: '2024-02-15T15:00:00Z',
      endDate: '2024-02-15T17:00:00Z',
      venue: 'Детский центр "Радуга"',
      organizer: 'Студия творчества "Кисточка"',
      price: 1500,
      image: '/uploads/demo-event-1.jpg',
      category: 'Творчество',
      ageFrom: 5,
      ageGroups: '5-8 лет',
      coordinates: '55.7558,37.6176',
      viewCount: 234,
      slug: 'master-klass-risovanie'
    },
    {
      id: '2',
      title: 'Спортивная тренировка для малышей',
      description: 'Веселая спортивная тренировка с элементами гимнастики',
      startDate: '2024-02-16T10:00:00Z',
      endDate: '2024-02-16T11:30:00Z',
      venue: 'Спортивный комплекс "Олимп"',
      organizer: 'Детский фитнес-клуб',
      price: 800,
      image: '/uploads/demo-event-2.jpg',
      category: 'Спорт',
      ageFrom: 3,
      ageGroups: '3-6 лет',
      coordinates: '55.7558,37.6176',
      viewCount: 156,
      slug: 'sportivnaya-trenirovka'
    },
    {
      id: '3',
      title: 'Музыкальный концерт для детей',
      description: 'Интерактивный концерт классической музыки',
      startDate: '2024-02-17T18:00:00Z',
      endDate: '2024-02-17T19:30:00Z',
      venue: 'Концертный зал "Филармония"',
      organizer: 'Детская филармония',
      price: 0,
      image: '/uploads/demo-event-3.jpg',
      category: 'Музыка',
      ageFrom: 4,
      ageGroups: '4-12 лет',
      coordinates: '55.7558,37.6176',
      viewCount: 89,
      slug: 'muzykalnyy-kontsert'
    }
  ];

  // Демо-товары
  const demoProducts = [
    {
      id: 'product-1',
      type: 'product' as const,
      title: 'Набор для творчества "Волшебная кисточка"',
      description: 'Полный набор для рисования акварелью',
      price: 2500,
      image: '/uploads/demo-product-1.jpg',
      vendor: 'Магазин "Творчество"',
      metadata: { category: 'Товары для творчества' }
    },
    {
      id: 'product-2',
      type: 'product' as const,
      title: 'Детский спортивный костюм',
      description: 'Удобный костюм для занятий спортом',
      price: 1800,
      image: '/uploads/demo-product-2.jpg',
      vendor: 'Спортивный магазин "Чемпион"',
      metadata: { category: 'Спортивная одежда' }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Демо корзины
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Тестируйте функциональность корзины с демо-данными
          </p>
          
          {/* Статистика корзины */}
          <div className="inline-flex items-center gap-6 bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{state.itemCount}</div>
              <div className="text-sm text-gray-600">товаров</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{state.total.toLocaleString()} ₽</div>
              <div className="text-sm text-gray-600">сумма</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{state.isOpen ? 'Открыта' : 'Закрыта'}</div>
              <div className="text-sm text-gray-600">корзина</div>
            </div>
          </div>
        </motion.div>

        {/* События */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">События</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {demoEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <EventCardWithCart event={event} />
              </motion.div>
            ))}
          </div>
          
          {/* Компактный вид */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Компактный вид</h3>
            {demoEvents.slice(0, 2).map((event, index) => (
              <motion.div
                key={`compact-${event.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <EventCardWithCart event={event} variant="compact" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Товары */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Товары</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">🛍️</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        {product.price.toLocaleString()} ₽
                      </div>
                      <AddToCartButton 
                        item={product} 
                        variant="default"
                        showQuantity
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Тестовые кнопки */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Тестовые кнопки</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AddToCartButton 
              item={{
                id: 'test-1',
                type: 'ticket',
                title: 'Тестовый билет',
                price: 500,
                vendor: 'Тестовый вендор'
              }}
              variant="default"
            />
            
            <AddToCartButton 
              item={{
                id: 'test-2',
                type: 'ticket',
                title: 'Большая кнопка',
                price: 1000,
                vendor: 'Тестовый вендор'
              }}
              variant="large"
            />
            
            <AddToCartButton 
              item={{
                id: 'test-3',
                type: 'ticket',
                title: 'Маленькая кнопка',
                price: 300,
                vendor: 'Тестовый вендор'
              }}
              variant="small"
            />
            
            <AddToCartButton 
              item={{
                id: 'test-4',
                type: 'ticket',
                title: 'Иконка',
                price: 200,
                vendor: 'Тестовый вендор'
              }}
              variant="icon"
            />
          </div>
        </motion.section>

        {/* Кнопка корзины */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="fixed bottom-8 right-8"
        >
          <CartButton />
        </motion.div>
      </div>
    </div>
  );
}
