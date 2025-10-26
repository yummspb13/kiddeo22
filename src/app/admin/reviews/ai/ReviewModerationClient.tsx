'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { Settings, Upload, Save, Play, AlertCircle, CheckCircle, Clock, FileText, Key, Brain } from 'lucide-react'

interface ModerationSettings {
  openaiApiKey: string
  rules: string
  isEnabled: boolean
  autoApprove: boolean
  memoryContext: string
  model: string
}

export default function ReviewModerationClient() {
  const [settings, setSettings] = useState<ModerationSettings>({
    openaiApiKey: '',
    rules: '',
    isEnabled: false,
    autoApprove: false,
    memoryContext: '',
    model: 'gpt-4'
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  // Загружаем настройки
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/universal-review-moderation?key=kidsreview2025')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      addToast({
        type: 'error',
        title: 'Ошибка загрузки настроек',
        message: 'Не удалось загрузить настройки модерации',
        duration: 6000
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/universal-review-moderation?key=kidsreview2025', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Настройки сохранены!',
          message: 'Настройки модерации успешно обновлены',
          duration: 4000
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      addToast({
        type: 'error',
        title: 'Ошибка сохранения',
        message: 'Не удалось сохранить настройки модерации',
        duration: 6000
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      // Читаем содержимое файла
      const text = await file.text()
      
      // Обновляем правила из файла
      setSettings(prev => ({
        ...prev,
        rules: text
      }))

      addToast({
        type: 'success',
        title: 'Файл загружен!',
        message: 'Правила модерации загружены из файла',
        duration: 4000
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      addToast({
        type: 'error',
        title: 'Ошибка загрузки файла',
        message: 'Не удалось загрузить файл с правилами',
        duration: 6000
      })
    } finally {
      setUploading(false)
    }
  }

  const testModeration = async () => {
    setTesting(true)
    try {
      // Тестовый отзыв для проверки AI
      const testReview = {
        reviewId: 'test-review',
        reviewType: 'venue',
        rating: 3,
        comment: 'Неплохое место, но есть проблемы с организацией. Персонал не очень дружелюбный.',
        photos: null,
        entityName: 'Тестовое место',
        entityType: 'Место'
      }

      const response = await fetch('/api/admin/universal-review-moderation?key=kidsreview2025', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testReview)
      })

      if (response.ok) {
        const result = await response.json()
        addToast({
          type: 'success',
          title: 'Тест успешен!',
          message: `AI решение: ${result.decision}, Уверенность: ${Math.round(result.confidence * 100)}%`,
          duration: 8000
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Test failed:', errorData)
        throw new Error(`Test failed: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error testing moderation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      addToast({
        type: 'error',
        title: 'Ошибка тестирования',
        message: `Не удалось протестировать модерацию: ${errorMessage}`,
        duration: 8000
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Основные настройки */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-violet-600" />
          <h2 className="text-xl font-bold text-gray-900 font-unbounded">
            Основные настройки
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API ключ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
              <Key className="w-4 h-4 inline mr-2" />
              OpenAI API ключ
            </label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
              placeholder="your-openai-api-key-here"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded"
            />
          </div>

          {/* Модель AI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
              <Brain className="w-4 h-4 inline mr-2" />
              Модель AI
            </label>
            <select
              value={settings.model}
              onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded"
            >
              <option value="gpt-4">GPT-4 (Рекомендуется)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (Быстрее)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Экономнее)</option>
              <option value="gpt-4o">GPT-4o (Новейшая)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Быстрая и дешевая)</option>
            </select>
          </div>

          {/* Включить модерацию */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-gray-700 font-unbounded">
                Включить AI модерацию
              </span>
            </label>
          </div>

          {/* Автоодобрение */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => setSettings(prev => ({ ...prev, autoApprove: e.target.checked }))}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-gray-700 font-unbounded">
                Автоматически одобрять безопасные отзывы
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Правила модерации */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-violet-600" />
            <h2 className="text-xl font-bold text-gray-900 font-unbounded">
              Правила модерации
            </h2>
          </div>
          
          <div className="flex space-x-2">
            <label className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-lg cursor-pointer transition-colors font-unbounded text-sm flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Загрузить файл</span>
              <input
                type="file"
                accept=".txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <textarea
          value={settings.rules}
          onChange={(e) => setSettings(prev => ({ ...prev, rules: e.target.value }))}
          placeholder="Введите правила модерации отзывов..."
          rows={12}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded text-sm"
        />
      </div>

      {/* Контекст памяти */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-violet-600" />
          <h2 className="text-xl font-bold text-gray-900 font-unbounded">
            Контекст для AI памяти
          </h2>
        </div>

        <textarea
          value={settings.memoryContext}
          onChange={(e) => setSettings(prev => ({ ...prev, memoryContext: e.target.value }))}
          placeholder="Дополнительная информация для AI анализа..."
          rows={6}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-unbounded text-sm"
        />
      </div>

      {/* Действия */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={testModeration}
              disabled={testing || !settings.openaiApiKey}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-unbounded font-medium transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{testing ? 'Тестирование...' : 'Тестировать AI'}</span>
            </button>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-unbounded font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить настройки'}</span>
          </button>
        </div>
      </div>

      {/* Статус системы */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-unbounded">
          Статус системы модерации
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            {settings.openaiApiKey ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-700 font-unbounded">
              API ключ {settings.openaiApiKey ? 'настроен' : 'не настроен'}
            </span>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Brain className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 font-unbounded">
              Модель: {settings.model}
            </span>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            {settings.isEnabled ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-gray-700 font-unbounded">
              Модерация {settings.isEnabled ? 'включена' : 'отключена'}
            </span>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            {settings.rules ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-700 font-unbounded">
              Правила {settings.rules ? 'настроены' : 'не настроены'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
