import { useState, useCallback } from 'react'
import { fetchWithTimeout, ApiTimeoutError } from '@/lib/api-timeout'

interface UseSafeApiOptions {
  timeout?: number
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

interface UseSafeApiReturn {
  loading: boolean
  error: string | null
  callApi: (url: string, options?: RequestInit) => Promise<any>
  clearError: () => void
}

export function useSafeApi(options: UseSafeApiOptions = {}): UseSafeApiReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { timeout = 10000, onError, onSuccess } = options

  const callApi = useCallback(async (url: string, apiOptions: RequestInit = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetchWithTimeout(url, apiOptions, timeout)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      onSuccess?.(data)
      return data
      
    } catch (err) {
      let errorMessage = 'Произошла ошибка'
      
      if (err instanceof ApiTimeoutError) {
        errorMessage = 'К сожалению, не удалось загрузить. Сервер перегружен, попробуйте позже.'
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      onError?.(err as Error)
      throw err
      
    } finally {
      setLoading(false)
    }
  }, [timeout, onError, onSuccess])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    callApi,
    clearError
  }
}
