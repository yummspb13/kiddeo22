'use client'

import { useState, useEffect, useRef } from 'react'
import { User, LogOut, Settings, Shield, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'

export default function MobileAuthButton() {
  const { user, loading, refetch, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const [vendorData, setVendorData] = useState<any>(null)
  const [vendorCheckLoading, setVendorCheckLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Проверяем, является ли пользователь вендором
  useEffect(() => {
    if (!user?.id) {
      setIsVendor(false);
      setVendorData(null);
      return;
    }
    
    let isCancelled = false;
    
    const checkVendorStatus = async () => {
      try {
        const cacheKey = `vendor_status_${user.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        
        if (cachedData && cacheTime) {
          const now = Date.now();
          const cacheAge = now - parseInt(cacheTime);
          if (cacheAge < 5 * 60 * 1000) { // 5 минут
            try {
              const data = JSON.parse(cachedData);
              if (data.vendor) {
                setIsVendor(true);
                setVendorData(data.vendor);
                return;
              }
            } catch (e) {
              // Игнорируем ошибки парсинга кэша
            }
          }
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch('/api/vendor/onboarding', {
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (isCancelled) return;
        
        if (res.ok) {
          const text = await res.text();
          if (text.trim()) {
            try {
              const data = JSON.parse(text);
              if (data.vendor) {
                setIsVendor(true);
                setVendorData(data.vendor);
                localStorage.setItem(cacheKey, text);
                localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
              } else {
                setIsVendor(false);
                setVendorData(null);
                localStorage.setItem(cacheKey, '{"vendor":null}');
                localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
              }
            } catch (parseError) {
              console.warn('MobileAuthButton: Failed to parse JSON response:', parseError);
            }
          } else {
            setIsVendor(false);
            setVendorData(null);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof DOMException && err.name === 'AbortError') {
          } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
          } else {
            console.error('Error checking vendor status:', err);
          }
        }
      }
    };
    
    checkVendorStatus();
    
    return () => {
      isCancelled = true;
    };
  }, [user?.id])

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Показываем загрузку только если идет загрузка
  if (loading) {
    return (
      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <User size={20} />
      </button>
    )
  }

  // Если пользователь не авторизован, показываем только иконку входа
  if (!user) {
    return (
      <>
        <button
          onClick={openLoginModal}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <User size={20} />
        </button>
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </>
    )
  }

  // Получаем имя пользователя
  const userName = user.name || user.email || 'Пользователь'
  const userRole = user.role || 'user'
  const hasAdminAccess = userRole === 'admin'

  // Функция выхода
  const handleSignOut = async () => {
    console.log('🚪 Мобильная версия: Попытка выхода из системы...')
    try {
      const response = await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      })
      console.log('📡 Мобильная версия: Ответ от API logout:', response.status, response.ok)
      
      if (response.ok) {
        console.log('✅ Мобильная версия: Logout успешен, обновляем данные пользователя...')
        await refetch()
        console.log('🔄 Мобильная версия: Редирект на главную страницу...')
        window.location.href = '/'
      } else {
        console.error('❌ Мобильная версия: Ошибка logout API:', response.status)
      }
    } catch (error) {
      console.error('❌ Мобильная версия: Logout error:', error)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 flex items-center justify-center text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 rounded-full transition-all duration-200 shadow-sm"
      >
        <User size={20} />
      </button>

      {showDropdown && (
        <>
          {/* Overlay для закрытия dropdown */}
          <div 
            className="fixed inset-0 z-[99999]" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown меню */}
          <div className="absolute right-0 top-12 z-[100000] w-72 max-w-[calc(100vw-2rem)] rounded-lg border bg-white shadow-xl">
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
                <a
                  href="/admin?key=kidsreview2025"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
                  onClick={() => setShowDropdown(false)}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Админ панель
                </a>
              )}

              {isVendor && (
                <a
                  href="/vendor/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
                  onClick={() => setShowDropdown(false)}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Профиль вендора
                </a>
              )}

              <a
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" style={{ fontFamily: 'var(--font-unbounded)' }}
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Профиль
              </a>

              <button
                onClick={() => {
                  console.log('🖱️ Мобильная версия: Кнопка "Выйти" нажата!')
                  handleSignOut()
                }}
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
