'use client'

import { useEffect, useRef, useState } from 'react'

// Типы для Leaflet
interface LeafletMap {
  setView: (center: [number, number], zoom: number) => void
  addLayer: (layer: any) => void
  remove: () => void
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker
  bindPopup: (content: string) => LeafletMarker
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer
}

interface LeafletIcon {
  icon: (options: any) => any
}

interface Leaflet {
  map: (element: string | HTMLElement, options?: any) => LeafletMap
  tileLayer: (urlTemplate: string, options?: any) => LeafletTileLayer
  marker: (latlng: [number, number], options?: any) => LeafletMarker
  icon: LeafletIcon
}

declare global {
  interface Window {
    L: Leaflet
  }
}

interface Event {
  id: string
  coordinates?: string
  title?: string
  venue?: string
  startDate?: string
}

interface LeafletMapViewProps {
  events: Event[]
  cityCenter: { lat: number; lng: number }
  cityName: string
}

export default function LeafletMapView({ events, cityCenter, cityName }: LeafletMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
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
      } catch (e) {
        console.warn('Invalid coordinates for event:', event.id, event.coordinates)
      }
      return null
    })
    .filter(marker => marker !== null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const loadLeaflet = () => {
      if (window.L) {
        initMap()
        return
      }

      // Загружаем CSS
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      css.crossOrigin = ''
      document.head.appendChild(css)

      // Загружаем JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = initMap
      script.onerror = () => {
        setError('Ошибка загрузки карты')
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      if (!window.L || !mapRef.current) return

      try {
        // Создаем карту
        const map = window.L.map(mapRef.current).setView([cityCenter.lat, cityCenter.lng], 12)

        // Добавляем слой OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Добавляем маркеры
        eventMarkers.forEach(marker => {
          if (marker) {
            const popup = window.L.popup({
              maxWidth: 300
            }).setContent(`
              <div style="font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">${marker.event.title}</h3>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${marker.event.venue || ''}</p>
                <p style="margin: 0; font-size: 12px; color: #888;">
                  ${new Date(marker.event.startDate).toLocaleDateString('ru-RU')}
                </p>
              </div>
            `)

            window.L.marker([marker.lat, marker.lng])
              .addTo(map)
              .bindPopup(popup)
          }
        })

        mapInstanceRef.current = map
        setIsMapLoaded(true)
        console.log('Leaflet map initialized successfully with', eventMarkers.length, 'markers')
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Ошибка инициализации карты')
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [cityCenter.lat, cityCenter.lng, eventMarkers.length])

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
