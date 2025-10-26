'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestAuthPage() {
  const { user, loading, refetch } = useAuth()
  const [testResult, setTestResult] = useState<string>('')

  const testLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123' 
        }),
      })

      const data = await response.json()
      setTestResult(JSON.stringify(data, null, 2))
      
      if (data.success) {
        await refetch()
      }
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }

  const testLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()
      setTestResult(JSON.stringify(data, null, 2))
      
      if (data.success) {
        await refetch()
      }
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }

  const testSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      const data = await response.json()
      setTestResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setTestResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Тест аутентификации</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Текущее состояние:</h2>
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Тесты:</h2>
        <div className="space-x-4">
          <button 
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Тест логина
          </button>
          <button 
            onClick={testLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Тест логаута
          </button>
          <button 
            onClick={testSession}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Тест сессии
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Результат:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {testResult || 'Нажмите на кнопку для тестирования'}
        </pre>
      </div>
    </div>
  )
}
