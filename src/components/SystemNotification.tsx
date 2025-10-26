'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, RefreshCw } from 'lucide-react'

interface SystemNotificationProps {
  isVisible: boolean
  onClose: () => void
  onRetry?: () => void
}

export default function SystemNotification({ 
  isVisible, 
  onClose, 
  onRetry 
}: SystemNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`
        bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-xl
        transform transition-all duration-300 ease-out
        ${isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Сервер перегружен
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Сейчас много пользователей на сайте. Ваш запрос обрабатывается дольше обычного.
              </p>
              
              <div className="flex space-x-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Попробовать снова
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-red-200 rounded-b-xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
