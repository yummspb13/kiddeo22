'use client'

import { useMemo } from 'react'
import { useAuthBridge } from '@/modules/auth/useAuthBridge'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export function useUser() {
  const { user, loading } = useAuthBridge()

  const memoizedUser = useMemo(() => {
    return user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image
    } : null
  }, [user?.id, user?.name, user?.email, user?.image])

  return {
    user: memoizedUser,
    loading,
    isAuthenticated: !!user
  }
}
