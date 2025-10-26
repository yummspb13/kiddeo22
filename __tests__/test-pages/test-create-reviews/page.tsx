'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestCreateReviewsPage() {
  const { user, loading } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [result, setResult] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string>('')

  useEffect(() => {
    if (loading || !user) return
    fetchEvents()
  }, [loading, user])

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      const response = await fetch('/api/simple-events?limit=10')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        if (data.events && data.events.length > 0) {
          setSelectedEvent(data.events[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const createTestReviews = async () => {
    if (!user?.id || !selectedEvent) {
      setResult('Пользователь не авторизован или событие не выбрано')
      return
    }

    setResult(null)

    try {
      console.log('🔍 Creating test reviews for event:', selectedEvent, 'user:', user.id)
      
      const reviews = [
        {
          eventId: selectedEvent,
          userId: user.id,
          rating: 5,
          comment: 'Отличное мероприятие! Ребенок был в восторге!'
        },
        {
          eventId: selectedEvent,
          userId: user.id,
          rating: 4,
          comment: 'Хорошо организовано, но можно было бы лучше.'
        },
        {
          eventId: selectedEvent,
          userId: user.id,
          rating: 5,
          comment: 'Супер! Обязательно пойдем еще раз!'
        }
      ]

      let createdCount = 0
      for (const review of reviews) {
        const response = await fetch('/api/simple-create-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(review)
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Review created:', data)
          createdCount++
        } else {
          const error = await response.json()
          console.error('❌ Review creation error:', error)
        }
      }

      setResult(`✅ Создано ${createdCount} отзывов из ${reviews.length}`)
    } catch (error) {
      console.error('❌ Error creating reviews:', error)
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const createTestEvent = async () => {
    if (!user?.id) {
      setResult('Пользователь не авторизован')
      return
    }

    setResult(null)

    try {
      console.log('🔍 Creating test event for user:', user.id)
      
      // Получаем существующую категорию
      let categoryId = 2 // Используем существующую категорию "Театры"
      try {
        const categoryResponse = await fetch('/api/admin/categories')
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json()
          if (categoryData.categories && categoryData.categories.length > 0) {
            categoryId = categoryData.categories[0].id
            console.log('✅ Using existing category:', categoryId, categoryData.categories[0].name)
          }
        }
      } catch (categoryError) {
        console.log('⚠️ Error fetching categories, using default ID 2')
      }
      
      const eventData = {
        title: `Тестовое мероприятие для отзывов ${Date.now()}`,
        description: 'Это тестовое мероприятие создано для тестирования системы отзывов и уведомлений.',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // через неделю
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 часа
        venue: 'Тестовый зал',
        organizer: 'Тестовый организатор',
        coordinates: '55.7558,37.6176', // Координаты Москвы
        city: 'Москва',
        citySlug: 'moskva',
        category: 'Театры',
        categoryId: categoryId,
        minPrice: 1000, // в копейках
        ageFrom: 3,
        ageTo: 12,
        ageGroups: '3-6,7-12',
        isPaid: true,
        isPopular: false,
        isPromoted: false,
        priority: 5,
        searchText: 'тестовое мероприятие для отзывов',
        status: 'active'
      }

      const response = await fetch('/api/simple-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Event created:', data)
        setResult(`✅ Событие создано: ${data.event?.title || 'Неизвестно'}`)
        await fetchEvents() // Обновляем список событий
      } else {
        const error = await response.json()
        console.error('❌ Event creation error:', error)
        setResult(`❌ Ошибка создания события: ${error.error}`)
      }
    } catch (error) {
      console.error('❌ Error creating event:', error)
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Не авторизован</h1>
          <p className="text-gray-600">Войдите в систему для создания тестовых отзывов</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
          Создание тестовых отзывов
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-unbounded">
            Пользователь: {user.name || user.email} (ID: {user.id})
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={createTestEvent}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-unbounded"
            >
              Создать тестовое событие
            </button>

            <button
              onClick={fetchEvents}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-unbounded ml-4"
            >
              Обновить список событий
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-unbounded ${
                result.includes('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {result}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-unbounded">
            События для создания отзывов
          </h2>

          {loadingEvents ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-unbounded">Загрузка событий...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-unbounded">Событий не найдено</p>
              <p className="text-sm text-gray-400 font-unbounded mt-2">
                Создайте тестовое событие выше
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-unbounded">
                  Выберите событие для создания отзывов:
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({event.slug})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={createTestReviews}
                disabled={!selectedEvent}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-unbounded disabled:opacity-50"
              >
                Создать тестовые отзывы
              </button>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 font-unbounded">Инструкции:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 font-unbounded">
            <li>• Сначала создайте тестовое событие</li>
            <li>• Выберите событие из списка</li>
            <li>• Создайте тестовые отзывы</li>
            <li>• Перейдите на страницу тестирования реальных уведомлений</li>
            <li>• Протестируйте реакции и ответы на созданные отзывы</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
