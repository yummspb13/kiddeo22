'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Save, AlertCircle } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface UserSettings {
  id: number
  name: string
  email: string
  image?: string
  createdAt: string
  updatedAt: string
}

interface SettingsManagerProps {
  onStatsUpdate?: () => void
}

export default function SettingsManager({ onStatsUpdate }: SettingsManagerProps) {
  const { user, loading: userLoading } = useUser()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  console.log('🔍 SettingsManager - User:', user, 'UserLoading:', userLoading)

  useEffect(() => {
    console.log('🔍 SettingsManager useEffect - User:', user, 'UserLoading:', userLoading)
    if (user?.id) {
      console.log('🔍 SettingsManager - Fetching settings for user:', user.id)
      fetchSettings()
    } else if (!userLoading) {
      console.log('🔍 SettingsManager - No user ID after loading, setting loading to false')
      setLoading(false)
    }
  }, [user?.id, userLoading])

  const fetchSettings = async () => {
    if (!user?.id) {
      console.log('🔍 fetchSettings - No user ID')
      return
    }

    console.log('🔍 fetchSettings - Starting fetch for user:', user.id)
    try {
      const response = await fetch('/api/profile/simple-settings', {
        headers: {
          'x-user-id': user.id
        }
      })
      console.log('🔍 fetchSettings - Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 fetchSettings - Data received:', data)
        setSettings(data.user)
        setFormData({
          name: data.user.name || '',
          email: data.user.email || ''
        })
      } else {
        console.error('🔍 fetchSettings - Response not ok:', response.status)
      }
    } catch (error) {
      console.error('🔍 fetchSettings - Error:', error)
    } finally {
      console.log('🔍 fetchSettings - Setting loading to false')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('Пользователь не авторизован')
      return
    }
    
    if (!formData.name || !formData.email) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/profile/simple-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.user)
        setMessage('Настройки успешно сохранены')
        onStatsUpdate?.()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Произошла ошибка при сохранении')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Произошла ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (userLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Пользователь не авторизован</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Настройки профиля</h3>
      </div>

      {/* Информация о пользователе */}
      {settings && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Информация об аккаунте</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>ID: {settings.id}</div>
            <div>Зарегистрирован: {formatDate(settings.createdAt)}</div>
            <div>Последнее обновление: {formatDate(settings.updatedAt)}</div>
          </div>
        </div>
      )}

      {/* Форма редактирования */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Имя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите ваше имя"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите ваш email"
              required
            />
          </div>
        </div>

        {/* Сообщения */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <Save className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Сохранение...' : 'Сохранить изменения'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
