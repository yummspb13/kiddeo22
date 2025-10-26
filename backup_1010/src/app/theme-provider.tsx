'use client'

import { useEffect } from 'react'

type Props = { children: React.ReactNode }

/**
 * Простая инициализация темы:
 * - Берём localStorage.theme, иначе — prefers-color-scheme
 * - Ставим класс .dark на <html> без мерцания
 * - В дальнейшем можно добавить переключатель, который пишет в localStorage
 */
export default function ThemeProvider({ children }: Props) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') // 'light' | 'dark'
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme = stored ?? (prefersDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', theme === 'dark')
    } catch {
      // no-op
    }
  }, [])

  return <>{children}</>
}
