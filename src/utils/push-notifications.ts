/**
 * Push Notifications utilities for PWA
 */

import { useState, useEffect } from 'react'

export interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not initialized')
    }

    try {
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription)
      
      return this.subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false
    }

    try {
      const result = await this.subscription.unsubscribe()
      if (result) {
        this.subscription = null
        // Notify server about unsubscription
        await this.sendUnsubscriptionToServer()
      }
      return result
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription()
      return this.subscription
    } catch (error) {
      console.error('Failed to get push subscription:', error)
      return null
    }
  }

  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription()
    return subscription !== null
  }

  async showNotification(data: NotificationData): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not initialized')
    }

    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-72.png',
      // image: data.image, // Отключено - не поддерживается в NotificationOptions
      tag: data.tag,
      data: data.data,
      actions: data.actions,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200]
    }

    await this.registration.showNotification(data.title, options)
  }

  // Notification types for different events
  async notifyNewEvent(event: any): Promise<void> {
    await this.showNotification({
      title: 'Новое событие!',
      body: `${event.title} - ${event.venue?.name || 'Место проведения'}`,
      tag: 'new-event',
      data: { eventId: event.id, type: 'new-event' },
      actions: [
        { action: 'view-event', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    })
  }

  async notifyOrderUpdate(order: any): Promise<void> {
    await this.showNotification({
      title: 'Обновление заказа',
      body: `Заказ #${order.id} - ${order.status}`,
      tag: 'order-update',
      data: { orderId: order.id, type: 'order-update' },
      actions: [
        { action: 'view-orders', title: 'Мои заказы' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    })
  }

  async notifyReminder(event: any, minutesBefore: number): Promise<void> {
    await this.showNotification({
      title: 'Напоминание о событии',
      body: `${event.title} начинается через ${minutesBefore} минут`,
      tag: 'event-reminder',
      data: { eventId: event.id, type: 'event-reminder' },
      actions: [
        { action: 'view-event', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    })
  }

  async notifyVendorNewOrder(order: any): Promise<void> {
    await this.showNotification({
      title: 'Новый заказ!',
      body: `Заказ #${order.id} на сумму ${order.total} ₽`,
      tag: 'vendor-new-order',
      data: { orderId: order.id, type: 'vendor-new-order' },
      actions: [
        { action: 'view-orders', title: 'Управление заказами' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    })
  }

  async notifyVendorNewMessage(message: any): Promise<void> {
    await this.showNotification({
      title: 'Новое сообщение',
      body: `От ${message.sender?.name || 'Клиента'}: ${message.content.substring(0, 50)}...`,
      tag: 'vendor-message',
      data: { messageId: message.id, type: 'vendor-message' },
      actions: [
        { action: 'view-messages', title: 'Сообщения' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  private async sendUnsubscriptionToServer(): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('Failed to send unsubscription to server:', error)
    }
  }
}

// Hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSupport = async () => {
      const manager = PushNotificationManager.getInstance()
      const supported = await manager.initialize()
      setIsSupported(supported)

      if (supported) {
        setPermission(Notification.permission)
        const subscribed = await manager.isSubscribed()
        setIsSubscribed(subscribed)
      }
    }

    checkSupport()
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false

    setIsLoading(true)
    try {
      const manager = PushNotificationManager.getInstance()
      const newPermission = await manager.requestPermission()
      setPermission(newPermission)
      return newPermission === 'granted'
    } catch (error) {
      console.error('Failed to request permission:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') return false

    setIsLoading(true)
    try {
      const manager = PushNotificationManager.getInstance()
      const subscription = await manager.subscribe()
      setIsSubscribed(subscription !== null)
      return subscription !== null
    } catch (error) {
      console.error('Failed to subscribe:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) return false

    setIsLoading(true)
    try {
      const manager = PushNotificationManager.getInstance()
      const result = await manager.unsubscribe()
      setIsSubscribed(!result)
      return result
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe
  }
}
