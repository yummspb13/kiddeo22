'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VenueParameter {
  id: number
  subcategoryId: number
  name: string
  type: string
  config: unknown
  isFree: boolean
  isOptimal: boolean
  isMaximum: boolean
  order: number
  isActive: boolean
  subcategory: {
    id: number
    name: string
    category: {
      name: string
    }
  }
}

export default function VenueParameterEditForm({ parameterId, k }: { parameterId: number; k: string }) {
  const [parameter, setParameter] = useState<VenueParameter | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    type: 'TEXT',
    config: {},
    isFree: false,
    isOptimal: false,
    isMaximum: false,
    order: 0,
    isActive: true
  })

  useEffect(() => {
    const fetchParameter = async () => {
      try {
        const response = await fetch(`/api/admin/venues/parameters/${parameterId}?key=${k}`)
        if (response.ok) {
          const data = await response.json()
          setParameter(data)
          setFormData({
            name: data.name,
            type: data.type,
            config: typeof data.config === 'string' ? JSON.parse(data.config) : data.config,
            isFree: data.isFree,
            isOptimal: data.isOptimal,
            isMaximum: data.isMaximum,
            order: data.order,
            isActive: data.isActive
          })
        }
      } catch (error) {
        console.error('Error fetching parameter:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchParameter()
  }, [parameterId, k])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/venues/parameters/${parameterId}?key=${k}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/admin/venues/parameters${k}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Ошибка при сохранении параметра')
      }
    } catch (error) {
      console.error('Error saving parameter:', error)
      alert('Ошибка при сохранении параметра')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3">Загрузка параметра...</p>
      </div>
    )
  }

  if (!parameter) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Параметр не найден.</p>
        <Link href={`/admin/venues/parameters${k}`} className="mt-4 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 inline-block mr-1" /> Вернуться к списку
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Редактирование параметра</h1>
          <p className="text-sm text-gray-600">
            {parameter.subcategory.category.name} → {parameter.subcategory.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/admin/venues/parameters${k}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 inline-block mr-2" />
            Назад к параметрам
          </Link>
        </div>
      </div>

      {/* Форма редактирования */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Основные настройки</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Название параметра */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название параметра
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название параметра"
            />
          </div>

          {/* Тип параметра */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип параметра
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TEXT">Текст</option>
              <option value="TEXTAREA">Многострочный текст</option>
              <option value="SELECT">Выпадающий список</option>
              <option value="RADIO">Радиокнопки</option>
              <option value="CHECKBOX">Чекбоксы</option>
              <option value="NUMBER">Число</option>
              <option value="PHOTO_UPLOADER">Загрузка фото</option>
              <option value="MAP_ADDRESS">Адрес на карте</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>

          {/* Порядок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порядок отображения
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          {/* Тарифы */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Доступность по тарифам
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Бесплатный тариф</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isOptimal}
                  onChange={(e) => setFormData({ ...formData, isOptimal: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Оптимальный тариф</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isMaximum}
                  onChange={(e) => setFormData({ ...formData, isMaximum: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Максимальный тариф</span>
              </label>
            </div>
          </div>

          {/* Активность */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Активный параметр</span>
            </label>
          </div>

          {/* Конфигурация */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Конфигурация (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.config, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value)
                  setFormData({ ...formData, config })
                } catch (error) {
                  // Игнорируем ошибки парсинга во время ввода
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
              placeholder="Конфигурация параметра в формате JSON"
            />
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <Link
            href={`/admin/venues/parameters${k}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="w-4 h-4 inline-block mr-2" />
            Отмена
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline-block mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
