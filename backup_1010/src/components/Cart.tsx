'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles,
  Zap,
  Star,
  Heart,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Shield,
  Gift
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/contexts/CartContext';

// Компонент кнопки корзины в хедере
export function CartButton() {
  const { state, toggleCart } = useCart();
  const controls = useAnimation();

  // Анимация при добавлении товара
  useEffect(() => {
    if (state.isAnimating) {
      controls.start({
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.6, ease: "easeInOut" }
      });
    }
  }, [state.isAnimating, controls]);

  return (
    <motion.button
      animate={controls}
      onClick={toggleCart}
      className="relative p-2 rounded-full bg-transparent text-gray-700 hover:bg-gray-100 transition-all duration-300 group"
    >
      <ShoppingCart className="w-6 h-6" />
      
      {/* Счетчик товаров */}
      <AnimatePresence>
        {state.itemCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
          >
            {state.itemCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Эффект свечения при анимации */}
      {state.isAnimating && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-sm"
        />
      )}

      {/* Эффект частиц */}
      {state.isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [1, 0, 0],
                x: Math.cos(i * 60 * Math.PI / 180) * 30,
                y: Math.sin(i * 60 * Math.PI / 180) * 30,
              }}
              transition={{ 
                duration: 1,
                delay: i * 0.1,
                ease: "easeOut"
              }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}

// Компонент элемента корзины
function CartItemComponent({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeFromCart(item.id);
    }, 300);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove();
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        y: 0, 
        scale: isRemoving ? 0.9 : 1,
        x: isRemoving ? 100 : 0
      }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex gap-4">
        {/* Изображение */}
        <div className="relative flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100"
          >
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-purple-400" />
              </div>
            )}
          </motion.div>
          
          {/* Индикатор типа */}
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
            {item.type === 'ticket' ? '🎫' : '🛍️'}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          
          {/* Метаданные */}
          <div className="flex flex-wrap gap-2 mt-2">
            {item.vendor && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                <Users className="w-3 h-3" />
                {item.vendor}
              </span>
            )}
            {item.date && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {item.date}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                {item.location}
              </span>
            )}
            {item.ageGroup && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                <Star className="w-3 h-3" />
                {item.ageGroup}
              </span>
            )}
          </div>
        </div>

        {/* Управление количеством и ценой */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {item.price.toLocaleString()} ₽
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-gray-500">
                {item.price.toLocaleString()} × {item.quantity}
              </div>
            )}
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            
            <motion.span
              key={item.quantity}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="w-8 text-center font-semibold"
            >
              {item.quantity}
            </motion.span>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
              className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Кнопка удаления */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Основной компонент корзины
export function Cart() {
  const { state, toggleCart, clearCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(state.isOpen);
  }, [state.isOpen]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Корзина */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Заголовок */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ShoppingCart className="w-6 h-6" />
                  </motion.div>
                  <h2 className="text-xl font-bold">Корзина</h2>
                  {state.itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white/20 px-2 py-1 rounded-full text-sm font-semibold"
                    >
                      {state.itemCount}
                    </motion.span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleCart}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Содержимое корзины */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {state.items.length === 0 ? (
                // Пустая корзина
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <ShoppingCart className="w-12 h-12 text-purple-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Корзина пуста
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Добавьте билеты или товары, чтобы они появились здесь
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleCart}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Продолжить покупки
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* Список товаров */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {state.items.map((item) => (
                        <CartItemComponent key={item.id} item={item} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Итого и кнопки */}
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    {/* Итого */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-semibold text-gray-900">
                        Итого:
                      </span>
                      <motion.span
                        key={state.total}
                        initial={{ scale: 1.2, color: '#10b981' }}
                        animate={{ scale: 1, color: '#111827' }}
                        className="text-2xl font-bold text-gray-900"
                      >
                        {state.total.toLocaleString()} ₽
                      </motion.span>
                    </div>

                    {/* Кнопки */}
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        Оформить заказ
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                      </motion.button>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={clearCart}
                          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Очистить
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={toggleCart}
                          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Продолжить
                        </motion.button>
                      </div>
                    </div>

                    {/* Гарантии */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Безопасная оплата</span>
                      <span>•</span>
                      <span>Гарантия возврата</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
