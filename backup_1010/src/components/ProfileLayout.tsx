"use client"

import { AuthGuard } from './AuthGuard'
import { ReactNode } from 'react'

interface ProfileLayoutProps {
  children: ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}
