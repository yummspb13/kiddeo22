'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestCreateUserPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const createTestUser = async () => {
    setLoading(true)
    setResult(null)

    try {
      const testUserData = {
        name: `Тестовый пользователь ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUserData)
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Тестовый пользователь создан: ${data.user.name} (ID: ${data.user.id})`)
      } else {
        const error = await response.json()
        setResult(`❌ Ошибка: ${error.error}`)
      }
    } catch (error) {
      setResult(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-unbounded">
          Создание тестового пользователя
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-unbounded">
            Текущий пользователь: {user?.name || user?.email} (ID: {user?.id})
          </h2>
          
          <div className="mb-4">
            <button
              onClick={createTestUser}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-unbounded disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать тестового пользователя'}
            </button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 font-unbounded">Зачем это нужно:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 font-unbounded">
            <li>• Все текущие отзывы принадлежат одному пользователю (ID: 1)</li>
            <li>• Уведомления не создаются при реакциях на свои отзывы</li>
            <li>• Нужен другой пользователь для тестирования уведомлений</li>
            <li>• После создания войдите под новым пользователем и протестируйте реакции</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
