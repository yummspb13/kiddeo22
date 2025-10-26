'use client'

import { useState } from 'react'
import AfishaMapView from './AfishaMapView'
import YandexMapStats from './YandexMapStats'

interface EventsMapProps {
  events: unknown[]
}

export default function EventsMap({ events }: EventsMapProps) {
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Координаты центра Москвы
  const cityCenter = { lat: 55.7558, lng: 37.6176 }
  const cityName = 'Москва'

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 relative">
      {mapError ? (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center p-6">
            <div className="text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Карта недоступна</h3>
            <p className="text-gray-500 mb-4">{mapError}</p>
            <button 
              onClick={() => setMapError(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      ) : (
        <>
          <AfishaMapView
            events={events as any}
            cityCenter={cityCenter}
            cityName={cityName}
            onError={setMapError}
          />

          {/* Статистика карты */}
          <YandexMapStats events={events as any} />
        </>
      )}
    </div>
  )
}
