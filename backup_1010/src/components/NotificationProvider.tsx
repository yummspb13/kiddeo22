'use client'

import { useNotifications } from '@/hooks/useNotifications'
import NotificationToast from './NotificationToast'

export default function NotificationProvider() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <NotificationToast
      notifications={notifications}
      onRemove={removeNotification}
    />
  )
}
