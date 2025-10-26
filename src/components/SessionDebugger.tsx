'use client'

import { useSessionManager } from '@/utils/sessionManager'
import { useState, useEffect } from 'react'

/**
 * Компонент для отладки сессий (только в режиме разработки)
 */
export function SessionDebugger() {
  const sessionManager = useSessionManager()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Показываем только в режиме разработки и после монтирования
  if (process.env.NODE_ENV !== 'development' || !mounted) {
    return null
  }

  const currentUserId = sessionManager.getCurrentUserId()
  const sessionId = sessionManager.getSessionId()

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">🔍 Session Debug</div>
      <div>Current User: {currentUserId || 'None'}</div>
      <div>Session ID: {sessionId ? sessionId.substring(0, 20) + '...' : 'None'}</div>
      <button 
        onClick={() => sessionManager.clearAllData()}
        className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
      >
        Clear All Data
      </button>
    </div>
  )
}
