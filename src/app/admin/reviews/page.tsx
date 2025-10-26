'use client'

import { useState } from 'react'
import { MessageSquare, Bot, Settings, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Модерация отзывов</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard?key=kidsreview2025"
                className="text-gray-500 hover:text-gray-700"
              >
                ← Назад к панели
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Все отзывы
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                ИИ Отзывы
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ручная модерация отзывов</h2>
              <p className="text-gray-600 mb-6">
                Просматривайте и модерируйте отзывы вручную. Здесь вы можете одобрить, отклонить или отправить на доработку отзывы пользователей.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="/admin/venues/reviews?key=kidsreview2025&status=MODERATION"
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <MessageSquare className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">На модерации</h3>
                      <p className="text-sm text-gray-600">Новые отзывы</p>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  href="/admin/venues/reviews?key=kidsreview2025&status=APPROVED"
                  className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Одобренные</h3>
                      <p className="text-sm text-gray-600">Проверенные отзывы</p>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  href="/admin/venues/reviews?key=kidsreview2025&status=REJECTED"
                  className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-3">
                      <MessageSquare className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Отклоненные</h3>
                      <p className="text-sm text-gray-600">Не прошедшие модерацию</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ИИ модерация отзывов</h2>
              <p className="text-gray-600 mb-6">
                Автоматическая модерация отзывов с помощью искусственного интеллекта. Настройте правила модерации и позвольте ИИ анализировать отзывы.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/admin/review-moderation?key=kidsreview2025"
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Bot className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Настройки ИИ</h3>
                      <p className="text-sm text-gray-600">Конфигурация модерации</p>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  href="/admin/review-moderation?key=kidsreview2025&tab=history"
                  className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                      <Settings className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">История ИИ</h3>
                      <p className="text-sm text-gray-600">Анализ решений ИИ</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}