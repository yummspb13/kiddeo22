'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Upload, Edit3, Trash2, Save } from 'lucide-react'

interface Feature {
  id: string
  icon: string
  text: string
}

interface FeaturesManagerProps {
  venueId: number
  features: Feature[]
  onSave: (features: Feature[]) => void
  disabled?: boolean
}

export default function FeaturesManager({ venueId, features, onSave, disabled = false }: FeaturesManagerProps) {
  const [localFeatures, setLocalFeatures] = useState<Feature[]>(features)
  const [editingFeature, setEditingFeature] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState({ icon: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug logging (only when features change)
  useEffect(() => {
    console.log('🔧 FeaturesManager: Features changed:', {
      venueId,
      features,
      localFeatures,
      disabled
    })
  }, [features, localFeatures, disabled])

  useEffect(() => {
    console.log('🔧 FeaturesManager: useEffect triggered, features:', features)
    setLocalFeatures(features)
  }, [features])

  const handleAddFeature = () => {
    if (!newFeature.text.trim()) return

    const feature: Feature = {
      id: `feature_${Date.now()}`,
      icon: newFeature.icon,
      text: newFeature.text
    }

    console.log('🔧 FeaturesManager: Adding feature:', feature)
    setLocalFeatures(prev => {
      const newFeatures = [...prev, feature]
      console.log('🔧 FeaturesManager: Updated features:', newFeatures)
      return newFeatures
    })
    setNewFeature({ icon: '', text: '' })
  }

  const handleEditFeature = (id: string, field: 'icon' | 'text', value: string) => {
    setLocalFeatures(prev => 
      prev.map(feature => 
        feature.id === id 
          ? { ...feature, [field]: value }
          : feature
      )
    )
  }

  const handleDeleteFeature = (id: string) => {
    setLocalFeatures(prev => prev.filter(feature => feature.id !== id))
  }

  const handleSave = async () => {
    console.log('🔧 FeaturesManager: handleSave called with features:', localFeatures)
    try {
      setLoading(true)
      setError(null)
      console.log('🔧 FeaturesManager: Calling onSave...')
      await onSave(localFeatures)
      console.log('🔧 FeaturesManager: onSave completed successfully')
    } catch (err) {
      console.error('🔧 FeaturesManager: Error in handleSave:', err)
      setError(err instanceof Error ? err.message : 'Failed to save features')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (file: File, featureId?: string) => {
    if (!file) return

    // Проверяем размер файла (максимум 1MB)
    if (file.size > 1024 * 1024) {
      setError('Размер файла не должен превышать 1MB')
      return
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (featureId) {
        handleEditFeature(featureId, 'icon', result)
      } else {
        setNewFeature(prev => ({ ...prev, icon: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Особенности</h3>
        <span className="text-sm text-gray-500">
          {localFeatures.length} из 10
        </span>
      </div>

      {/* Existing Features */}
      <div className="space-y-4">
        {localFeatures.map((feature) => (
          <div key={feature.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            {/* Icon */}
            <div className="flex-shrink-0">
              {feature.icon ? (
                <div className="relative group">
                  <img 
                    src={feature.icon} 
                    alt="Feature icon"
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleImageUpload(file, feature.id)
                        }
                        input.click()
                      }}
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleImageUpload(file, feature.id)
                        }
                        input.click()
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Upload className="h-6 w-6" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1">
              {editingFeature === feature.id ? (
                <input
                  type="text"
                  value={feature.text}
                  onChange={(e) => handleEditFeature(feature.id, 'text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Описание особенности"
                  autoFocus
                />
              ) : (
                <p className="text-gray-900">{feature.text}</p>
              )}
            </div>

            {/* Actions */}
            {!disabled && (
              <div className="flex items-center space-x-2">
                {editingFeature === feature.id ? (
                  <button
                    type="button"
                    onClick={() => setEditingFeature(null)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingFeature(feature.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteFeature(feature.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Feature */}
      {!disabled && localFeatures.length < 10 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            {/* Icon Upload */}
            <div className="flex-shrink-0">
              {newFeature.icon ? (
                <div className="relative group">
                  <img 
                    src={newFeature.icon} 
                    alt="New feature icon"
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleImageUpload(file)
                      }
                      input.click()
                    }}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleImageUpload(file)
                    }
                    input.click()
                  }}
                  className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400"
                >
                  <Upload className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Text Input */}
            <div className="flex-1">
              <input
                type="text"
                value={newFeature.text}
                onChange={(e) => setNewFeature(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Добавить особенность..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddFeature}
              disabled={!newFeature.text.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Save Button */}
      {!disabled && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Сохранение...' : 'Сохранить особенности'}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-500">
        <p>• Загружайте иконки размером 64x64 пикселя для лучшего качества</p>
        <p>• Поддерживаются форматы: JPG, PNG, GIF</p>
        <p>• Максимальный размер файла: 1MB</p>
        <p>• Можно добавить до 10 особенностей</p>
      </div>
    </div>
  )
}
