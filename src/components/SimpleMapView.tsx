'use client'

import { useEffect, useRef, useState } from 'react'

// Типы для Yandex Maps
interface YandexMap {
  setCenter: (center: [number, number], zoom?: number) => void
  destroy: () => void
}

interface YandexPlacemark {
  properties: {
    set: (key: string, value: unknown) => void
  }
  geometry: {
    setCoordinates: (coords: [number, number]) => void
  }
}

interface YandexMaps {
  ready: (callback: () => void) => void
  Map: new (element: string | HTMLElement, options?: Record<string, unknown>) => YandexMap
  Placemark: new (coords: [number, number], properties?: Record<string, unknown>, options?: Record<string, unknown>) => YandexPlacemark
}

declare global {
  interface Window {
    ymaps: YandexMaps
  }
}

interface Event {
  id: string
  coordinates?: string
  title?: string
  venue?: string
  startDate?: string
}

interface SimpleMapViewProps {
  events: Event[]
  cityCenter: { lat: number; lng: number }
  cityName: string
}

export default function SimpleMapView({ events, cityCenter }: SimpleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Парсим координаты событий
  const eventMarkers = events
    .filter((event: Event) => event.coordinates)
    .map((event: Event) => {
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
      } catch {
        console.warn('Invalid coordinates for event:', event.id, event.coordinates)
      }
      return null
    })
    .filter(marker => marker !== null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const loadMap = () => {
      if (window.ymaps) {
        initMap()
        return
      }

      // Проверяем, есть ли уже скрипт
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]')
      if (existingScript) {
        existingScript.addEventListener('load', initMap)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
      script.async = true
      script.onload = initMap
      script.onerror = () => {
        setError('Ошибка загрузки карты')
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!window.ymaps || !mapRef.current) return

      try {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [cityCenter.lat, cityCenter.lng],
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl']
        })

        // Добавляем маркеры
        eventMarkers.forEach(marker => {
          if (marker) {
            const placemark = new window.ymaps.Placemark([marker.lat, marker.lng], {
              balloonContent: `
                <div style="font-family: Arial, sans-serif; max-width: 300px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px;">${marker.event.title}</h3>
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${marker.event.venue || ''}</p>
                  <p style="margin: 0; font-size: 12px; color: #888;">
                    ${new Date(marker.event.startDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              `
            })
            map.geoObjects.add(placemark)
          }
        })

        setIsMapLoaded(true)
        console.log('Map initialized successfully with', eventMarkers.length, 'markers')
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Ошибка инициализации карты')
      }
    }

    loadMap()
  }, [cityCenter.lat, cityCenter.lng, eventMarkers.length, events])

  return (
    <div className="relative overflow-hidden">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden"
        style={{ minHeight: '600px' }}
      >
        {!isMapLoaded && !error && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Загрузка карты...</div>
          </div>
        )}
        {error && (
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
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
