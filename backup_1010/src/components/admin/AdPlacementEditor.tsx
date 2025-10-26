// src/components/admin/AdPlacementEditor.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

interface AdPlacement {
  id?: number
  page: string
  position: 'HERO' | 'HERO_BELOW' | 'INLINE' | 'SIDEBAR'
  title: string
  imageUrl?: string
  hrefUrl?: string
  startsAt?: Date
  endsAt?: Date
  order: number
  isActive: boolean
  cityId?: number | null
  weight: number
}

interface AdPlacementEditorProps {
  placement?: AdPlacement
  cities: Array<{ id: number; name: string }>
  onSave: (placement: AdPlacement) => void
  onCancel: () => void
}

const POSITION_OPTIONS = [
  { value: 'HERO', label: 'Главный баннер (HERO)' },
  { value: 'HERO_BELOW', label: 'Под главным баннером' },
  { value: 'INLINE', label: 'Внутри контента' },
  { value: 'SIDEBAR', label: 'Боковая панель' }
]

const PAGE_OPTIONS = [
  { value: 'afisha', label: 'Афиша' },
  { value: 'venues', label: 'Места' },
  { value: 'blog', label: 'Блог' }
]

export default function AdPlacementEditor({ 
  placement, 
  cities, 
  onSave, 
  onCancel 
}: AdPlacementEditorProps) {
  const [formData, setFormData] = useState<AdPlacement>({
    id: placement?.id,
    page: placement?.page || 'afisha',
    position: placement?.position || 'HERO',
    title: placement?.title || '',
    imageUrl: placement?.imageUrl || '',
    hrefUrl: placement?.hrefUrl || '',
    startsAt: placement?.startsAt,
    endsAt: placement?.endsAt,
    order: placement?.order || 0,
    isActive: placement?.isActive ?? true,
    cityId: placement?.cityId || null,
    weight: placement?.weight || 1
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const initialData = useRef<AdPlacement>(formData)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(formData.imageUrl || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setIsUploading(true)
      
      try {
        const formData = new FormData()
        formData.append("file", file)
        
        const response = await fetch(`/api/admin/upload-image?key=kidsreview2025`, {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error("Upload failed")
        }
        
        const result = await response.json()
        setImagePreview(result.url)
        setFormData(prev => ({ ...prev, imageUrl: result.url }))
        
      } catch (error) {
        console.error("Upload error:", error)
        alert("Ошибка загрузки изображения")
      } finally {
        setIsUploading(false)
      }
    }
  }

  // Отслеживаем изменения
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData.current)
    setHasUnsavedChanges(hasChanges)
  }, [formData])

  // Обработка клика вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true)
    } else {
      onCancel()
    }
  }

  const handleConfirmClose = () => {
    setShowConfirmClose(false)
    onCancel()
  }

  const handleCancelClose = () => {
    setShowConfirmClose(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return new Date(date).toISOString().slice(0, 16)
  }

  const parseDate = (dateString: string) => {
    return dateString ? new Date(dateString) : undefined
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-4 pr-8">
            {placement ? "Редактировать рекламный слот" : "Создать рекламный слот"}
          </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Страница
              </label>
              <select
                value={formData.page}
                onChange={(e) => setFormData(prev => ({ ...prev, page: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Позиция
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  position: e.target.value as AdPlacement['position'] 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POSITION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Город
              </label>
              <select
                value={formData.cityId || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  cityId: e.target.value ? Number(e.target.value) : null 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все города</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порядок
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вес (приоритет)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ссылка
            </label>
            <input
              type="url"
              value={formData.hrefUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hrefUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Изображение
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              {isUploading && (
                <div className="text-sm text-blue-600">Загрузка изображения...</div>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-xs max-h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Начало показа
              </label>
              <input
                type="datetime-local"
                value={formatDate(formData.startsAt)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  startsAt: parseDate(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Конец показа
              </label>
              <input
                type="datetime-local"
                value={formatDate(formData.endsAt)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  endsAt: parseDate(e.target.value) 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Активен</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {placement ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Модальное окно подтверждения закрытия */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Подтверждение</h3>
            <p className="text-gray-600 mb-6">
              У вас есть несохраненные изменения. Действительно ли хотите закрыть без сохранения?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Закрыть без сохранения
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
