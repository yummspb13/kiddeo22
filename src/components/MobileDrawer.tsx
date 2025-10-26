'use client'

import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { useSwipe } from '@/hooks/useSwipe'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  position?: 'left' | 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  swipeToClose?: boolean
  className?: string
}

export default function MobileDrawer({
  isOpen,
  onClose,
  children,
  title,
  showBackButton = false,
  onBack,
  position = 'right',
  size = 'md',
  swipeToClose = true,
  className = ''
}: MobileDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Swipe to close functionality
  const { elementRef: swipeRef } = useSwipe({
    onSwipeLeft: position === 'right' ? onClose : undefined,
    onSwipeRight: position === 'left' ? onClose : undefined,
    onSwipeDown: position === 'bottom' ? onClose : undefined,
    threshold: 50,
    velocityThreshold: 0.3,
    preventDefault: true
  })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Combine refs
  useEffect(() => {
    if (drawerRef.current && swipeToClose) {
      swipeRef.current = drawerRef.current
    }
  }, [swipeToClose])

  if (!isOpen) return null

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return position === 'bottom' ? 'h-1/3' : 'w-80'
      case 'md':
        return position === 'bottom' ? 'h-1/2' : 'w-96'
      case 'lg':
        return position === 'bottom' ? 'h-3/4' : 'w-[28rem]'
      case 'full':
        return position === 'bottom' ? 'h-full' : 'w-full'
      default:
        return position === 'bottom' ? 'h-1/2' : 'w-96'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full'
      case 'right':
        return 'right-0 top-0 h-full'
      case 'bottom':
        return 'left-0 right-0'
      default:
        return 'right-0 top-0 h-full'
    }
  }

  const getAnimationClasses = () => {
    if (!isAnimating) return ''
    
    switch (position) {
      case 'left':
        return isOpen ? 'translate-x-0' : '-translate-x-full'
      case 'right':
        return isOpen ? 'translate-x-0' : 'translate-x-full'
      case 'bottom':
        return isOpen ? 'translate-y-0' : 'translate-y-full'
      default:
        return isOpen ? 'translate-x-0' : 'translate-x-full'
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`
          absolute inset-0 bg-black transition-opacity duration-300
          ${isOpen ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          absolute bg-white shadow-2xl transition-transform duration-300 ease-in-out
          ${getPositionClasses()}
          ${getSizeClasses()}
          ${getAnimationClasses()}
          ${position === 'bottom' ? 'safe-area-bottom' : ''}
          ${className}
        `}
        style={{ 
          zIndex: 100000,
          maxHeight: position === 'right' ? '100vh' : undefined,
          overflowY: position === 'right' ? 'hidden' : undefined
        }}
      >
        {/* Header */}
        {(title || showBackButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <button
                  onClick={onBack || onClose}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Hook for drawer state management
export function useMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [drawerStack, setDrawerStack] = useState<string[]>([])

  const openDrawer = (drawerId?: string) => {
    setIsOpen(true)
    if (drawerId) {
      setDrawerStack(prev => [...prev, drawerId])
    }
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setDrawerStack([])
  }

  const goBack = () => {
    if (drawerStack.length > 1) {
      setDrawerStack(prev => prev.slice(0, -1))
    } else {
      closeDrawer()
    }
  }

  const currentDrawer = drawerStack[drawerStack.length - 1]

  return {
    isOpen,
    openDrawer,
    closeDrawer,
    goBack,
    currentDrawer,
    canGoBack: drawerStack.length > 1
  }
}

// Specialized drawer for filters
export function FilterDrawer({
  isOpen,
  onClose,
  children,
  title = 'Фильтры',
  onApply,
  onReset,
  hasActiveFilters = false
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  onApply?: () => void
  onReset?: () => void
  hasActiveFilters?: boolean
}) {
  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      position="bottom"
      size="lg"
      className="rounded-t-2xl"
    >
      <div className="flex flex-col h-full">
        {/* Filter content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {children}
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {onReset && (
              <button
                onClick={onReset}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Сбросить
              </button>
            )}
            {onApply && (
              <button
                onClick={onApply}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                  hasActiveFilters 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!hasActiveFilters}
              >
                Применить
              </button>
            )}
          </div>
        </div>
      </div>
    </MobileDrawer>
  )
}
