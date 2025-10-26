'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  category: string
  message: string
  data?: any
  duration?: number
}

export default function LoggerPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<{
    category?: string
    level?: string
  }>({})

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const updateLogs = () => {
      const allLogs = logger.getLogs(filter.category, filter.level as any)
      setLogs(allLogs.slice(-50)) // Показываем последние 50 логов
    }

    updateLogs()
    const interval = setInterval(updateLogs, 1000)

    return () => clearInterval(interval)
  }, [filter])

  if (process.env.NODE_ENV !== 'development') return null

  const stats = logger.getStats()

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500'
      case 'warn': return 'text-yellow-500'
      case 'info': return 'text-blue-500'
      case 'debug': return 'text-gray-500'
      default: return 'text-gray-700'
    }
  }

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      case 'debug': return '🐛'
      default: return '📝'
    }
  }

  return (
    <>
      {/* Кнопка для открытия панели */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg z-50 hover:bg-gray-700 transition-colors"
        title="Logger Panel"
      >
        📊 {stats.total}
      </button>

      {/* Панель логов */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Заголовок */}
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Logger Panel</h3>
            <div className="flex gap-2">
              <button
                onClick={() => logger.clear()}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                ×
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="p-2 bg-gray-50 text-xs">
            <div className="flex gap-4">
              <span>Total: {stats.total}</span>
              <span className="text-red-500">Errors: {stats.errors}</span>
              <span className="text-yellow-500">Warnings: {stats.warnings}</span>
            </div>
          </div>

          {/* Фильтры */}
          <div className="p-2 border-b border-gray-200">
            <div className="flex gap-2 text-xs">
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
                className="border border-gray-300 rounded px-1 py-1"
              >
                <option value="">All Categories</option>
                <option value="API">API</option>
                <option value="ReactQuery">ReactQuery</option>
                <option value="Auth">Auth</option>
                <option value="Favorites">Favorites</option>
                <option value="Performance">Performance</option>
              </select>
              <select
                value={filter.level || ''}
                onChange={(e) => setFilter({ ...filter, level: e.target.value || undefined })}
                className="border border-gray-300 rounded px-1 py-1"
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>

          {/* Логи */}
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No logs</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 p-1 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-1">
                    <span>{getLevelEmoji(log.level)}</span>
                    <span className={`font-semibold ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-600">[{log.category}]</span>
                    {log.duration && (
                      <span className="text-blue-500">({log.duration}ms)</span>
                    )}
                  </div>
                  <div className="text-gray-800 ml-4">{log.message}</div>
                  {log.data && (
                    <div className="text-gray-600 ml-4 text-xs">
                      {JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                  <div className="text-gray-400 ml-4 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
