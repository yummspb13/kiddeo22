"use client"

import { useRequireAuth } from '@/hooks/useAuthRedirect'
import { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, fallback, redirectTo }: AuthGuardProps) {
  const { session, isLoading, isRedirecting } = useRequireAuth(redirectTo)

  // Показываем загрузку во время проверки авторизации
  if (isLoading || isRedirecting) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  // Если не авторизован, показываем fallback или ничего (редирект произойдет автоматически)
  if (!session) {
    return fallback || null
  }

  // Если авторизован, показываем содержимое
  return <>{children}</>
}
