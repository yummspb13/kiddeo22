// src/app/vendor/onboarding/VendorOnboardingClient.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Phone, MapPin, Globe, Star } from "lucide-react"
import { useToast } from '@/contexts/ToastContext'

interface City {
  id: number
  name: string
}

interface Vendor {
  id: number
  displayName: string
  cityId: number
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  VendorOnboarding: {
    step: number
    completedSteps: unknown[]
    isCompleted: boolean
  } | null
}

interface VendorOnboardingClientProps {
  cities: City[]
  vendor: Vendor
}

export default function VendorOnboardingClient({ cities, vendor }: VendorOnboardingClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(vendor.VendorOnboarding?.step || 1)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    displayName: vendor.displayName || '',
    cityId: vendor.cityId.toString(),
    description: vendor.description || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    address: '',
    website: vendor.website || '',
    agreements: {
      privacyPolicy: false,
      termsOfService: false,
      marketing: false
    }
  })

  const steps = [
    {
      id: 1,
      title: "Основная информация",
      description: "Расскажите о вашей компании",
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: 2,
      title: "Контакты",
      description: "Как с вами связаться",
      icon: <Phone className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Завершение",
      description: "Проверьте данные и завершите регистрацию",
      icon: <Star className="w-6 h-6" />
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      console.log('🔍 VENDOR ONBOARDING: Submitting data:', formData)

      const response = await fetch('/api/vendor/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Vendor updated successfully:', result)
        router.push('/vendor/dashboard')
      } else {
        console.error('Response status:', response.status)
        console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        const errorData = await response.json()
        console.error('API Error:', errorData)
        console.error('Request data:', formData)
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Введите название вашей компании"
                style={{ fontFamily: 'var(--font-unbounded)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Город *
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData(prev => ({ ...prev, cityId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                style={{ fontFamily: 'var(--font-unbounded)' }}
                required
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Описание компании
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Расскажите о вашей компании и услугах"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="+7 (999) 123-45-67"
                style={{ fontFamily: 'var(--font-unbounded)' }}
                required
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="company@example.com"
                style={{ fontFamily: 'var(--font-unbounded)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Адрес
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Улица, дом, квартира"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="https://example.com"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>Проверьте данные</h3>
              <dl className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-green-200">
                  <dt className="text-sm font-medium text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>Название компании</dt>
                  <dd className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>{formData.displayName}</dd>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-green-200">
                  <dt className="text-sm font-medium text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>Город</dt>
                  <dd className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                    {cities.find(c => c.id === parseInt(formData.cityId))?.name}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-green-200">
                  <dt className="text-sm font-medium text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>Телефон</dt>
                  <dd className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>{formData.phone}</dd>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-green-200">
                  <dt className="text-sm font-medium text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>Email</dt>
                  <dd className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>{formData.email}</dd>
                </div>
                {formData.address && (
                  <div className="flex justify-between items-center py-3 border-b border-green-200">
                    <dt className="text-sm font-medium text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>Адрес</dt>
                    <dd className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>{formData.address}</dd>
                  </div>
                )}
                {formData.website && (
                  <div className="flex justify-between items-center py-3">
                    <dt className="text-sm font-medium text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>Веб-сайт</dt>
                    <dd className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>{formData.website}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Согласия */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>Согласия</h3>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreements?.privacyPolicy || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      agreements: {
                        ...prev.agreements,
                        privacyPolicy: e.target.checked
                      }
                    }))}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                      Я согласен с <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Политикой конфиденциальности</a>
                    </span>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreements?.termsOfService || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      agreements: {
                        ...prev.agreements,
                        termsOfService: e.target.checked
                      }
                    }))}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                      Я согласен с <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">Пользовательским соглашением</a>
                    </span>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreements?.marketing || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      agreements: {
                        ...prev.agreements,
                        marketing: e.target.checked
                      }
                    }))}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
                      Я согласен получать маркетинговые уведомления и предложения
                    </span>
                  </div>
                </label>
              </div>
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
        return formData.agreements?.privacyPolicy && formData.agreements?.termsOfService
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6 shadow-lg">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Добро пожаловать в KidsReview!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Создайте профиль вендора и начните привлекать клиентов
          </p>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-center relative max-w-3xl mx-auto">
            {/* Фоновая линия */}
            <div className="absolute top-5 left-20 right-20 h-0.5 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10 mx-20">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-semibold transition-colors duration-300 ${
                    currentStep >= step.id ? 'text-green-600' : 'text-gray-500'
                  }`} style={{ fontFamily: 'var(--font-unbounded)' }}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'var(--font-unbounded)' }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 text-lg" style={{ fontFamily: 'var(--font-unbounded)' }}>
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
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
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Создаем профиль...
                  </span>
                ) : (
                  'Завершить регистрацию'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
