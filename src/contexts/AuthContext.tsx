'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'

interface AuthContextType {
  user: any
  loading: boolean
  refetch: () => Promise<void>
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthBridge()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  
  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)
  
  return (
    <AuthContext.Provider value={{
      ...auth,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
