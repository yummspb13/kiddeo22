'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { logger } from '@/lib/logger'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 минут
        gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
    // Добавляем логирование для React Query
    logger: {
      log: (message) => {
        logger.debug('ReactQuery', message)
      },
      warn: (message) => {
        logger.warn('ReactQuery', message)
      },
      error: (message) => {
        logger.error('ReactQuery', message)
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}