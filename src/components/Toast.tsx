"use client"

import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, MessageCircle, User } from 'lucide-react'
import { Toast as ToastType, useToast } from '@/contexts/ToastContext'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className={`
        relative max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 mb-3
        ${getTypeStyles()}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              {toast.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              {toast.message}
            </p>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleRemove}
              className="inline-flex text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-20 right-4 z-[99999] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Специальные компоненты для разных типов уведомлений
export function ChatNotification({ sender, message, onClick }: { sender: string, message: string, onClick?: () => void }) {
  const { addToast } = useToast()

  const showNotification = () => {
    addToast({
      type: 'info',
      title: `Вам прислали сообщение в чат`,
      message: `${sender}: ${message}`,
      duration: 8000,
      action: onClick ? {
        label: 'Открыть чат',
        onClick
      } : undefined
    })
  }

  return null // Этот компонент только для программного вызова
}

export function ReviewResponseNotification({ venue, message, onClick }: { venue: string, message: string, onClick?: () => void }) {
  const { addToast } = useToast()

  const showNotification = () => {
    addToast({
      type: 'success',
      title: `Вам ответил "${venue}"`,
      message: message,
      duration: 8000,
      action: onClick ? {
        label: 'Посмотреть ответ',
        onClick
      } : undefined
    })
  }

  return null // Этот компонент только для программного вызова
}
