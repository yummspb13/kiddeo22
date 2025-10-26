'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'
import { useEffect, useState } from 'react'

interface ProtectedProfileProps {
  children: React.ReactNode
}

export default function ProtectedProfile({ children }: ProtectedProfileProps) {
  const { user, loading, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])


  // Показываем загрузку пока проверяем аутентификацию или не завершена гидратация
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Если пользователь не авторизован, показываем модалку
  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Доступ к профилю</h2>
              <p className="text-gray-600 mb-6">
                Для просмотра профиля необходимо войти в систему
              </p>
              <button
                onClick={openLoginModal}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Войти в аккаунт
              </button>
            </div>
          </div>
        </div>
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </>
    )
  }

  // Если пользователь авторизован, показываем содержимое
  return <>{children}</>
}
