"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Phone, Image, CheckCircle, Building2, Mail, Globe, Shield } from 'lucide-react'

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
      const response = await fetch('/api/vendors/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/vendor/onboarding')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      alert('Ошибка при создании профиля вендора')
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название компании *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название вашей компании"
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
              >
                <option value="">Выберите город</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание деятельности
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Расскажите о том, чем занимается ваша компания"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Slug (URL)
              </label>
              <input
                type="text"
                value={formData.brandSlug}
                onChange={(e) => setFormData(prev => ({ ...prev, brandSlug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="my-company"
              />
              <p className="text-sm text-gray-500 mt-1">
                Будет использоваться в URL: kiddeo.ru/company/my-company
              </p>
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
                placeholder="info@company.com"
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
                placeholder="https://company.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email поддержки
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="support@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон поддержки
                </label>
                <input
                  type="tel"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Способ подтверждения представительства *
              </label>
              <select
                value={formData.proofType}
                onChange={(e) => setFormData(prev => ({ ...prev, proofType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DOMAIN_EMAIL">Email на домене компании</option>
                <option value="DNS_RECORD">DNS запись</option>
                <option value="LETTER">Письмо-доверенность</option>
                <option value="PHOTO">Фото из зала/офиса</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Данные для подтверждения *
              </label>
              <textarea
                value={formData.proofData}
                onChange={(e) => setFormData(prev => ({ ...prev, proofData: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Опишите способ подтверждения или приложите ссылку на документ"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Способы подтверждения:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
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
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreements.pdn}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    agreements: { ...prev.agreements, pdn: e.target.checked }
                  }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Я согласен с <a href="#" className="text-blue-600 hover:underline">политикой обработки персональных данных</a> *
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreements.tos}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    agreements: { ...prev.agreements, tos: e.target.checked }
                  }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Я принимаю <a href="#" className="text-blue-600 hover:underline">условия использования платформы</a> *
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreements.brandRights}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    agreements: { ...prev.agreements, brandRights: e.target.checked }
                  }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Я подтверждаю, что имею право на использование бренда и фотографий *
                </span>
              </label>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="font-medium text-yellow-900 mb-2">Важно:</h4>
              <p className="text-sm text-yellow-800">
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Регистрация компании
          </h1>
          <p className="text-lg text-gray-600">
            Станьте партнером Kiddeo и начните привлекать клиентов
          </p>
        </div>

        {/* Прогресс */}
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
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStepContent()}

          {/* Кнопки навигации */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={!isStepValid() || loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание...' : 'Зарегистрировать'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
