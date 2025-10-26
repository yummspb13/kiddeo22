'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { User, LogOut, Settings, Shield, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'
// Убираем импорт шрифта, используем CSS переменную напрямую

export default function AuthButton() {
  const { user, loading, refetch, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const [vendorData, setVendorData] = useState<any>(null)
  // Убираем isHydrated

  // Отладочная информация (можно убрать в продакшене)
  console.log('🔍 AuthButton:', { user, loading })


  // Убираем проверку гидратации

  // Проверяем, является ли пользователь вендором
  useEffect(() => {
    if (user?.id) {
      fetch('/api/debug-vendor-onboarding')
        .then(res => res.json())
        .then(data => {
          if (data.vendor) {
            setIsVendor(true)
            setVendorData(data.vendor)
          }
        })
        .catch(console.error)
    }
  }, [user?.id])

  // Показываем загрузку только если идет загрузка
  if (loading) {
    return (
      <div className="inline-flex shrink-0 h-10 items-center rounded-full bg-gray-100 px-5 text-sm font-semibold text-gray-500">
        Загрузка...
      </div>
    )
  }

      // Если пользователь не авторизован, показываем кнопки входа/регистрации
      if (!user) {
        return (
          <>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/register"
                data-auth-button="register"
                className="inline-flex shrink-0 h-10 items-center rounded-full border border-slate-300/80 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                Регистрация
              </Link>
              <button
                data-auth-button="login"
                onClick={openLoginModal}
                className="relative inline-flex shrink-0 h-10 items-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 overflow-hidden" style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                <span className="relative z-10">Войти</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </button>
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
          </>
        )
      }

  const userRole = user?.role || 'USER'
  const userName = user?.name || user?.email || 'Пользователь'

  // Определяем, есть ли у пользователя доступ к админке
  const hasAdminAccess = ['ADMIN', 'MANAGER', 'CONTENT_CREATOR'].includes(userRole)

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      })
      await refetch()
      window.location.href = window.location.href
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex shrink-0 h-10 items-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60" style={{ fontFamily: 'var(--font-unbounded)' }}
      >
        <User className="w-4 h-4 mr-2" />
        {userName}
      </button>

      {showDropdown && (
        <>
          {/* Overlay для закрытия dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown меню */}
          <div className="absolute right-0 top-12 z-20 w-64 rounded-lg border bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-unbounded)' }}>{userName}</p>
                  <p className="text-xs text-gray-500 capitalize" style={{ fontFamily: 'var(--font-unbounded)' }}>
                    {isVendor ? 'Вендор' : userRole.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-2">
              {hasAdminAccess && (
                <Link
                  href="/admin?key=kidsreview2025"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
                  onClick={() => setShowDropdown(false)}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Админ панель
                </Link>
              )}

              {isVendor && (
                <Link
                  href="/vendor/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
                  onClick={() => setShowDropdown(false)}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Профиль вендора
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" style={{ fontFamily: 'var(--font-unbounded)' }}
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Профиль
              </Link>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" style={{ fontFamily: 'var(--font-unbounded)' }}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Выйти
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}