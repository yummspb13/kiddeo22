'use client'

import AfishaMapView from './AfishaMapView'
import YandexMapStats from './YandexMapStats'

interface EventsMapProps {
  events: unknown[]
}

export default function EventsMap({ events }: EventsMapProps) {
  // Координаты центра Москвы
  const cityCenter = { lat: 55.7558, lng: 37.6176 }
  const cityName = 'Москва'

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 relative">
      <AfishaMapView
        events={events as any}
        cityCenter={cityCenter}
        cityName={cityName}
      />

      {/* Статистика карты */}
      <YandexMapStats events={events as any} />
    </div>
  )
}
