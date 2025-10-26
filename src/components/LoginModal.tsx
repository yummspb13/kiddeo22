'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
// Убираем импорт шрифта, используем CSS переменную напрямую

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'email' | 'password' | ''>('')
  const [isClosing, setIsClosing] = useState(false)
  
  const { refetch } = useAuth()
  
  // Уникальные ID для избежания дублирования
  const emailId = `modal-email-${Date.now()}`
  const passwordId = `modal-password-${Date.now()}`

  // Сброс формы при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setError('')
      setErrorType('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setErrorType('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Успешный вход - обновляем сессию и закрываем модалку
        await refetch()
        handleClose()
      } else {
        // Ошибка входа
        if (data.error === 'Invalid credentials') {
          // Проверяем, существует ли пользователь с таким email
          const checkResponse = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })

          const checkData = await checkResponse.json()

          if (checkData.exists) {
            setError('Неверный пароль')
            setErrorType('password')
          } else {
            setError('Такой почты не существует')
            setErrorType('email')
          }
        } else {
          setError(data.error || 'Произошла ошибка при входе')
        }
      }
    } catch (error) {
      console.error('Login fetch error:', error)
      setError('Произошла ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-[1001] flex items-center justify-center bg-gradient-to-br from-black/10 via-black/20 to-black/30 backdrop-blur-md transition-all duration-200 ${
        isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
      }`}
      onClick={handleOverlayClick}
    >
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ring-1 ring-white/10 transition-all duration-200 ${
        isClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Вход в аккаунт
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Войдите, чтобы получить баллы за покупки
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                  errorType === 'email' 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Введите ваш email"
              />
            </div>

            <div>
              <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Пароль
              </label>
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                  errorType === 'password' 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Введите ваш пароль"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800" style={{ fontFamily: 'var(--font-unbounded)' }}>
                      {error}
                    </h3>
                    <div className="mt-2 text-sm text-red-700" style={{ fontFamily: 'var(--font-unbounded)' }}>
                      {errorType === 'email' && (
                        <a href="/auth/register" className="font-medium text-red-600 hover:text-red-500 underline cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}>
                          Зарегистрироваться
                        </a>
                      )}
                      {errorType === 'password' && (
                        <a href="/auth/forgot-password" className="font-medium text-red-600 hover:text-red-500 underline cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}>
                          Забыли пароль?
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" style={{ fontFamily: 'var(--font-unbounded)' }}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-unbounded)' }}>
              Нет аккаунта?{' '}
              <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}>
                Зарегистрироваться
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
