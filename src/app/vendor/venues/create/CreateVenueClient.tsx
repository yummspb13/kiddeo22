"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  Image as ImageIcon, 
  Upload,
  ArrowLeft,
  Save,
  X
} from 'lucide-react'
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'
import AddressForm from '@/components/AddressForm'
import BatchImageUploader from '@/components/BatchImageUploader'
import TariffRestriction from '@/components/TariffRestriction'
import RichTextEditor from '@/components/RichTextEditor'
import { getTariffLimits, type VenueTariff } from '@/lib/tariff-utils'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

interface Subcategory {
  id: number
  name: string
  slug: string
  type: 'PLACE' | 'SERVICE'
  category: {
    name: string
  }
}

interface City {
  id: number
  name: string
  slug: string
}

interface Vendor {
  id: number
  displayName: string
}

interface CreateVenueClientProps {
  vendor: Vendor
  subcategories: Subcategory[]
  cities: City[]
  vendorTariff?: VenueTariff
}

export default function CreateVenueClient({ vendor, subcategories, cities, vendorTariff = 'FREE' }: CreateVenueClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    subcategoryId: '',
    cityId: '',
    description: '',
    richDescription: '',
    coverImage: null as File | null,
    coverImagePreview: '',
    additionalImages: [] as any[], // OptimizedImage[]
    // Дополнительные поля адреса
    district: '',
    metro: '',
    coordinates: {
      lat: null as number | null,
      lng: null as number | null
    },
    timezone: null as string | null,
    fiasId: '',
    kladrId: '',
    workingHours: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddressChange = (addressData: unknown) => {
    setFormData(prev => ({
      ...prev,
      address: (addressData as any).address,
      district: (addressData as any).district,
      metro: (addressData as any).metro,
      coordinates: (addressData as any).coordinates,
      timezone: (addressData as any).timezone,
      fiasId: (addressData as any).fiasId,
      kladrId: (addressData as any).kladrId
    }))
  }

  const handleImageUpload = (field: 'coverImage', file: File) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleInputChange('coverImagePreview', result)
        handleInputChange('coverImage', file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (images: unknown[]) => {
    handleInputChange('additionalImages', images)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }

    if (!formData.subcategoryId) {
      newErrors.subcategoryId = 'Выберите категорию'
    }

    if (!formData.cityId) {
      newErrors.cityId = 'Выберите город'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('subcategoryId', formData.subcategoryId)
      formDataToSend.append('cityId', formData.cityId)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('richDescription', formData.richDescription)
      
              // Дополнительные поля адреса
              formDataToSend.append('district', formData.district)
              formDataToSend.append('metro', formData.metro)
              if (formData.coordinates.lat) {
                formDataToSend.append('lat', formData.coordinates.lat.toString())
              }
              if (formData.coordinates.lng) {
                formDataToSend.append('lng', formData.coordinates.lng.toString())
              }
              if (formData.timezone) {
                formDataToSend.append('timezone', formData.timezone)
              }
              if (formData.fiasId) {
                formDataToSend.append('fiasId', formData.fiasId)
              }
              if (formData.kladrId) {
                formDataToSend.append('kladrId', formData.kladrId)
              }
              if (formData.workingHours) {
                formDataToSend.append('workingHours', formData.workingHours)
              }
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage)
      }
      
      // Добавляем дополнительные изображения
      formData.additionalImages.forEach((image, index) => {
        formDataToSend.append(`additionalImage${index}`, image.file)
      })

      const response = await fetch('/api/vendor/venues', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const data = await response.json()
        setShowSuccessModal(true)
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Ошибка при создании места' })
      }
    } catch (error) {
      console.error('Error creating venue:', error)
      setErrors({ submit: 'Ошибка при создании места' })
    } finally {
      setLoading(false)
    }
  }

  const groupedSubcategories = subcategories.reduce((acc, subcategory) => {
    const categoryName = subcategory.category.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(subcategory)
    return acc
  }, {} as Record<string, Subcategory[]>)

  return (
    <div className={`min-h-screen bg-gray-50 ${unbounded.variable}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-unbounded-bold text-gray-900">
                Добавить место
              </h1>
              <p className="text-lg text-gray-600 font-unbounded-regular">
                Создайте новое место или услугу
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-unbounded-semibold text-gray-900 mb-6">
              Основная информация
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Название */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название места *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded-regular ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Например: Парк развлечений 'Сказка'"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  value={formData.subcategoryId}
                  onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded-regular ${
                    errors.subcategoryId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Выберите категорию</option>
                  {Object.entries(groupedSubcategories).map(([categoryName, subcategories]) => (
                    <optgroup key={categoryName} label={categoryName}>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.subcategoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.subcategoryId}</p>
                )}
              </div>

              {/* Город */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Город *
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange('cityId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded-regular ${
                    errors.cityId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Выберите город</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.cityId && (
                  <p className="mt-1 text-sm text-red-600">{errors.cityId}</p>
                )}
              </div>

              {/* Адрес */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес *
                </label>
                <AddressForm
                  data={{
                    address: formData.address,
                    district: formData.district,
                    metro: formData.metro,
                    coordinates: formData.coordinates,
                    timezone: formData.timezone,
                    fiasId: formData.fiasId,
                    kladrId: formData.kladrId
                  }}
                  onChange={handleAddressChange}
                  city={cities.find(c => c.id === parseInt(formData.cityId))?.name}
                />
              </div>

              {/* Описание */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded-regular"
                  placeholder="Расскажите о вашем месте..."
                />
              </div>

              {/* Режим работы (только для SUPER+) */}
              <div className="md:col-span-2">
                <TariffRestriction
                  currentTariff={vendorTariff}
                  feature="workingHours"
                  onUpgrade={() => {
                    // TODO: Implement upgrade flow
                    console.log('Upgrade to higher tariff for working hours')
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Режим работы
                    </label>
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded-regular"
                      placeholder="Например: Пн-Вс 10:00-22:00"
                    />
                  </div>
                </TariffRestriction>
              </div>

              {/* Расширенное описание (только для SUPER+) */}
              <div className="md:col-span-2">
                <TariffRestriction
                  currentTariff={vendorTariff}
                  feature="richDescription"
                  onUpgrade={() => {
                    // TODO: Implement upgrade flow
                    console.log('Upgrade to higher tariff for rich description')
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Расширенное описание с форматированием
                    </label>
                    <RichTextEditor
                      content={formData.richDescription}
                      onChange={(content) => handleInputChange('richDescription', content)}
                      placeholder="Создайте красивое описание с изображениями и форматированием..."
                      disabled={loading}
                    />
                  </div>
                </TariffRestriction>
              </div>
            </div>
          </div>

          {/* Изображения */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-unbounded-semibold text-gray-900 mb-6">
              Изображения
            </h2>

            <div className="space-y-6">
              {/* Обложка */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Обложка *
                </label>
                <div className="space-y-4">
                  {formData.coverImagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.coverImagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('coverImage', null)
                          handleInputChange('coverImagePreview', '')
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Загрузите обложку</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload('coverImage', file)
                        }}
                        className="hidden"
                        id="coverImage"
                      />
                      <label
                        htmlFor="coverImage"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer font-unbounded-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Выбрать файл
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Дополнительные фото */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительные фото (до {getTariffLimits(vendorTariff).photos} штук)
                </label>
                <TariffRestriction
                  currentTariff={vendorTariff}
                  feature="photos"
                  onUpgrade={() => {
                    // TODO: Implement upgrade flow
                    console.log('Upgrade to higher tariff')
                  }}
                >
                  <BatchImageUploader
                    maxImages={getTariffLimits(vendorTariff).photos}
                    onImagesChange={handleAdditionalImagesChange}
                    existingImages={formData.additionalImages}
                    disabled={loading}
                  />
                </TariffRestriction>
              </div>
            </div>
          </div>

          {/* Ошибки */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-unbounded-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-unbounded-medium inline-flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Создание...' : 'Создать место'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Модалка успеха */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Место успешно создано!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Ваше место отправлено на модерацию. После проверки оно появится в каталоге.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Создать еще
                </button>
                <button
                  onClick={() => router.push('/vendor/dashboard')}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Мои места
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
