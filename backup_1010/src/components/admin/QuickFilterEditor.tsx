// src/components/admin/QuickFilterEditor.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

interface QuickFilter {
  id?: number
  cityId?: number | null
  page: string
  label: string
  queryJson: unknown
  order: number
  isActive: boolean
}

interface QuickFilterEditorProps {
  filter?: QuickFilter
  cities: Array<{ id: number; name: string }>
  onSave: (filter: QuickFilter) => void
  onCancel: () => void
}

const QUERY_PRESETS = {
  "По умолчанию": {
    date: "weekend",
    price: "free"
  },
  "Спорт": {
    category: "sport",
    ageFrom: 6,
    ageTo: 12
  },
  "Творчество": {
    category: "art",
    ageFrom: 4,
    ageTo: 16
  },
  "Образование": {
    category: "education",
    price: "paid"
  },
  "Развлечения": {
    category: "entertainment",
    date: "today"
  }
}

export default function QuickFilterEditor({ filter, cities, onSave, onCancel }: QuickFilterEditorProps) {
  const [formData, setFormData] = useState<QuickFilter>({
    id: filter?.id,
    cityId: filter?.cityId || null,
    page: filter?.page || "afisha",
    label: filter?.label || "",
    queryJson: filter?.queryJson || {},
    order: filter?.order || 0,
    isActive: filter?.isActive ?? true
  })

  const [jsonError, setJsonError] = useState<string | null>(null)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(formData.queryJson, null, 2))
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const initialData = useRef<QuickFilter>(formData)

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

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    try {
      const parsed = JSON.parse(value)
      setFormData(prev => ({ ...prev, queryJson: parsed }))
      setJsonError(null)
    } catch (error) {
      setJsonError("Неверный JSON формат")
    }
  }

  const handlePresetSelect = (presetName: string) => {
    const preset = QUERY_PRESETS[presetName as keyof typeof QUERY_PRESETS]
    const jsonString = JSON.stringify(preset, null, 2)
    setJsonInput(jsonString)
    setFormData(prev => ({ ...prev, queryJson: preset }))
    setJsonError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (jsonError) return
    
    onSave(formData)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
          {/* Кнопка закрытия */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <h2 className="text-xl font-semibold mb-4 pr-8">
            {filter ? "Редактировать фильтр" : "Создать фильтр"}
          </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название фильтра
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пресеты запросов
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.keys(QUERY_PRESETS).map(presetName => (
                <button
                  key={presetName}
                  type="button"
                  onClick={() => handlePresetSelect(presetName)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  {presetName}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSON запроса
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                jsonError ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={8}
              placeholder='{"date": "weekend", "price": "free"}'
            />
            {jsonError && (
              <p className="text-red-500 text-sm mt-1">{jsonError}</p>
            )}
          </div>

          {/* Предпросмотр */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Предпросмотр
            </label>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600 mb-2">
                Фильтр: <strong>{formData.label}</strong>
                {formData.cityId && (
                  <span> • {cities.find(c => c.id === formData.cityId)?.name}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {JSON.stringify(formData.queryJson, null, 2)}
              </div>
            </div>
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
              disabled={!!jsonError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {filter ? "Сохранить" : "Создать"}
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
