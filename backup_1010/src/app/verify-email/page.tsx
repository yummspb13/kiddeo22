'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ subsets: ['latin'] })

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Токен верификации не найден')
      return
    }

    // TODO: Отправка запроса на сервер для верификации токена
    // Пока что просто имитируем успешную верификацию
    setTimeout(() => {
      if (token.startsWith('test-token-')) {
        setStatus('success')
        setMessage('Email успешно подтвержден! Теперь вы можете войти в систему.')
      } else {
        setStatus('error')
        setMessage('Неверный или истекший токен верификации')
      }
    }, 1000)
  }, [token])

  return (
    <div className={`${unbounded.className} min-h-screen bg-gray-50 flex items-center justify-center py-12`}>
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Подтверждение email...
              </h1>
              <p className="text-gray-600">
                Пожалуйста, подождите, мы проверяем ваш токен верификации.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Email подтвержден!
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <a
                href="/auth/signin"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Войти в систему
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Ошибка подтверждения
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-2">
                <a
                  href="/auth/signin"
                  className="block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Попробовать войти
                </a>
                <a
                  href="/auth/register"
                  className="block bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Зарегистрироваться заново
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
