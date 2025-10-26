'use client'

interface StaticMapViewProps {
  events: unknown[]
  cityCenter: { lat: number; lng: number }
  cityName: string
}

export default function StaticMapView({ events, cityCenter, cityName }: StaticMapViewProps) {
  // Парсим координаты событий
  const eventMarkers = events
    .filter(event => event.coordinates)
    .map(event => {
      try {
        const raw = event.coordinates.trim()
        if (raw.startsWith('{') || raw.startsWith('[')) {
          const coords = JSON.parse(raw)
          if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
            return { id: event.id, lat: coords.lat, lng: coords.lng, event }
          }
        } else {
          const parts = raw.split(',').map(p => Number(p.trim()))
          if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
            return { id: event.id, lat: parts[0], lng: parts[1], event }
          }
        }
      } catch (e) {
        console.warn('Invalid coordinates for event:', event.id, event.coordinates)
      }
      return null
    })
    .filter(marker => marker !== null)

  return (
    <div className="relative overflow-hidden">
      {/* Статическая карта с маркерами */}
      <div className="w-full h-[600px] rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden relative" style={{ minHeight: '600px' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <div className="text-lg font-semibold mb-2">Карта мероприятий</div>
          <div className="text-sm text-gray-600 mb-4">
            {cityName} • {eventMarkers.length} событий
          </div>
          
          {/* Список событий */}
          <div className="max-h-96 overflow-y-auto space-y-2 text-left">
            {eventMarkers.map(marker => (
              <div key={marker.id} className="bg-white p-3 rounded-lg shadow-sm border">
                <div className="font-medium text-sm">{marker.event.title}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {marker.event.venue && <div>📍 {marker.event.venue}</div>}
                  <div>📅 {new Date(marker.event.startDate).toLocaleDateString('ru-RU')}</div>
                  <div>🕐 {new Date(marker.event.startDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                  {marker.event.endDate && (
                    <div>🕐 {new Date(marker.event.endDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                  )}
                </div>
                <div className="mt-2">
                  <a 
                    href={`/event/${marker.event.slug || marker.event.id}`}
                    className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Подробнее
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {eventMarkers.length === 0 && (
            <div className="text-gray-500 text-sm">
              События с координатами не найдены
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Найдено событий на карте: {eventMarkers.length} из {events.length}
        {eventMarkers.length < events.length && (
          <span className="text-orange-600 ml-1">
            (некоторые события не имеют координат)
          </span>
        )}
      </div>
    </div>
  )
}
