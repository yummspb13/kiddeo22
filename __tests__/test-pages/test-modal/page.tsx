'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginModal from '@/components/LoginModal'

export default function TestModalPage() {
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Тест модалки входа</h1>
        
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Пользователь: {user ? user.email : 'Не авторизован'}
          </p>
          
          <button
            onClick={openLoginModal}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Открыть модалку входа
          </button>
        </div>
        
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    </div>
  )
}
