"use client"

import { useState, useEffect, useRef } from 'react'
import { User, Mail, Lock, Camera, Save, AlertCircle, CheckCircle, Eye, EyeOff, Upload, X } from 'lucide-react'
import { useRequireAuth } from '@/hooks/useAuthRedirect'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'
import { useRouter } from 'next/navigation'

interface UserSettings {
  id: number
  name: string
  email: string
  image?: string
  createdAt: string
  updatedAt: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Предустановленные аватары
const presetAvatars = [
  { id: 'princess', name: 'Принцесса', image: '/avatars/princess.svg' },
  { id: 'prince', name: 'Принц', image: '/avatars/prince.svg' },
  { id: 'knight', name: 'Рыцарь', image: '/avatars/knight.svg' },
  { id: 'wizard', name: 'Волшебник', image: '/avatars/wizard.svg' },
  { id: 'fairy', name: 'Фея', image: '/avatars/fairy.svg' },
  { id: 'dragon', name: 'Дракон', image: '/avatars/dragon.svg' },
  { id: 'unicorn', name: 'Единорог', image: '/avatars/unicorn.svg' },
  { id: 'robot', name: 'Робот', image: '/avatars/robot.svg' }
]

export default function SettingsClient() {
  const { session, isLoading, isAuthenticated } = useRequireAuth()
  const { user: clientUser, refetch: refetchUser } = useAuthBridge()
  const router = useRouter()
  
  // Используем клиентскую сессию для получения актуальных данных
  const currentSession = clientUser ? { user: clientUser } : session
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('')
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Получаем userId из сессии
  const currentUserId = currentSession?.user?.id

  // Загрузка настроек
  useEffect(() => {
    if (isLoading || !isAuthenticated || !currentUserId) {
      return
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/profile/settings', {
          headers: {
            'x-user-id': String(currentUserId)
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSettings(data.user)
          setFormData({
            name: data.user.name || '',
            email: data.user.email || ''
          })
          setSelectedAvatar(data.user.image || '')
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [isLoading, isAuthenticated, currentUserId])

  // Обновляем selectedAvatar при изменении сессии
  useEffect(() => {
    if (currentSession?.user?.image) {
      setSelectedAvatar(currentSession.user.image)
    }
  }, [currentSession?.user?.image])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUserId) {
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
      const response = await fetch('/api/profile/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUserId)
        },
        body: JSON.stringify({
          ...formData,
          image: selectedAvatar
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.user)
        setMessage('Настройки успешно сохранены')
        
        // Обновляем данные пользователя
        try {
          await refetchUser()
        } catch (error) {
          console.log('User refetch failed, refreshing page:', error)
          // Если обновление не работает, обновляем страницу
          setTimeout(() => {
            router.refresh()
          }, 1000)
        }
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUserId) {
      setError('Пользователь не авторизован')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(currentUserId)
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setMessage('Пароль успешно изменен')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setShowPasswordForm(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Произошла ошибка при изменении пароля')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError('Произошла ошибка при изменении пароля')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarSelect = async (avatarId: string) => {
    setSelectedAvatar(avatarId)
    setShowAvatarSelector(false)
    setShowUploadForm(false)
    setUploadedFile(null)
    setPreviewUrl('')
    
        // Обновляем данные пользователя
        try {
          await refetchUser()
    } catch (error) {
      console.log('User refetch failed, refreshing page:', error)
      // Если обновление не работает, обновляем страницу
      setTimeout(() => {
        router.refresh()
      }, 1000)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Валидация файла
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    if (file.size > maxSize) {
      setError('Размер файла не должен превышать 5MB')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Разрешены только файлы: JPG, PNG, GIF, WebP')
      return
    }

    setUploadedFile(file)
    setError('')
    
    // Создаем превью
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async () => {
    if (!uploadedFile || !currentUserId) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('userId', String(currentUserId))

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload successful, data:', data)
        setSelectedAvatar(data.imageUrl)
        setMessage('Аватар успешно загружен')
        setShowUploadForm(false)
        setUploadedFile(null)
        setPreviewUrl('')
        
        // Обновляем данные пользователя
        console.log('Refetching user with image:', data.imageUrl)
        try {
          await refetchUser()
          console.log('User refetched')
        } catch (error) {
          console.log('User refetch failed, refreshing page:', error)
          // Если обновление не работает, обновляем страницу
          setTimeout(() => {
            router.refresh()
          }, 1000)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Ошибка при загрузке файла')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setError('Ошибка при загрузке файла')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Требуется авторизация</h3>
          <p className="text-gray-500">Для просмотра настроек необходимо войти в систему</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка настроек...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Настройки профиля</h1>
          </div>

          {/* Аватар */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Фото профиля</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {(selectedAvatar || currentSession?.user?.image) ? (
                    <img 
                      src={selectedAvatar ? 
                        (presetAvatars.find(a => a.id === selectedAvatar)?.image || selectedAvatar) : 
                        currentSession?.user?.image
                      } 
                      alt="Аватар" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    settings?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
            </div>
            <button
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Выберите аватар для вашего профиля</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {selectedAvatar ? 'Изменить аватар' : 'Выбрать аватар'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Загрузить фото
            </button>
                </div>
          </div>
        </div>

            {/* Селектор аватаров */}
            {showAvatarSelector && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Выберите аватар:</h3>
                <div className="grid grid-cols-4 gap-3">
                  {presetAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedAvatar === avatar.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-12 h-12 rounded-full object-cover mx-auto"
                      />
                      <p className="text-xs text-gray-600 mt-1 text-center">{avatar.name}</p>
                    </button>
                  ))}
                </div>
          </div>
        )}

            {/* Форма загрузки файла */}
            {showUploadForm && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Загрузить свое фото:</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Выберите файл (JPG, PNG, GIF, WebP до 5MB)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {previewUrl && (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Превью"
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                      <button
                        onClick={handleRemoveUploadedFile}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowUploadForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleUploadSubmit}
                        disabled={uploading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploading ? 'Загрузка...' : 'Загрузить'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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

            {/* Кнопка изменения пароля */}
                  <div>
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Lock className="w-4 h-4" />
                <span>{showPasswordForm ? 'Отменить изменение пароля' : 'Изменить пароль'}</span>
              </button>
                      </div>
                      
            {/* Форма изменения пароля */}
            {showPasswordForm && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Изменение пароля</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Текущий пароль
                      </label>
                      <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Введите текущий пароль"
                        required
                        />
                        <button
                          type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Новый пароль
                      </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите новый пароль"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    </div>
                    
                    <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Подтвердите новый пароль
                      </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Подтвердите новый пароль"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{saving ? 'Изменение...' : 'Изменить пароль'}</span>
                    </button>
                  </div>
                </form>
                </div>
              )}

            {/* Сообщения */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
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

          {/* Информация об аккаунте (внизу) */}
          {settings && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Информация об аккаунте</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div>ID: {settings.id}</div>
                  <div>Зарегистрирован: {formatDate(settings.createdAt)}</div>
                  <div>Последнее обновление: {formatDate(settings.updatedAt)}</div>
                </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}