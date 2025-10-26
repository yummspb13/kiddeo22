'use client'

import { ReactNode, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { QueryProvider } from '@/providers/QueryProvider'
import NotificationProvider from '@/components/NotificationProvider'
import { Cart } from '@/components/Cart'

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Обработка ошибок загрузки чанков
    const handleChunkError = (event: ErrorEvent) => {
      if (event.message.includes('Loading chunk') || event.message.includes('ChunkLoadError')) {
        console.warn('Chunk load error detected, reloading page...', event.message)
        // Перезагружаем страницу при ошибке загрузки чанка
        window.location.reload()
      }
    }

    window.addEventListener('error', handleChunkError)
    
    return () => {
      window.removeEventListener('error', handleChunkError)
    }
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            {children}
            <Cart />
            <NotificationProvider />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  )
}


