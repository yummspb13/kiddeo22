'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { QueryProvider } from '@/providers/QueryProvider'
import NotificationProvider from '@/components/NotificationProvider'
import LoggerPanel from '@/components/LoggerPanel'
import { Cart } from '@/components/Cart'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            {children}
            <Cart />
            <NotificationProvider />
            <LoggerPanel />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  )
}


