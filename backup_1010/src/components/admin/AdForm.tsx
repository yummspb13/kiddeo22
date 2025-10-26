'use client'

import { useState } from 'react'
import { ArrowLeft, Save, Image, Link as LinkIcon, Calendar, MapPin, Settings } from 'lucide-react'
import Link from 'next/link'
import FileUpload from './FileUpload'

interface AdFormProps {
  adPlacement?: {
    id: number
    title: string
    position: string
    imageUrl: string | null
    hrefUrl: string | null
    cityId: number | null
    startsAt: Date | null
    endsAt: Date | null
    weight: number
    order: number
    isActive: boolean
  }
  cities: Array<{ id: number; name: string }>
  keySuffix: string
  isEdit?: boolean
}

export default function AdForm({ adPlacement, cities, keySuffix, isEdit = false }: AdFormProps) {
  const [imageUrl, setImageUrl] = useState(adPlacement?.imageUrl || '')
  const [hrefUrl, setHrefUrl] = useState(adPlacement?.hrefUrl || '')
  const [hrefUrlError, setHrefUrlError] = useState('')

  const positions = [
    { value: 'HEADER_BANNER', label: 'Полоска над событиями (40px)', description: 'Полоска высотой 40px во всю ширину с отступами 16px' },
    { value: 'SIDEBAR', label: 'Слева под фильтрами (400x260px)', description: 'Прямоугольный блок 400x260px слева под фильтрами' },
    { value: 'INLINE', label: 'Внутри контента (400x260px)', description: 'Прямоугольный блок 400x260px внутри контента под билетами' }
  ]

  const validateUrl = (url: string) => {
    if (!url.trim()) return true // Пустая строка - валидна
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleHrefUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setHrefUrl(value)
    
    if (value.trim() && !validateUrl(value)) {
      setHrefUrlError('Введите корректный URL (например: https://example.com)')
    } else {
      setHrefUrlError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageUrl || hrefUrlError) {
      return
    }

    const formData = new FormData(e.currentTarget)
    
    const data = {
      page: 'afisha',
      position: formData.get('position')?.toString() || '',
      title: formData.get('title')?.toString() || '',
      imageUrl: imageUrl,
      hrefUrl: hrefUrl || null,
      cityId: formData.get('cityId')?.toString() ? Number(formData.get('cityId')) : null,
      startsAt: formData.get('startsAt')?.toString() ? new Date(formData.get('startsAt')!.toString()) : null,
      endsAt: formData.get('endsAt')?.toString() ? new Date(formData.get('endsAt')!.toString()) : null,
      weight: Number(formData.get('weight')?.toString() || '1'),
      order: Number(formData.get('order')?.toString() || '0'),
      isActive: formData.get('isActive') === 'on'
    }

    try {
      const url = isEdit 
        ? `/api/admin/ad-placements?key=kidsreview2025`
        : `/api/admin/ad-placements?key=kidsreview2025`
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isEdit ? { id: adPlacement?.id, ...data } : data)
      })

      if (response.ok) {
        // Перенаправляем на страницу списка
        window.location.href = `/admin/afisha/ads${keySuffix}`
      } else {
        const error = await response.json()
        alert(`Ошибка сохранения: ${error.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error saving ad placement:', error)
      alert('Ошибка сохранения рекламного слота')
    }
  }

  // Форматируем даты для input[type="datetime-local"]
  const formatDateTime = (date: Date | null) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href={`/admin/afisha/ads${keySuffix}`}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Редактировать рекламный слот' : 'Создать рекламный слот'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Основная информация
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название рекламы *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={adPlacement?.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: Реклама детского центра"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Позиция *
                </label>
                <select
                  name="position"
                  required
                  defaultValue={adPlacement?.position || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите позицию</option>
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Город
                </label>
                <select
                  name="cityId"
                  defaultValue={adPlacement?.cityId?.toString() || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Все города</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Вес (приоритет)
                </label>
                <input
                  name="weight"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue={adPlacement?.weight || 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Чем больше вес, тем выше приоритет показа</p>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Image className="h-5 w-5 mr-2" />
              Медиа и ссылки
            </h2>
            
            <div className="space-y-6">
              {/* Загрузка файла */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображение *
                </label>
                <FileUpload
                  onUpload={(url) => {
                    console.log('FileUpload onUpload called with URL:', url)
                    setImageUrl(url)
                  }}
                  currentUrl={adPlacement?.imageUrl || undefined}
                  accept="image/*"
                  maxSize={5}
                />
                <p className="text-xs text-gray-500 mt-2">Рекомендуемые размеры см. в описании позиции</p>
                
                {!imageUrl && (
                  <p className="text-xs text-red-600 mt-2">⚠️ Необходимо загрузить изображение для сохранения</p>
                )}
                
                {/* Скрытое поле для отправки URL */}
                <input
                  type="hidden"
                  name="imageUrl"
                  value={imageUrl}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ссылка при клике
                </label>
                <input
                  name="hrefUrl"
                  type="text"
                  value={hrefUrl}
                  onChange={handleHrefUrlChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hrefUrlError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com (необязательно)"
                />
                {hrefUrlError ? (
                  <p className="text-xs text-red-600 mt-1">{hrefUrlError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Оставьте пустым, если реклама без ссылки</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Расписание
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата начала
                </label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={formatDateTime(adPlacement?.startsAt || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Оставьте пустым для немедленного показа</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания
                </label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={formatDateTime(adPlacement?.endsAt || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Оставьте пустым для бессрочного показа</p>
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Дополнительные настройки</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Порядок сортировки
                </label>
                <input
                  name="order"
                  type="number"
                  defaultValue={adPlacement?.order || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Меньше число = выше в списке</p>
              </div>

              <div className="flex items-center">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={adPlacement?.isActive ?? true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Активен
                </label>
              </div>
            </div>
          </div>

          {/* Position Guidelines */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Рекомендации по размерам</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Полоска над событиями</h4>
                <p className="text-sm text-gray-600 mb-2">Размер: 40px высота, полная ширина</p>
                <p className="text-sm text-gray-500">Отступы по краям: 16px</p>
                <p className="text-xs text-gray-400 mt-2">Рекомендуемый формат: JPG/PNG, до 100KB</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Слева под фильтрами</h4>
                <p className="text-sm text-gray-600 mb-2">Размер: 400x260px</p>
                <p className="text-sm text-gray-500">Прямоугольный блок</p>
                <p className="text-xs text-gray-400 mt-2">Рекомендуемый формат: JPG/PNG, до 200KB</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Внутри контента</h4>
                <p className="text-sm text-gray-600 mb-2">Размер: 400x260px</p>
                <p className="text-sm text-gray-500">Под билетами, прямоугольный блок</p>
                <p className="text-xs text-gray-400 mt-2">Рекомендуемый формат: JPG/PNG, до 200KB</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/admin/afisha/ads${keySuffix}`}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={!imageUrl || !!hrefUrlError}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                imageUrl && !hrefUrlError
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Сохранить изменения' : 'Создать рекламный слот'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
