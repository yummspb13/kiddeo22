"use client"

import { useState, useEffect } from 'react'
import { 
  Building2, 
  MapPin, 
  Camera, 
  X, 
  Plus, 
  Upload,
  DollarSign,
  Star,
  Shield,
  Newspaper,
  Video,
  ShoppingBag,
  Lock,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  Trash2
} from 'lucide-react'
import DistrictAutocomplete from '@/components/DistrictAutocomplete'
import MetroAutocomplete from '@/components/MetroAutocomplete'
import NotificationModal from '@/components/NotificationModal'
import FeaturesManager from '@/components/FeaturesManager'
import TariffRestriction from '@/components/TariffRestriction'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg">
      <div className="p-4 text-gray-500 text-center">
        Загрузка редактора...
      </div>
    </div>
  )
})
import { optimizeImages, formatFileSize, validateImage } from '@/lib/image-optimization'
import { fetchWithTimeout, ApiTimeoutError } from '@/lib/api-timeout'
import { getTariffLimits, type VenueTariff } from '@/lib/tariff-utils'

interface Venue {
  id: number
  name: string
  slug: string
  address: string | null
  description: string | null
  richDescription?: string | null
  coverImage: string | null
  additionalImages: string[] | null
  status: any
  createdAt: any
  district: string | null
  metro: string | null
  lat: number | null
  lng: number | null
  tariff: string
  priceFrom?: number | null
  ageFrom?: number | null
  workingHours?: string | null
  features?: Array<{
    id: string
    icon: string
    text: string
  }>
  subcategory: {
    name: string
    slug: string
    category: {
      name: string
    }
  }
  city: {
    name: string
    slug: string
  }
}

interface EditVenueFormProps {
  venue: Venue
  currentTariff: 'FREE' | 'SUPER' | 'MAXIMUM'
  onSave: (data: any) => void
  onCancel: () => void
}

export default function EditVenueForm({ venue, currentTariff, onSave, onCancel }: EditVenueFormProps) {
  console.log('EditVenueForm venue:', venue)
  console.log('EditVenueForm additionalImages:', venue.additionalImages)
  console.log('EditVenueForm coverImage:', venue.coverImage)
  console.log('EditVenueForm features:', venue.features)
  console.log('EditVenueForm currentTariff:', currentTariff)
  console.log('EditVenueForm tariff for TariffRestriction:', currentTariff)
  
  const [formData, setFormData] = useState({
    name: venue.name || '',
    description: venue.description || '',
    address: venue.address || '',
    district: venue.district || '',
    metro: venue.metro || '',
    coordinates: venue.lat && venue.lng ? `${venue.lat}, ${venue.lng}` : '',
    priceFrom: venue.priceFrom != null ? String(venue.priceFrom) : '',
    ageFrom: venue.ageFrom != null ? String(venue.ageFrom) : '',
    workingHours: venue.workingHours || '',
    richDescription: (() => {
      try {
        return venue.richDescription ? JSON.parse(venue.richDescription) : '';
      } catch (error) {
        return venue.richDescription || '';
      }
    })(),
    features: venue.features ? venue.features.map(f => f.id) : [],
    coverImage: venue.coverImage || '',
    additionalImages: (() => {
      try {
        if (typeof venue.additionalImages === 'string') {
          return JSON.parse(venue.additionalImages)
        }
        return venue.additionalImages || []
      } catch (error) {
        console.error('Error parsing additionalImages:', error)
        return []
      }
    })(),
    newImages: [] as string[], // Changed from File[] to string[] for base64 images
    videos: [] as File[],
    products: [] as any[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  })

  const isFeatureAvailable = (requiredTariff: 'FREE' | 'SUPER' | 'MAXIMUM') => {
    const tariffLevels = { FREE: 0, SUPER: 1, MAXIMUM: 2 }
    return tariffLevels[currentTariff] >= tariffLevels[requiredTariff]
  }

  const getMaxImages = () => {
    switch (currentTariff) {
      case 'FREE': return 4
      case 'SUPER': return 10
      case 'MAXIMUM': return 10
      default: return 4
    }
  }

  const getTariffName = (tariff: 'FREE' | 'SUPER' | 'MAXIMUM') => {
    const names = { FREE: 'Бесплатный', SUPER: 'Супер', MAXIMUM: 'Максимум' }
    return names[tariff]
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const maxImages = getMaxImages()
    
    const totalImages = (formData.additionalImages?.length || 0) + formData.newImages.length + files.length
    if (totalImages > maxImages) {
      setErrors({ images: `Максимум ${maxImages} фото для тарифа ${getTariffName(currentTariff)}` })
      return
    }

    // Валидируем файлы
    for (const file of files) {
      const validation = validateImage(file)
      if (!validation.valid) {
        setErrors({ images: validation.error || 'Ошибка валидации изображения' })
        return
      }
    }

    setUploadingImages(true)
    setErrors(prev => ({ ...prev, images: '' }))

    try {
      // Оптимизируем изображения
      const optimizedImages = await optimizeImages(files, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'webp'
      })

      // Конвертируем File объекты в base64 для отправки
      const base64Images = await Promise.all(
        optimizedImages.map(async (img) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(img.file)
          })
        })
      )

      setFormData(prev => ({
        ...prev,
        newImages: [...prev.newImages, ...base64Images]
      }))

      console.log('Images optimized:', optimizedImages.map(img => ({
        original: formatFileSize(img.originalSize),
        optimized: formatFileSize(img.optimizedSize),
        compression: `${img.compressionRatio}%`
      })))

    } catch (error) {
      console.error('Error optimizing images:', error)
      setErrors({ images: 'Ошибка при оптимизации изображений' })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }))
  }

  const removeExistingImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.additionalImages?.filter((_, i) => i !== index) || []
      console.log(`[FORM] Removed existing image at index ${index}`)
      console.log(`[FORM] Images before: ${prev.additionalImages?.length || 0}, after: ${newImages.length}`)
      return {
        ...prev,
        additionalImages: newImages
      }
    })
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFeatureAvailable('MAXIMUM')) return
    
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ...files]
    }))
  }

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }))
  }


  const addProduct = () => {
    if (!isFeatureAvailable('MAXIMUM')) return
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name: '', price: '', description: '' }]
    }))
  }

  const updateProduct = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }))
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен'
    }

    if (currentTariff === 'SUPER' && !formData.priceFrom.trim()) {
      newErrors.priceFrom = 'Цена от обязательна для тарифа Супер'
    }

    if (currentTariff === 'SUPER' && !formData.ageFrom.trim()) {
      newErrors.ageFrom = 'Возраст от обязателен для тарифа Супер'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const startTime = Date.now()
    console.log(`[FORM] ===== SAVE START =====`)
    
    setLoading(true)
    try {
      console.log('[FORM] Saving venue data:', {
        name: formData.name,
        description: formData.description,
        richDescription: formData.richDescription,
        address: formData.address,
        district: formData.district,
        metro: formData.metro,
        coordinates: formData.coordinates,
        additionalImagesCount: formData.additionalImages?.length || 0,
        newImagesCount: formData.newImages.length,
        newImagesSize: formData.newImages.map(img => img.length).reduce((a, b) => a + b, 0)
      })

      console.log(`[FORM] Making API request to /api/vendor/venues/${venue.id}/update`)
      const apiStartTime = Date.now()
      
      const response = await fetchWithTimeout(
        `/api/vendor/venues/${venue.id}/update`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            address: formData.address,
            district: formData.district,
            metro: formData.metro,
            coordinates: formData.coordinates,
            priceFrom: formData.priceFrom ? parseInt(formData.priceFrom) : null,
            ageFrom: formData.ageFrom ? parseInt(formData.ageFrom) : null,
            workingHours: formData.workingHours,
            richDescription: typeof formData.richDescription === 'string' 
              ? formData.richDescription 
              : JSON.stringify(formData.richDescription),
            additionalImages: formData.additionalImages, // Отправляем обновленный список существующих изображений
            newImages: formData.newImages // Включаем новые изображения
          })
        },
        30000 // 30 секунд таймаут для больших запросов
      )

      console.log(`[FORM] API response received in ${Date.now() - apiStartTime}ms`)
      console.log(`[FORM] Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.log(`[FORM] API error response:`, errorData)
        throw new Error(errorData.error || 'Failed to save venue')
      }

      const result = await response.json()
      const totalTime = Date.now() - startTime
      console.log(`[FORM] ===== SAVE SUCCESS ===== Total time: ${totalTime}ms`)
      console.log('[FORM] Venue saved successfully:', result)
      
      // Показываем уведомление об успехе
      console.log('[FORM] Showing success notification')
      setNotification({
        isOpen: true,
        title: 'Успешно!',
        message: 'Место успешно обновлено!',
        type: 'success'
      })
      console.log('[FORM] Notification state set:', { isOpen: true, title: 'Успешно!' })
      
      // Очищаем новые изображения после успешного сохранения
      setFormData(prev => ({
        ...prev,
        newImages: []
      }))
      
      // Ждем немного, чтобы уведомление показалось
      setTimeout(() => {
        onSave(formData)
      }, 100)
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.log(`[FORM] ===== SAVE ERROR ===== Total time: ${totalTime}ms`)
      console.error('[FORM] Error saving venue:', error)
      
      let errorMessage = 'Ошибка при сохранении места'
      
      if (error instanceof ApiTimeoutError) {
        console.log('[FORM] Timeout error detected')
        errorMessage = 'К сожалению, не удалось загрузить. Сервер перегружен, попробуйте позже.'
      } else if (error instanceof Error) {
        console.log(`[FORM] Error message: ${error.message}`)
        errorMessage = error.message
      }
      
      setNotification({
        isOpen: true,
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 gradient-text-primary">
              Редактирование места
            </h2>
            <p className="text-gray-600 mt-1">
              Тариф: <span className="font-bold text-blue-600">{getTariffName(currentTariff)}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card-dynamic bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text-success">
            📝 Основная информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Название места *
              </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Введите название места"
                />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Адрес *
              </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Введите адрес"
                />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* Режим работы - только для тарифов SUPER и MAXIMUM */}
            {(currentTariff === 'SUPER' || currentTariff === 'MAXIMUM') && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Режим работы
                </label>
                <input
                  type="text"
                  value={formData.workingHours || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Например: Пн-Вс 10:00-22:00"
                />
              </div>
            )}

          </div>

          {/* Обычное описание - только для тарифов FREE */}
          {currentTariff !== 'SUPER' && (
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Расскажите о вашем месте"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
          )}

          {/* Расширенное описание с TipTap редактором - только для тарифа SUPER */}
          {currentTariff === 'SUPER' && (
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Расширенное описание
              </label>
              <RichTextEditor
                content={(() => {
                  try {
                    return formData.richDescription ? JSON.parse(formData.richDescription) : '';
                  } catch (error) {
                    return formData.richDescription || '';
                  }
                })()}
                onChange={(content) => setFormData(prev => ({ ...prev, richDescription: content }))}
                placeholder="Создайте красивое описание с форматированием, изображениями и ссылками..."
              />
            </div>
          )}
        </div>

        {/* Free Tier Features */}
        <div className="card-dynamic bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl border border-green-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text-success">
            ✅ Бесплатные функции
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Район
              </label>
              <DistrictAutocomplete
                value={formData.district}
                onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                placeholder="Выберите район"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ближайшее метро
              </label>
              <MetroAutocomplete
                value={formData.metro}
                onChange={(value) => setFormData(prev => ({ ...prev, metro: value }))}
                placeholder="Выберите станцию метро"
                className="w-full"
              />
            </div>
          </div>

          {/* Точка на карте */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Точка на карте
            </h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Координаты (широта, долгота)
              </label>
              <input
                type="text"
                value={formData.coordinates || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="59.933913, 30.319412"
              />
              <p className="text-xs text-gray-500 mt-1">
                Координаты из ЯндексКарт в формате: широта, долгота
              </p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Как получить координаты:
                  </p>
                  <ol className="text-xs text-blue-700 space-y-1">
                    <li>1. Откройте ЯндексКарты</li>
                    <li>2. Найдите ваше место</li>
                    <li>3. Кликните правой кнопкой мыши на точку</li>
                    <li>4. Скопируйте координаты в формате: 59.933913, 30.319412</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Super Tier Features */}
        {isFeatureAvailable('SUPER') && (
          <div className="card-dynamic bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text-primary">
              🚀 Функции тарифа Супер
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Цена от *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.priceFrom || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceFrom: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="0"
                  />
                </div>
                {errors.priceFrom && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.priceFrom}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Возраст от *
                </label>
                <input
                  type="number"
                  value={formData.ageFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, ageFrom: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Например: 3"
                />
                {errors.ageFrom && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.ageFrom}
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Maximum Tier Features */}
        {isFeatureAvailable('MAXIMUM') && (
          <div className="card-dynamic bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-xl border border-purple-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text">
              👑 Функции тарифа Максимум
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Товары и услуги
                </label>
                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Название товара/услуги"
                        />
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(index, 'price', e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Цена"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={product.description}
                            onChange={(e) => updateProduct(index, 'description', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Описание"
                          />
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addProduct}
                    className="flex items-center text-purple-600 hover:text-purple-700 font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить товар/услугу
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cover Image */}
        <div className="card-dynamic bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text-primary">
            🖼️ Обложка места
          </h3>
          
          <div className="space-y-4">
            {formData.coverImage ? (
              <div className="space-y-4">
                <div className="relative group max-w-2xl mx-auto">
                  <img
                    src={formData.coverImage}
                    alt="Обложка места"
                    className="w-full h-96 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                    style={{ aspectRatio: '800/600' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                    className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Текущая обложка места (800x600)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormData(prev => ({ ...prev, coverImage: URL.createObjectURL(file) }))
                      }
                    }}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="btn-dynamic px-6 py-3 rounded-xl font-bold cursor-pointer inline-flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Заменить обложку
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="max-w-2xl mx-auto h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mb-4" style={{ aspectRatio: '800/600' }}>
                  <Camera className="w-16 h-16 text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">Обложка не загружена (рекомендуемый формат: 800x600)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, coverImage: URL.createObjectURL(file) }))
                    }
                  }}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="btn-dynamic px-6 py-3 rounded-xl font-bold cursor-pointer inline-flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Загрузить обложку
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Images Upload */}
        <div className="card-dynamic bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text-primary">
            📸 Дополнительные фотографии ({(formData.additionalImages?.length || 0) + formData.newImages.length}/{getMaxImages()})
            {/* Debug info */}
            <div className="text-xs text-gray-400 mt-1">
              Debug: additionalImages={JSON.stringify(formData.additionalImages)}, newImages={formData.newImages.length}
            </div>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Максимум {getMaxImages()} фото для тарифа {getTariffName(currentTariff)}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={(formData.additionalImages?.length || 0) + formData.newImages.length >= getMaxImages()}
              />
              <label
                htmlFor="image-upload"
                className={`btn-dynamic px-4 py-2 rounded-xl font-bold cursor-pointer ${
                  (formData.additionalImages?.length || 0) + formData.newImages.length >= getMaxImages() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Загрузить фото
              </label>
            </div>

            {errors.images && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.images}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Debug info */}
              <div className="col-span-full text-xs text-gray-500 mb-2">
                Debug: additionalImages count: {formData.additionalImages?.length || 0}, 
                newImages count: {formData.newImages.length}
              </div>
              
              {/* Существующие фотографии */}
              {formData.additionalImages?.map((image, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img
                    src={image}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Новые фотографии */}
              {formData.newImages.map((image, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={image}
                    alt={`Новое фото ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Videos Upload (Maximum Tier Only) */}
        {isFeatureAvailable('MAXIMUM') && (
          <div className="card-dynamic bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-xl border border-purple-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text">
              🎥 Видео
            </h3>
            
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="btn-dynamic px-4 py-2 rounded-xl font-bold cursor-pointer"
              >
                <Video className="w-4 h-4 mr-2 inline" />
                Загрузить видео
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video
                      src={URL.createObjectURL(video)}
                      className="w-full h-32 object-cover rounded-xl shadow-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Locked Features Preview */}
        {!isFeatureAvailable('SUPER') && (
          <div className="card-dynamic bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 gradient-text-warning">
              🔒 Заблокированные функции
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                <span className="text-sm font-bold text-gray-600">Цена от (Супер)</span>
              </div>
              <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                <span className="text-sm font-bold text-gray-600">Возраст (Супер)</span>
              </div>
              <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                <span className="text-sm font-bold text-gray-600">Особенности (Супер)</span>
              </div>
              <div className="feature-locked flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <Lock className="w-6 h-6 text-gray-400 mr-4 animate-pulse" />
                <span className="text-sm font-bold text-gray-600">Видео (Максимум)</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button className="btn-dynamic px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 animate-pulse">
                Улучшить тариф
              </button>
            </div>
          </div>
        )}

        {/* Features Manager (только для SUPER+) */}
        {isFeatureAvailable('SUPER') && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <FeaturesManager
              venueId={venue.id}
              features={venue.features || []}
              onSave={async (features) => {
                try {
                  const response = await fetch(`/api/vendor/venues/${venue.id}/features`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ features }),
                  })

                  if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to save features')
                  }

                  const result = await response.json()
                  console.log('Features saved successfully:', result)
                  
                  // Обновляем локальное состояние
                  setFormData(prev => ({
                    ...prev,
                    features: features.map(f => f.text)
                  }))
                  
                  setNotification({
                    show: true,
                    title: 'Успех',
                    message: 'Особенности сохранены успешно',
                    type: 'success'
                  })
                } catch (error) {
                  console.error('Error saving features:', error)
                  setNotification({
                    show: true,
                    title: 'Ошибка',
                    message: error instanceof Error ? error.message : 'Не удалось сохранить особенности',
                    type: 'error'
                  })
                }
              }}
              disabled={loading}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-bold transition-colors"
          >
            Отмена
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-2" />
              Предпросмотр
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-dynamic px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить изменения
                </div>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        duration={3000}
      />
    </div>
  )
}
