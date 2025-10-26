"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Phone, Image, CheckCircle, Building2, Mail, Globe, Shield } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface City {
  id: number
  name: string
  slug: string
}

interface VendorRegisterClientProps {
  cities: City[]
}

export default function VendorRegisterClient({ cities }: VendorRegisterClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    // Основная информация
    displayName: '',
    cityId: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    supportEmail: '',
    supportPhone: '',
    brandSlug: '',
    
    // Подтверждение представительства
    proofType: 'DOMAIN_EMAIL',
    proofData: '',
    
    // Согласия
    agreements: {
      pdn: false,
      tos: false,
      brandRights: false
    }
  })

  const steps = [
    {
      id: 1,
      title: "Основная информация",
      description: "Расскажите о вашей компании",
      icon: <Building2 className="w-6 h-6" />
    },
    {
      id: 2,
      title: "Контакты",
      description: "Как с вами связаться",
      icon: <Phone className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Подтверждение",
      description: "Подтвердите представительство",
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 4,
      title: "Согласия",
      description: "Примите условия использования",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setIsAnimating(true)
      setTimeout(() => {
      setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setIsAnimating(true)
      setTimeout(() => {
      setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          cityId: formData.cityId,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          supportEmail: formData.supportEmail,
          supportPhone: formData.supportPhone,
          brandSlug: formData.brandSlug,
          proofType: formData.proofType,
          proofData: formData.proofData,
          agreements: formData.agreements,
          address: '' // Добавляем пустой адрес для совместимости
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Vendor created successfully:', result)
        router.push('/vendor/onboarding')
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        console.error('Request data:', {
          displayName: formData.displayName,
          cityId: formData.cityId,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          supportEmail: formData.supportEmail,
          supportPhone: formData.supportPhone,
          brandSlug: formData.brandSlug,
          proofType: formData.proofType,
          proofData: formData.proofData,
          agreements: formData.agreements
        })
        addToast({
          type: 'error',
          title: 'Ошибка при создании профиля вендора',
          message: errorData.error || 'Неизвестная ошибка',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      addToast({
        type: 'error',
        title: 'Ошибка при создании профиля вендора',
        message: 'Произошла ошибка при создании профиля вендора. Попробуйте еще раз.',
        duration: 6000
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Название компании *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Введите название вашей компании"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Город *
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData(prev => ({ ...prev, cityId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Описание деятельности
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Расскажите о том, чем занимается ваша компания"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Brand Slug (URL)
              </label>
              <input
                type="text"
                value={formData.brandSlug}
                onChange={(e) => setFormData(prev => ({ ...prev, brandSlug: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="my-company"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Будет использоваться в URL: kiddeo.ru/company/my-company
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Телефон *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="+7 (999) 123-45-67"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="info@company.com"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Веб-сайт
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="https://company.com"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                  Email поддержки
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="support@company.com"
                  style={{ fontFamily: 'var(--font-unbounded)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                  Телефон поддержки
                </label>
                <input
                  type="tel"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportPhone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="+7 (999) 123-45-67"
                  style={{ fontFamily: 'var(--font-unbounded)' }}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Способ подтверждения представительства *
              </label>
              <select
                value={formData.proofType}
                onChange={(e) => setFormData(prev => ({ ...prev, proofType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                <option value="DOMAIN_EMAIL">Email на домене компании</option>
                <option value="DNS_RECORD">DNS запись</option>
                <option value="LETTER">Письмо-доверенность</option>
                <option value="PHOTO">Фото из зала/офиса</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Данные для подтверждения *
              </label>
              <textarea
                value={formData.proofData}
                onChange={(e) => setFormData(prev => ({ ...prev, proofData: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Опишите способ подтверждения или приложите ссылку на документ"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-3" style={{ fontFamily: 'var(--font-unbounded)' }}>Способы подтверждения:</h4>
              <ul className="text-sm text-blue-800 space-y-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                <li>• <strong>Email на домене:</strong> укажите email вида info@ваша-компания.com</li>
                <li>• <strong>DNS запись:</strong> добавьте TXT запись с кодом подтверждения</li>
                <li>• <strong>Письмо-доверенность:</strong> загрузите скан доверенности</li>
                <li>• <strong>Фото из зала:</strong> приложите фото с вывеской компании</li>
              </ul>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4" style={{ fontFamily: 'var(--font-unbounded)' }}>Согласия и разрешения</h4>
                
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={formData.agreements.pdn}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        agreements: { ...prev.agreements, pdn: e.target.checked }
                      }))}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        Я согласен с <a href="#" className="text-blue-600 hover:underline font-semibold">политикой обработки персональных данных</a> *
                      </span>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        Мы обрабатываем ваши данные в соответствии с ФЗ-152 "О персональных данных"
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={formData.agreements.tos}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        agreements: { ...prev.agreements, tos: e.target.checked }
                      }))}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        Я принимаю <a href="#" className="text-blue-600 hover:underline font-semibold">условия использования платформы</a> *
                      </span>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        Правила размещения контента, модерации и взаимодействия с пользователями
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={formData.agreements.brandRights}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        agreements: { ...prev.agreements, brandRights: e.target.checked }
                      }))}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        Я подтверждаю, что имею право на использование бренда и фотографий *
                      </span>
                      <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                        Вы являетесь официальным представителем компании или имеете соответствующие полномочия
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>Важно:</h4>
              <p className="text-sm text-yellow-800" style={{ fontFamily: 'var(--font-unbounded)' }}>
                После регистрации вы получите статус "Партнер" и сможете создавать карточки мест и услуг. 
                Для продажи билетов и получения выплат потребуется дополнительная верификация (Vendor Pro).
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.displayName && formData.cityId
      case 2:
        return formData.phone && formData.email
      case 3:
        return formData.proofType && formData.proofData
      case 4:
        return formData.agreements.pdn && formData.agreements.tos && formData.agreements.brandRights
      default:
        return false
    }
  }

  const isFormComplete = () => {
    return formData.displayName && 
           formData.cityId && 
           formData.phone && 
           formData.email && 
           formData.proofType && 
           formData.proofData &&
           formData.agreements.pdn && 
           formData.agreements.tos && 
           formData.agreements.brandRights
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Регистрация компании
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Станьте партнером Kiddeo и начните привлекать клиентов
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700 font-medium" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Шаг {currentStep} из {steps.length}
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-12">
          <div className="flex items-center justify-center relative max-w-3xl mx-auto">
            {/* Фоновая линия */}
            <div className="absolute top-5 left-20 right-20 h-0.5 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10 mx-20">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-semibold transition-colors duration-300 ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`} style={{ fontFamily: 'var(--font-unbounded)' }}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'var(--font-unbounded)' }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12 backdrop-blur-sm">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {renderStepContent()}
          </div>

          {/* Кнопки навигации */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-8 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              style={{ fontFamily: 'var(--font-unbounded)' }}
            >
              Назад
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Создание...
                  </span>
                ) : (
                  'Зарегистрировать'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
