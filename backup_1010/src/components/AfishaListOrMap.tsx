'use client'

import { useState, useEffect } from 'react'
import { List, Map } from 'lucide-react'

interface AfishaListOrMapProps {
  children: React.ReactNode
  mapComponent: React.ReactNode
  defaultView?: 'list' | 'map'
}

export default function AfishaListOrMap({ 
  children, 
  mapComponent, 
  defaultView = 'list' 
}: AfishaListOrMapProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>(defaultView)

  // Синхронизация с URL параметрами
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const viewParam = urlParams.get('view')
    
    if (viewParam === 'map' || viewParam === 'list') {
      setViewMode(viewParam)
    }
  }, [])

  // Обновление URL при смене режима
  const handleViewChange = (newView: 'list' | 'map') => {
    setViewMode(newView)
    
    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href)
    if (newView === 'list') {
      url.searchParams.delete('view')
    } else {
      url.searchParams.set('view', 'map')
    }
    
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <div className="space-y-4">
      {/* Переключатель режимов */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Режим просмотра:</span>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewChange('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            Список
          </button>
          
          <button
            onClick={() => handleViewChange('map')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="w-4 h-4" />
            Карта
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="min-h-[400px]">
        {viewMode === 'list' ? children : mapComponent}
      </div>
    </div>
  )
}
