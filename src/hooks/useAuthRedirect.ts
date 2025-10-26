"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth as useAuthContext } from '@/contexts/AuthContext'

interface UseAuthRedirectOptions {
  redirectTo?: string
  requireAuth?: boolean
  onUnauthorized?: () => void
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { 
    redirectTo = '/auth/signin', 
    requireAuth = true,
    onUnauthorized 
  } = options
  
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Отладочная информация (можно убрать в продакшене)
  // useEffect(() => {
  //   console.log('🔍 useAuthRedirect:', {
  //     loading,
  //     hasUser: !!user,
  //     userId: user?.id,
  //     userEmail: user?.email,
  //     requireAuth,
  //     pathname,
  //     userObject: user
  //   })
  // }, [user, loading, requireAuth, pathname])

  useEffect(() => {
    if (loading) return // Ждем загрузки сессии
    
    if (requireAuth && !user && !isRedirecting) {
      console.log('🔄 useAuthRedirect: Redirecting to login...')
      setIsRedirecting(true)
      
      // Вызываем callback если есть
      if (onUnauthorized) {
        onUnauthorized()
      }
      
      // Сохраняем текущий URL для переадресации после входа
      const currentPath = pathname || '/'
      const callbackUrl = encodeURIComponent(currentPath)
      const redirectUrl = `${redirectTo}?callbackUrl=${callbackUrl}`
      
      console.log('🔄 useAuthRedirect: Redirect URL:', redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, loading, requireAuth, pathname, router, redirectTo, onUnauthorized, isRedirecting])

  return { 
    user, 
    session: user ? { user } : null, // Добавляем session для совместимости
    isLoading: loading,
    isRedirecting,
    isAuthenticated: !!user
  }
}

// Хук для проверки авторизации с автоматическим редиректом
export function useRequireAuth(redirectTo?: string) {
  return useAuthRedirect({ 
    requireAuth: true, 
    redirectTo 
  })
}

// Хук для проверки авторизации без редиректа
export function useAuth() {
  return useAuthRedirect({ 
    requireAuth: false 
  })
}