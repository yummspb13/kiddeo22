'use client'

import { useState, useEffect } from 'react'
import { List, Map } from 'lucide-react'

interface VenueListOrMapProps {
  children: React.ReactNode
  mapComponent: React.ReactNode
  defaultView?: 'list' | 'map'
}

export default function VenueListOrMap({ 
  children, 
  mapComponent, 
  defaultView = 'list' 
}: VenueListOrMapProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>(defaultView)

  useEffect(() => {
    // Читаем режим из URL параметров
    const urlParams = new URLSearchParams(window.location.search)
    const view = urlParams.get('view') as 'list' | 'map' | null
    if (view && (view === 'list' || view === 'map')) {
      setViewMode(view)
    }
  }, [])

  const handleViewChange = (newView: 'list' | 'map') => {
    setViewMode(newView)
    
    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href)
    url.searchParams.set('view', newView)
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
