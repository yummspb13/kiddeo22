'use client'

import { useSessionManager } from '@/utils/sessionManager'
import { useState, useEffect } from 'react'

/**
 * Простой компонент для тестирования управления сессиями
 */
export function SessionTest() {
  const sessionManager = useSessionManager()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentUserId = sessionManager.getCurrentUserId()
  const sessionId = sessionManager.getSessionId()

  const handleTestSession = async () => {
    console.log('🧪 Testing session management...')
    await sessionManager.initializeSession('test-user-123')
    console.log('✅ Session initialized')
  }

  const handleClearData = async () => {
    console.log('🧹 Clearing all data...')
    await sessionManager.clearAllData()
    console.log('✅ Data cleared')
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">🧪 Session Test</div>
      <div>Current User: {currentUserId || 'None'}</div>
      <div>Session ID: {sessionId ? sessionId.substring(0, 15) + '...' : 'None'}</div>
      <div className="mt-2 space-y-1">
        <button 
          onClick={handleTestSession}
          className="block w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        >
          Test Session
        </button>
        <button 
          onClick={handleClearData}
          className="block w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
        >
          Clear Data
        </button>
      </div>
    </div>
  )
}
