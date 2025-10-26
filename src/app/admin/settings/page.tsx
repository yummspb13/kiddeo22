// src/app/admin/settings/page.tsx - Настройки сервисов
'use client'

import { useState, useEffect } from 'react'

// Простой хук для уведомлений (заглушка для деплоя)
const useToast = () => {
  const addToast = ({ type, title, message, duration = 3000 }: any) => {
    console.log(`Toast [${type}]: ${title} - ${message}`)
    // В production можно добавить реальные уведомления
  }
  return { addToast }
}

interface ServiceConfig {
  id: string
  name: string
  enabled: boolean
  config: Record<string, any>
  description: string
}

export default function AdminSettingsPage() {
  const [services, setServices] = useState<ServiceConfig[]>([
    {
      id: 'cloudinary',
      name: 'Cloudinary (Файлы)',
      enabled: false,
      config: {
        cloudName: '',
        apiKey: '',
        apiSecret: ''
      },
      description: 'Облачное хранилище для изображений и файлов'
    },
    {
      id: 'email',
      name: 'Email сервис',
      enabled: false,
      config: {
        provider: 'sendgrid', // sendgrid, smtp
        sendgridApiKey: '',
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        fromEmail: 'noreply@kiddeo.ru'
      },
      description: 'Отправка уведомлений и писем пользователям'
    },
    {
      id: 'payments',
      name: 'Платежи (API Точки)',
      enabled: false,
      config: {
        apiUrl: 'https://api.tochka.com',
        clientId: '',
        clientSecret: ''
      },
      description: 'Прием платежей через API Точки'
    },
    {
      id: 'dadata',
      name: 'DaData (Адреса)',
      enabled: false,
      config: {
        apiKey: '',
        secretKey: ''
      },
      description: 'Автодополнение адресов и геокодирование'
    },
    {
      id: 'yandex-maps',
      name: 'Яндекс Карты',
      enabled: false,
      config: {
        apiKey: ''
      },
      description: 'Отображение карт и геолокация'
    },
    {
      id: 'openai',
      name: 'OpenAI (ИИ)',
      enabled: false,
      config: {
        apiKey: '',
        model: 'gpt-4',
        maxTokens: '1000'
      },
      description: 'ИИ для модерации отзывов и генерации контента'
    },
    {
      id: 'yookassa',
      name: 'YOOKASSA (Платежи)',
      enabled: false,
      config: {
        shopId: '',
        secretKey: ''
      },
      description: 'Альтернативная система платежей (legacy)'
    }
  ])

  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  // Загружаем настройки при монтировании
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || services)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ services })
      })

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Настройки сохранены',
          message: 'Конфигурация сервисов обновлена',
          duration: 3000
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      addToast({
        type: 'error',
        title: 'Ошибка сохранения',
        message: 'Не удалось сохранить настройки',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const updateService = (serviceId: string, updates: Partial<ServiceConfig>) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, ...updates }
        : service
    ))
  }

  const updateServiceConfig = (serviceId: string, key: string, value: any) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { 
            ...service, 
            config: { 
              ...service.config, 
              [key]: value 
            } 
          }
        : service
    ))
  }

  const testService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/admin/settings/test/${serviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          service: services.find(s => s.id === serviceId) 
        })
      })

      const result = await response.json()
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Тест успешен',
          message: result.message,
          duration: 3000
        })
      } else {
        addToast({
          type: 'error',
          title: 'Тест не пройден',
          message: result.error,
          duration: 5000
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Ошибка тестирования',
        message: 'Не удалось протестировать сервис',
        duration: 5000
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Настройки сервисов
          </h1>
          <p className="text-gray-600">
            Управление интеграциями и внешними сервисами
          </p>
        </div>

        <div className="space-y-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={service.enabled}
                      onChange={(e) => updateService(service.id, { enabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {service.enabled ? 'Включен' : 'Отключен'}
                    </span>
                  </label>
                  <button
                    onClick={() => testService(service.id)}
                    disabled={!service.enabled}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Тест
                  </button>
                </div>
              </div>

              {service.enabled && (
                <div className="mt-4 space-y-4">
                  {service.id === 'cloudinary' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cloud Name
                        </label>
                        <input
                          type="text"
                          value={service.config.cloudName}
                          onChange={(e) => updateServiceConfig(service.id, 'cloudName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="dkbh2wihq"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="text"
                          value={service.config.apiKey}
                          onChange={(e) => updateServiceConfig(service.id, 'apiKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="246521541339249"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Secret
                        </label>
                        <input
                          type="password"
                          value={service.config.apiSecret}
                          onChange={(e) => updateServiceConfig(service.id, 'apiSecret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ps0PRzY_Mxex1Kfl0OutqaH-98o"
                        />
                      </div>
                    </div>
                  )}

                  {service.id === 'email' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Провайдер
                        </label>
                        <select
                          value={service.config.provider}
                          onChange={(e) => updateServiceConfig(service.id, 'provider', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="sendgrid">SendGrid</option>
                          <option value="smtp">SMTP (Gmail, etc.)</option>
                        </select>
                      </div>

                      {service.config.provider === 'sendgrid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SendGrid API Key
                            </label>
                            <input
                              type="password"
                              value={service.config.sendgridApiKey}
                              onChange={(e) => updateServiceConfig(service.id, 'sendgridApiKey', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="SG.xxx..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email отправителя
                            </label>
                            <input
                              type="email"
                              value={service.config.fromEmail}
                              onChange={(e) => updateServiceConfig(service.id, 'fromEmail', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="noreply@kiddeo.ru"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Host
                            </label>
                            <input
                              type="text"
                              value={service.config.smtpHost}
                              onChange={(e) => updateServiceConfig(service.id, 'smtpHost', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="smtp.gmail.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Port
                            </label>
                            <input
                              type="number"
                              value={service.config.smtpPort}
                              onChange={(e) => updateServiceConfig(service.id, 'smtpPort', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="587"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP User
                            </label>
                            <input
                              type="email"
                              value={service.config.smtpUser}
                              onChange={(e) => updateServiceConfig(service.id, 'smtpUser', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="your-email@gmail.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SMTP Password
                            </label>
                            <input
                              type="password"
                              value={service.config.smtpPass}
                              onChange={(e) => updateServiceConfig(service.id, 'smtpPass', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="App password"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {service.id === 'payments' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API URL
                        </label>
                        <input
                          type="url"
                          value={service.config.apiUrl}
                          onChange={(e) => updateServiceConfig(service.id, 'apiUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://api.tochka.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={service.config.clientId}
                          onChange={(e) => updateServiceConfig(service.id, 'clientId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-client-id"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={service.config.clientSecret}
                          onChange={(e) => updateServiceConfig(service.id, 'clientSecret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-client-secret"
                        />
                      </div>
                    </div>
                  )}

                  {service.id === 'dadata' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="text"
                          value={service.config.apiKey}
                          onChange={(e) => updateServiceConfig(service.id, 'apiKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-dadata-api-key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          value={service.config.secretKey}
                          onChange={(e) => updateServiceConfig(service.id, 'secretKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-dadata-secret-key"
                        />
                      </div>
                    </div>
                  )}

                  {service.id === 'yandex-maps' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={service.config.apiKey}
                        onChange={(e) => updateServiceConfig(service.id, 'apiKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your-yandex-maps-api-key"
                      />
                    </div>
                  )}

                  {service.id === 'openai' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={service.config.apiKey}
                          onChange={(e) => updateServiceConfig(service.id, 'apiKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="sk-..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Модель
                          </label>
                          <select
                            value={service.config.model}
                            onChange={(e) => updateServiceConfig(service.id, 'model', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4o">GPT-4o</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Макс. токенов
                          </label>
                          <input
                            type="number"
                            value={service.config.maxTokens}
                            onChange={(e) => updateServiceConfig(service.id, 'maxTokens', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {service.id === 'yookassa' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shop ID
                        </label>
                        <input
                          type="text"
                          value={service.config.shopId}
                          onChange={(e) => updateServiceConfig(service.id, 'shopId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-shop-id"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          value={service.config.secretKey}
                          onChange={(e) => updateServiceConfig(service.id, 'secretKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-secret-key"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </div>
  )
}
