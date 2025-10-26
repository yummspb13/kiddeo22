'use client'

import { useSessionManager } from '@/utils/sessionManager'
import { useState, useEffect } from 'react'

/**
 * Компонент для тестирования синхронизации между вкладками
 */
export function TabSyncTest() {
  const sessionManager = useSessionManager()
  const [mounted, setMounted] = useState(false)
  const [testUserId, setTestUserId] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentUserId = sessionManager.getCurrentUserId()
  const sessionId = sessionManager.getSessionId()

  const handleTestLogin = async () => {
    const userId = testUserId || `test-user-${Date.now()}`
    console.log('🧪 Testing login with user:', userId)
    await sessionManager.initializeSession(userId)
    setTestUserId('')
  }

  const handleTestLogout = async () => {
    console.log('🧪 Testing logout')
    await sessionManager.clearAllData()
  }

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank')
  }

  return (
    <div className="fixed bottom-4 left-4 bg-purple-600 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">🔄 Tab Sync Test</div>
      <div>Current User: {currentUserId || 'None'}</div>
      <div>Session ID: {sessionId ? sessionId.substring(0, 15) + '...' : 'None'}</div>
      
      <div className="mt-2 space-y-1">
        <input
          type="text"
          placeholder="User ID (optional)"
          value={testUserId}
          onChange={(e) => setTestUserId(e.target.value)}
          className="w-full px-2 py-1 text-black text-xs rounded"
        />
        <button 
          onClick={handleTestLogin}
          className="block w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        >
          Test Login
        </button>
        <button 
          onClick={handleTestLogout}
          className="block w-full px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
        >
          Test Logout
        </button>
        <button 
          onClick={handleOpenNewTab}
          className="block w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Open New Tab
        </button>
      </div>
    </div>
  )
}
