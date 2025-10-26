'use client'

import React, { useState, useEffect, ReactNode } from 'react'

interface HydrationBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onHydrationError?: (error: Error) => void
  suppressHydrationWarning?: boolean
  className?: string
}

/**
 * Компонент-обертка для предотвращения hydration mismatch
 * Автоматически обрабатывает различия между серверным и клиентским рендерингом
 */
export default function HydrationBoundary({
  children,
  fallback = <div className="animate-pulse bg-gray-100 rounded h-8 w-full" />,
  onHydrationError,
  suppressHydrationWarning = true,
  className = ''
}: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Hydration failed') || 
          event.message.includes('hydration mismatch')) {
        const hydrationError = new Error(`Hydration mismatch: ${event.message}`)
        setError(hydrationError)
        setHasError(true)
        
        if (onHydrationError) {
          onHydrationError(hydrationError)
        }
        
        console.error('🚨 Hydration error detected:', {
          message: event.message,
          error: event.error,
          stack: event.error?.stack
        })
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [onHydrationError])

  // Показываем fallback до гидратации
  if (!isHydrated) {
    return <div className={className}>{fallback}</div>
  }

  // Показываем fallback при ошибке hydration
  if (hasError) {
    return (
      <div className={`${className} p-4 border border-red-200 bg-red-50 rounded-lg`}>
        <div className="flex items-center text-red-600">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium">
            Ошибка загрузки компонента
          </span>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-2 text-xs text-red-500">
            <summary className="cursor-pointer">Детали ошибки</summary>
            <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
          </details>
        )}
      </div>
    )
  }

  return (
    <div 
      className={className}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {children}
    </div>
  )
}

/**
 * Хук для безопасного использования клиентских API
 */
export function useHydrationSafe<T>(
  clientValue: T,
  serverValue: T,
  isClientValue: () => boolean = () => typeof window !== 'undefined'
): T {
  const [value, setValue] = useState(serverValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    if (isClientValue()) {
      setValue(clientValue)
    }
  }, [clientValue, isClientValue])

  return isHydrated ? value : serverValue
}

/**
 * Хук для безопасного использования window объекта
 */
export function useSafeWindow() {
  const [windowObj, setWindowObj] = useState<Window | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    setWindowObj(window)
  }, [])

  return { window: windowObj, isHydrated }
}

/**
 * Хук для безопасного использования localStorage
 */
export function useSafeLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (isHydrated) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, isHydrated] as const
}

/**
 * Хук для безопасного использования дат
 */
export function useSafeDate(initialDate?: Date) {
  const [date, setDate] = useState<Date | null>(initialDate || null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  return { date, isHydrated }
}

/**
 * Хук для отслеживания hydration ошибок
 */
export function useHydrationErrorTracker() {
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Hydration failed') || 
          event.message.includes('hydration mismatch')) {
        setErrors(prev => [...prev, event.message])
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return errors
}
