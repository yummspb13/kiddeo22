'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

export default function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed before
    const dismissedBefore = localStorage.getItem('pwa-install-dismissed')
    if (dismissedBefore) {
      setDismissed(true)
      return
    }

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setDeviceType(isMobile ? 'mobile' : 'desktop')

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      onInstall?.()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        onInstall?.()
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
    onDismiss?.()
  }

  const handleManualInstall = () => {
    // Show manual install instructions
    setShowPrompt(false)
    // You could show a modal with instructions here
  }

  if (isInstalled || dismissed || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-[90px] left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[1002]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Установить приложение
              </h3>
              <p className="text-xs text-gray-500">
                Быстрый доступ к Kiddeo
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {deviceType === 'mobile' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Добавьте Kiddeo на главный экран для быстрого доступа
            </p>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Smartphone className="w-4 h-4" />
              <span>Нажмите "Поделиться" → "На экран «Домой»"</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Установить
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Позже
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Установите Kiddeo как приложение для лучшего опыта
            </p>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Monitor className="w-4 h-4" />
              <span>Нажмите на иконку установки в адресной строке</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Установить
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Позже
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for PWA install prompt
export function usePWAInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error installing PWA:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    install
  }
}
