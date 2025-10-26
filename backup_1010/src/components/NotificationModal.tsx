"use client"

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, X } from 'lucide-react'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  duration = 3000
}: NotificationModalProps) {
  useEffect(() => {
    console.log('[NOTIFICATION] Modal state changed:', { isOpen, title, message, type })
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        console.log('[NOTIFICATION] Auto-closing modal after', duration, 'ms')
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose, title, message, type])

  console.log('[NOTIFICATION] Rendering modal:', { isOpen, title, message, type })
  
  if (!isOpen) {
    console.log('[NOTIFICATION] Modal not open, returning null')
    return null
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <X className="w-8 h-8 text-red-500" />
      case 'warning':
        return <X className="w-8 h-8 text-yellow-500" />
      case 'info':
        return <CheckCircle className="w-8 h-8 text-blue-500" />
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
      default:
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border-2 max-w-md w-full mx-4 animate-fade-in-up">
        <div className={`p-6 rounded-t-2xl ${getBackgroundColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 animate-progress-bar"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  )

  // Рендерим в portal для правильного z-index
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return null
}
