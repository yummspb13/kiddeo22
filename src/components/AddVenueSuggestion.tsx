'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Star, Gift, Send, CheckCircle } from 'lucide-react';

interface AddVenueSuggestionProps {
  citySlug: string;
}


export default function AddVenueSuggestion({ citySlug }: AddVenueSuggestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    category: 'other',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        address: '',
        description: '',
        category: 'other',
        contact: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Отправка предложения места...');
      
      const response = await fetch('/api/venue-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          citySlug
        }),
      });

      console.log('Ответ получен:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Предложение успешно создано:', result);
        
        setIsSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setIsOpen(false);
          setFormData({
            name: '',
            address: '',
            description: '',
            category: 'other',
            contact: ''
          });
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Ошибка API:', errorData);
        alert(`Ошибка при отправке предложения: ${errorData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error submitting venue suggestion:', error);
      alert('Ошибка при отправке предложения. Проверьте подключение к интернету.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <section style={{ marginTop: '30px', marginBottom: '0' }}>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2 font-unbounded">
            Спасибо за предложение! 🎉
          </h3>
          <p className="text-green-700 mb-4">
            Ваше предложение отправлено на модерацию. После одобрения вы получите баллы!
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <Gift className="w-4 h-4" />
            Баллы будут начислены после одобрения
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginTop: '30px', marginBottom: '0' }}>
      <div 
        className="border border-purple-200 rounded-3xl p-8 relative overflow-hidden"
        style={{
          backgroundImage: `url('/images/venue-suggestions/children-map-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/60"></div>
        
        <div className="relative z-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-unbounded">
              Знаете интересное место?
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto font-medium">
              Предложите новое место для детей в нашем каталоге и получите <span className="font-bold text-green-600">30 баллов</span>!
            </p>
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Gift className="w-4 h-4" />
                <span className="font-unbounded">+30 баллов</span>
              </div>
            </div>
          </div>

          {!isOpen ? (
            <div className="text-center">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-unbounded"
              >
                Предложить место
              </button>
              <p className="text-sm text-gray-500 mt-3 font-medium">
                Это займет всего 2 минуты
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/85 rounded-2xl p-8 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название места *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Например: Детский центр 'Радуга'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Улица, дом, район"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="education">Образование</option>
                  <option value="entertainment">Развлечения</option>
                  <option value="sports">Спорт</option>
                  <option value="art">Творчество</option>
                  <option value="science">Наука</option>
                  <option value="nature">Природа</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание места *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Расскажите, чем интересно это место для детей..."
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Контакты (необязательно)
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Телефон, сайт или соцсети"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Отправляем предложение...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Отправить предложение
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                * Обязательные поля. После одобрения вы получите 30 баллов.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
