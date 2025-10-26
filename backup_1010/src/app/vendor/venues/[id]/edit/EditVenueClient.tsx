'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'
import AddressForm from '@/components/AddressForm'
import BatchImageUploader from '@/components/BatchImageUploader'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

interface Venue {
  id: number
  name: string
  slug: string
  address: string | null
  district: string | null
  metro: string | null
  lat: number | null
  lng: number | null
  timezone: string | null
  fiasId: string | null
  kladrId: string | null
  coverImage: string | null
  description: string | null
  subcategory: {
    id: number
    name: string
    category: {
      id: number
      name: string
    }
  }
  city: {
    id: number
    name: string
    slug: string
  }
  status: string
}

interface Vendor {
  id: number
  displayName: string
}

interface Subcategory {
  id: number
  name: string
  category: {
    id: number
    name: string
  }
}

interface City {
  id: number
  name: string
  slug: string
}

interface EditVenueClientProps {
  venue: Venue
  vendor: Vendor
  subcategories: Subcategory[]
  cities: City[]
  additionalImages: string[]
}

export default function EditVenueClient({ venue, vendor, subcategories, cities, additionalImages }: EditVenueClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: venue.name,
    address: venue.address || '',
    subcategoryId: venue.subcategory.id.toString(),
    cityId: venue.city.id.toString(),
    description: venue.description || '',
    coverImage: null as File | null,
    coverImagePreview: venue.coverImage || '',
    additionalImages: additionalImages.map((imagePath, index) => ({
      id: `existing-${index}`,
      file: null,
      preview: imagePath,
      optimized: false,
      originalSize: 0,
      optimizedSize: 0
    })) as any[], // OptimizedImage[]
    // Дополнительные поля адреса
    district: venue.district || '',
    metro: venue.metro || '',
    coordinates: {
      lat: venue.lat,
      lng: venue.lng
    },
    timezone: venue.timezone,
    fiasId: venue.fiasId || '',
    kladrId: venue.kladrId || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      newErrors.subcategoryId = 'Выберите подкатегорию'
    }

    if (!formData.cityId) {
      newErrors.cityId = 'Выберите город'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен'
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
    setErrors({})

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('subcategoryId', formData.subcategoryId)
      formDataToSend.append('cityId', formData.cityId)
      formDataToSend.append('description', formData.description)
      
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
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage)
      }
      
      // Добавляем дополнительные изображения
      formData.additionalImages.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append(`additionalImage${index}`, image.file)
        }
      })

      const response = await fetch(`/api/vendor/venues/${venue.id}`, {
        method: 'PATCH',
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || 'Ошибка при обновлении места')
      }

      router.push('/vendor/venues')
    } catch (error) {
      console.error('Error updating venue:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Ошибка при обновлении места' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад
            </button>
            <h1 className="text-3xl font-unbounded-bold text-gray-900">
              Редактировать место
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-600">
              Обновите информацию о вашем месте
            </p>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Тариф: Free (Бесплатно)
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Основная информация */}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-unbounded-regular ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Введите название места"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Подкатегория */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Подкатегория *
                </label>
                <select
                  value={formData.subcategoryId}
                  onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-unbounded-regular ${
                    errors.subcategoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Выберите подкатегорию</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.category.name} - {subcategory.name}
                    </option>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-unbounded-regular ${
                    errors.cityId ? 'border-red-500' : 'border-gray-300'
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
                  city={cities.find(c => c.id.toString() === formData.cityId)?.name}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-unbounded-regular"
                  placeholder="Опишите ваше место"
                />
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
                  Дополнительные фото (до 4 штук)
                </label>
                <BatchImageUploader
                  maxImages={4}
                  onImagesChange={handleAdditionalImagesChange}
                  existingImages={formData.additionalImages}
                  disabled={loading}
                />
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
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-unbounded-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-unbounded-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
