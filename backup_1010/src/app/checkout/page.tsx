'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Gift,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'card' as 'card' | 'cash' | 'online',
    deliveryAddress: '',
    notes: ''
  });

  const steps = [
    { id: 1, title: 'Контактные данные', icon: User },
    { id: 2, title: 'Способ оплаты', icon: CreditCard },
    { id: 3, title: 'Подтверждение', icon: CheckCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Симуляция отправки заказа
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setOrderNumber(orderId);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
          <p className="text-gray-600 mb-8">Добавьте товары, чтобы оформить заказ</p>
          <Link
            href="/city/moskva/cat/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Вернуться к событиям
          </Link>
        </motion.div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Заказ оформлен!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            Номер заказа: <span className="font-mono font-bold text-purple-600">{orderNumber}</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">
              Подтверждение отправлено на {formData.email}
            </p>
            <div className="flex gap-3">
              <Link
                href="/city/moskva/cat/events"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Продолжить покупки
              </Link>
              <Link
                href="/profile/orders"
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Мои заказы
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Оформление заказа</h1>
          <p className="text-gray-600">Завершите покупку в несколько простых шагов</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная форма */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              {/* Прогресс-бар */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep >= step.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </motion.div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Содержимое шагов */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Контактные данные</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Имя и фамилия *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Введите ваше имя"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="+7 (999) 123-45-67"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес доставки (опционально)
                      </label>
                      <textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Укажите адрес, если нужна доставка"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Способ оплаты</h2>
                    
                    <div className="space-y-4">
                      {[
                        { id: 'card', title: 'Банковская карта', desc: 'Оплата картой онлайн', icon: CreditCard },
                        { id: 'online', title: 'Онлайн платеж', desc: 'СБП, Яндекс.Деньги, QIWI', icon: Sparkles },
                        { id: 'cash', title: 'Наличными', desc: 'При получении', icon: Gift }
                      ].map((method) => (
                        <motion.label
                          key={method.id}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.paymentMethod === method.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <method.icon className={`w-6 h-6 mr-4 ${
                            formData.paymentMethod === method.id ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-semibold text-gray-900">{method.title}</div>
                            <div className="text-sm text-gray-600">{method.desc}</div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Подтверждение заказа</h2>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Контактные данные</h3>
                      <p className="text-gray-600">{formData.name}</p>
                      <p className="text-gray-600">{formData.email}</p>
                      <p className="text-gray-600">{formData.phone}</p>
                      {formData.deliveryAddress && (
                        <p className="text-gray-600">{formData.deliveryAddress}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Способ оплаты</h3>
                      <p className="text-gray-600">
                        {formData.paymentMethod === 'card' && 'Банковская карта'}
                        {formData.paymentMethod === 'online' && 'Онлайн платеж'}
                        {formData.paymentMethod === 'cash' && 'Наличными'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Комментарий к заказу
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Дополнительные пожелания..."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Кнопки навигации */}
              <div className="flex justify-between mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </motion.button>
                
                {currentStep < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Далее
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Оформить заказ
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Боковая панель с товарами */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ваш заказ</h3>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="flex gap-3"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} ₽
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары ({state.itemCount})</span>
                  <span className="font-medium">{state.total.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка</span>
                  <span className="font-medium">{formData.deliveryAddress ? '300 ₽' : 'Бесплатно'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Итого</span>
                  <span>{(state.total + (formData.deliveryAddress ? 300 : 0)).toLocaleString()} ₽</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Безопасная оплата</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
