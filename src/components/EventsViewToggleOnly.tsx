'use client'

import { useEventsView } from '@/contexts/EventsViewContext'

export default function EventsViewToggleOnly() {
  const { view, setView } = useEventsView()

  const handleViewChange = (newView: 'grid' | 'map') => {
    setView(newView)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Вид:</span>
      <div className="flex gap-1">
        <button 
          onClick={() => handleViewChange('grid')}
          className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center h-[37.5px] ${
            view === 'grid' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Сетка"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button 
          onClick={() => handleViewChange('map')}
          className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center h-[37.5px] ${
            view === 'map' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Карта"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
