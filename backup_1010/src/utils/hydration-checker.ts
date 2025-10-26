/**
 * Утилиты для проверки и предотвращения hydration mismatch
 */

export interface HydrationCheckResult {
  page: string
  hasMismatch: boolean
  errors: string[]
  warnings: string[]
  serverHTML?: string
  clientHTML?: string
}

export interface HydrationCheckerOptions {
  baseUrl?: string
  timeout?: number
  checkAllRoutes?: boolean
  excludePatterns?: string[]
}

/**
 * Компонент-обертка для предотвращения hydration mismatch
 */
export function withHydrationCheck<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  return function HydrationCheckedComponent(props: T) {
    const [isHydrated, setIsHydrated] = React.useState(false)
    const [hasError, setHasError] = React.useState(false)

    React.useEffect(() => {
      setIsHydrated(true)
    }, [])

    // В режиме разработки проверяем на hydration ошибки
    if (process.env.NODE_ENV === 'development') {
      React.useEffect(() => {
        const handleError = (event: ErrorEvent) => {
          if (event.message.includes('Hydration failed') || 
              event.message.includes('hydration mismatch')) {
            console.error(`🚨 Hydration error in ${componentName || 'component'}:`, event.error)
            setHasError(true)
          }
        }

        window.addEventListener('error', handleError)
        return () => window.removeEventListener('error', handleError)
      }, [])
    }

    // Показываем fallback до гидратации
    if (!isHydrated) {
      return React.createElement('div', { 
        className: 'animate-pulse bg-gray-100 rounded h-8 w-full' 
      })
    }

    if (hasError) {
      console.warn(`⚠️ Hydration error detected in ${componentName || 'component'}`)
    }

    return React.createElement(Component, props)
  }
}

/**
 * Хук для безопасного использования клиентских API
 */
export function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const isClient = typeof window !== 'undefined'
  
  if (isClient) {
    React.useLayoutEffect(effect, deps)
  } else {
    React.useEffect(effect, deps)
  }
}

/**
 * Хук для предотвращения hydration mismatch с датами
 */
export function useSafeDate(initialDate?: Date) {
  const [date, setDate] = React.useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  return { date, isHydrated }
}

/**
 * Хук для безопасного использования window объекта
 */
export function useWindow() {
  const [windowObj, setWindowObj] = React.useState<Window | null>(null)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
    setWindowObj(window)
  }, [])

  return { window: windowObj, isHydrated }
}

/**
 * Хук для безопасного использования localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
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

  const setValue = React.useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (isHydrated) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, isHydrated])

  return [storedValue, setValue, isHydrated] as const
}

/**
 * Утилита для проверки, что код выполняется на клиенте
 */
export function isClient() {
  return typeof window !== 'undefined'
}

/**
 * Утилита для проверки, что код выполняется на сервере
 */
export function isServer() {
  return typeof window === 'undefined'
}

/**
 * Безопасное получение значения из window объекта
 */
export function safeWindow<T>(key: keyof Window, fallback: T): T {
  if (isClient() && key in window) {
    return (window as any)[key] as T
  }
  return fallback
}

/**
 * Безопасное выполнение функции только на клиенте
 */
export function safeClient<T>(fn: () => T, fallback: T): T {
  if (isClient()) {
    try {
      return fn()
    } catch (error) {
      console.warn('Error in safeClient:', error)
      return fallback
    }
  }
  return fallback
}

/**
 * Дебаунс для предотвращения частых обновлений
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Хук для отслеживания hydration ошибок
 */
export function useHydrationErrorTracker() {
  const [errors, setErrors] = React.useState<string[]>([])

  React.useEffect(() => {
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

// Импорт React для TypeScript
import * as React from 'react'
