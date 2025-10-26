// src/app/vendor/onboarding/VendorOnboardingClient.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Image, FileText, Phone, MapPin, Globe, Star } from "lucide-react"

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
  const [formData, setFormData] = useState({
    displayName: vendor.displayName || '',
    cityId: vendor.cityId.toString(),
    description: vendor.description || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    address: '',
    website: vendor.website || '',
    logo: null as File | null
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
      title: "Логотип",
      description: "Загрузите логотип компании",
      icon: <Image className="w-6 h-6" />
    },
    {
      id: 4,
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
      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/vendor/dashboard')
      } else {
        throw new Error('Failed to create vendor')
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      alert('Ошибка при создании профиля вендора')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }))
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название компании *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название вашей компании"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Город *
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData(prev => ({ ...prev, cityId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание компании
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Расскажите о вашей компании и услугах"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="company@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Улица, дом, квартира"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Веб-сайт
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логотип компании
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="logo-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Загрузить файл</span>
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">или перетащите сюда</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                </div>
              </div>
              {formData.logo && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(formData.logo)}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Проверьте данные</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Название компании</dt>
                  <dd className="text-sm text-gray-900">{formData.displayName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Город</dt>
                  <dd className="text-sm text-gray-900">
                    {cities.find(c => c.id === parseInt(formData.cityId))?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Телефон</dt>
                  <dd className="text-sm text-gray-900">{formData.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{formData.email}</dd>
                </div>
                {formData.address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Адрес</dt>
                    <dd className="text-sm text-gray-900">{formData.address}</dd>
                  </div>
                )}
                {formData.website && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Веб-сайт</dt>
                    <dd className="text-sm text-gray-900">{formData.website}</dd>
                  </div>
                )}
              </dl>
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
        return true // Логотип не обязателен
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать в KidsReview!</h1>
          <p className="mt-2 text-gray-600">
            Создайте профиль вендора и начните привлекать клиентов
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создаем профиль...' : 'Завершить регистрацию'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
