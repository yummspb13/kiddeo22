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
  const [vendorCheckLoading, setVendorCheckLoading] = useState(false)
  // Убираем isHydrated

  // Отладочная информация (можно убрать в продакшене)
  // console.log('🔍 AuthButton:', { user, loading })


  // Убираем проверку гидратации

  // Функция для принудительного обновления статуса вендора
  const refreshVendorStatus = async () => {
    if (!user?.id) return;
    
    setVendorCheckLoading(true);
    try {
      // Очищаем кэш
      const cacheKey = `vendor_status_${user.id}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_time`);
      
      const res = await fetch('/api/vendor/onboarding', {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) {
          try {
            const data = JSON.parse(text);
            if (data.vendor) {
              setIsVendor(true);
              setVendorData(data.vendor);
              // Кэшируем результат
              localStorage.setItem(cacheKey, text);
              localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            } else {
              setIsVendor(false);
              setVendorData(null);
              // Кэшируем отрицательный результат
              localStorage.setItem(cacheKey, '{"vendor":null}');
              localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            }
          } catch (parseError) {
            console.warn('AuthButton: Failed to parse JSON response:', parseError);
          }
        } else {
          setIsVendor(false);
          setVendorData(null);
        }
      }
    } catch (err) {
      console.error('Error refreshing vendor status:', err);
    } finally {
      setVendorCheckLoading(false);
    }
  };

  // Экспортируем функцию для использования в других компонентах
  useEffect(() => {
    (window as any).refreshVendorStatus = refreshVendorStatus;
    return () => {
      delete (window as any).refreshVendorStatus;
    };
  }, [user?.id]);

  // Проверяем, является ли пользователь вендором (оптимизировано)
  useEffect(() => {
    if (!user?.id) {
      setIsVendor(false);
      setVendorData(null);
      return;
    }
    
    let isCancelled = false;
    
    const checkVendorStatus = async () => {
      try {
        // Проверяем кэш в localStorage
        const cacheKey = `vendor_status_${user.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        
        // Если кэш свежий (менее 5 минут), используем его
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
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 сек таймаут
        
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
                // Кэшируем результат
                localStorage.setItem(cacheKey, text);
                localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
              } else {
                setIsVendor(false);
                setVendorData(null);
                // Кэшируем отрицательный результат
                localStorage.setItem(cacheKey, '{"vendor":null}');
                localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
              }
            } catch (parseError) {
              console.warn('AuthButton: Failed to parse JSON response:', parseError);
            }
          } else {
            setIsVendor(false);
            setVendorData(null);
          }
        } else {
          console.warn('AuthButton: API returned status:', res.status);
          // Не сбрасываем состояние при ошибке API, оставляем как есть
        }
      } catch (err) {
        if (!isCancelled) {
          // Не логируем ошибки отмены запроса (это нормально)
          if (err instanceof DOMException && err.name === 'AbortError') {
          } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
            // Не показываем ошибку сети в консоли - это может быть из-за редиректов
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

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    if (!user?.id) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `vendor_status_${user.id}` && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.vendor) {
            setIsVendor(true);
            setVendorData(data.vendor);
          } else {
            setIsVendor(false);
            setVendorData(null);
          }
        } catch (err) {
          // Игнорируем ошибки парсинга
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

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
  
  // Отладочная информация
  console.log('🔍 AuthButton Debug:', {
    userRole,
    hasAdminAccess,
    isVendor,
    user: user ? { id: user.id, email: user.email, role: user.role } : null
  })

  const handleSignOut = async () => {
    console.log('🚪 Попытка выхода из системы...')
    try {
      const response = await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      })
      console.log('📡 Ответ от API logout:', response.status, response.ok)
      
      if (response.ok) {
        console.log('✅ Logout успешен, обновляем данные пользователя...')
        await refetch()
        console.log('🔄 Редирект на главную страницу...')
        // Редиректим на главную страницу без параметров
        window.location.href = '/'
      } else {
        console.error('❌ Ошибка logout API:', response.status)
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
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

              {/* Кнопка для обновления статуса вендора (только для админов) */}
              {hasAdminAccess && (
                <button
                  onClick={() => {
                    refreshVendorStatus();
                    setShowDropdown(false);
                  }}
                  disabled={vendorCheckLoading}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50" style={{ fontFamily: 'var(--font-unbounded)' }}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  {vendorCheckLoading ? 'Обновление...' : 'Обновить статус вендора'}
                </button>
              )}

              {/* Временная кнопка для изменения роли (только для разработки) */}
              {user?.id && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/roles', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userId: user.id,
                          newRole: 'ADMIN'
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Роль изменена:', result);
                        alert('Роль изменена на ADMIN! Обновите страницу.');
                        window.location.reload();
                      } else {
                        const error = await response.json();
                        console.error('❌ Ошибка изменения роли:', error);
                        alert('Ошибка: ' + (error.error || 'Неизвестная ошибка'));
                      }
                    } catch (error) {
                      console.error('❌ Ошибка запроса:', error);
                      alert('Ошибка запроса: ' + error);
                    }
                    setShowDropdown(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer" style={{ fontFamily: 'var(--font-unbounded)' }}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Сделать админом
                </button>
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
                onClick={() => {
                  console.log('🖱️ Кнопка "Выйти" нажата!')
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