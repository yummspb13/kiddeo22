'use client'

import { useEffect } from 'react'
import { useUser } from '@/hooks/useUser'

type Props = { children: React.ReactNode }

/**
 * Инициализация темы:
 * - Для авторизованных пользователей: загружаем из API
 * - Для неавторизованных: localStorage.theme, иначе — prefers-color-scheme
 * - Ставим класс .dark на <html> без мерцания
 */
export default function ThemeProvider({ children }: Props) {
  const { user } = useUser()

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        let theme = 'light'
        
        if (user?.id) {
          // Пользователь авторизован - загружаем из API
          try {
            const response = await fetch('/api/profile/settings', {
              headers: {
                'x-user-id': user.id.toString(),
                'Content-Type': 'application/json',
              },
            })
            
            if (response.ok) {
              const data = await response.json()
              theme = data.settings?.theme || 'light'
            }
          } catch (apiError) {
            console.error('Error loading theme from API:', apiError)
            // Fallback to localStorage
            const stored = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            theme = stored ?? (prefersDark ? 'dark' : 'light')
          }
        } else {
          // Пользователь не авторизован - используем localStorage
          const stored = localStorage.getItem('theme')
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          theme = stored ?? (prefersDark ? 'dark' : 'light')
        }
        
        document.documentElement.classList.toggle('dark', theme === 'dark')
      } catch {
        // no-op
      }
    }
    
    initializeTheme()
  }, [user?.id])

  return <>{children}</>
}
