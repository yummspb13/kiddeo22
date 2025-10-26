'use client'

import { useAuthBridge } from '@/modules/auth/useAuthBridge'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export function useUser() {
  const { user, loading } = useAuthBridge()

  return {
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      image: null // У нас нет image в JWT
    } : null,
    loading,
    isAuthenticated: !!user
  }
}
