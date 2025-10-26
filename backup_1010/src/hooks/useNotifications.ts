'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Notification {
  id: string
  type: 'review_reply_received' | 'review_reaction' | 'review_created' | 'child_added' | 'user_registered' | 'success' | 'error' | 'info'
  title: string
  message: string
  data?: any
  createdAt: string
  duration?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  // Добавляем уведомление
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    console.log('📢 useNotifications: addNotification called:', newNotification)
    
    setNotifications(prev => {
      const updated = [...prev, newNotification]
      console.log('📢 useNotifications: Updated notifications count:', updated.length)
      return updated
    })
  }, [])

  // Удаляем уведомление
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Очищаем все уведомления
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Автоматически очищаем старые уведомления
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        const now = Date.now()
        const filtered = prev.filter(notification => {
          const createdAt = new Date(notification.createdAt).getTime()
          const duration = notification.duration || 5000
          return (now - createdAt) < duration
        })
        
        if (filtered.length !== prev.length) {
          console.log('🧹 useNotifications: Cleaned old notifications:', prev.length - filtered.length)
        }
        
        return filtered
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Показываем уведомление об успехе
  const showSuccess = useCallback((title: string, message: string, duration = 4000) => {
    console.log('🎉 useNotifications: showSuccess called:', { title, message, duration })
    addNotification({
      type: 'success',
      title,
      message,
      duration,
      createdAt: new Date().toISOString()
    })
  }, [addNotification])

  // Показываем уведомление об ошибке
  const showError = useCallback((title: string, message: string, duration = 6000) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration,
      createdAt: new Date().toISOString()
    })
  }, [addNotification])

  // Показываем информационное уведомление
  const showInfo = useCallback((title: string, message: string, duration = 5000) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration,
      createdAt: new Date().toISOString()
    })
  }, [addNotification])

  // Слушаем события активности пользователя
  useEffect(() => {
    if (!user?.id) return

    const handleActivityEvent = (event: CustomEvent) => {
      const { type, data } = event.detail
      
      switch (type) {
        case 'review_reply_received':
          addNotification({
            type: 'review_reply_received',
            title: 'Получен ответ на отзыв',
            message: `Пользователь ${data.replyAuthorName || 'Кто-то'} ответил на ваш отзыв о мероприятии "${data.eventTitle || 'Мероприятие'}"`,
            data,
            createdAt: new Date().toISOString()
          })
          break
          
        case 'review_reaction':
          addNotification({
            type: 'review_reaction',
            title: 'Реакция на отзыв',
            message: `Кто-то поставил реакцию на ваш отзыв`,
            data,
            createdAt: new Date().toISOString()
          })
          break
          
        case 'child_added':
          addNotification({
            type: 'child_added',
            title: 'Ребенок добавлен',
            message: `Вы успешно добавили ребенка "${data.childName || 'Ребенок'}" в профиль`,
            data,
            createdAt: new Date().toISOString()
          })
          break
          
        case 'review_created':
          addNotification({
            type: 'review_created',
            title: 'Отзыв создан',
            message: `Ваш отзыв о мероприятии "${data.eventTitle || 'Мероприятие'}" успешно добавлен`,
            data,
            createdAt: new Date().toISOString()
          })
          break
      }
    }

    const handleRefreshNotifications = () => {
      console.log('🔄 Refreshing notifications...')
      // Здесь можно добавить логику обновления уведомлений из API
    }

    // Добавляем слушатели событий
    window.addEventListener('user-activity', handleActivityEvent as EventListener)
    window.addEventListener('refresh-notifications', handleRefreshNotifications)

    return () => {
      window.removeEventListener('user-activity', handleActivityEvent as EventListener)
      window.removeEventListener('refresh-notifications', handleRefreshNotifications)
    }
  }, [user?.id, addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showInfo
  }
}

// Функция для отправки события активности
export function emitActivityEvent(type: string, data: any) {
  const event = new CustomEvent('user-activity', {
    detail: { type, data }
  })
  window.dispatchEvent(event)
}