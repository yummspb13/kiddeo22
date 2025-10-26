'use client'

import { useEffect, useRef, useState } from 'react'

interface VenueMapProps {
  lat: number
  lng: number
  venueName: string
  address?: string
  className?: string
}

export default function VenueMap({ 
  lat, 
  lng, 
  venueName, 
  address,
  className = "h-96" 
}: VenueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return

    const initMap = async () => {
      try {
        // Проверяем, загружена ли Яндекс.Карты API
        if (typeof window === 'undefined' || !window.ymaps) {
          console.log('🔄 Loading Yandex Maps API...')
          
          // Загружаем скрипт Яндекс.Карт
          const script = document.createElement('script')
          script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
          script.async = true
          
          script.onload = () => {
            console.log('✅ Yandex Maps API loaded')
            createMap()
          }
          
          script.onerror = () => {
            console.error('❌ Failed to load Yandex Maps API')
            setMapError('Не удалось загрузить карту')
          }
          
          document.head.appendChild(script)
        } else {
          createMap()
        }
      } catch (error) {
        console.error('❌ Map initialization error:', error)
        setMapError('Ошибка инициализации карты')
      }
    }

    const createMap = () => {
      try {
        if (!window.ymaps) {
          throw new Error('Yandex Maps API not available')
        }

        window.ymaps.ready(() => {
          console.log('🗺️ Creating venue map for:', venueName)
          
          const mapInstance = new window.ymaps.Map(mapRef.current, {
            center: [lat, lng],
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
          })

          // Создаем кастомный маркер
          const marker = new window.ymaps.Placemark(
            [lat, lng],
            {
              balloonContent: `
                <div style="padding: 10px; max-width: 300px;">
                  <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: bold;">
                    ${venueName}
                  </h3>
                  ${address ? `<p style="margin: 0; color: #666; font-size: 14px;">${address}</p>` : ''}
                </div>
              `,
              hintContent: venueName
            },
            {
              iconLayout: 'default#image',
              iconImageHref: '/icons/marker-pin.svg',
              iconImageSize: [40, 56],
              iconImageOffset: [-20, -56],
              hasBalloon: true,
              openBalloonOnClick: true,
              zIndex: 7000,
              zIndexHover: 8000,
              cursor: 'pointer'
            }
          )

          mapInstance.geoObjects.add(marker)
          setMap(mapInstance)
          setIsMapLoaded(true)
          
          console.log('✅ Venue map created successfully')
        })
      } catch (error) {
        console.error('❌ Map creation error:', error)
        setMapError('Ошибка создания карты')
      }
    }

    initMap()

    // Очистка при размонтировании
    return () => {
      if (map) {
        try {
          map.destroy()
        } catch (e) {
          console.warn('Could not destroy map:', e)
        }
      }
    }
  }, [lat, lng, venueName, address])

  if (mapError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200`}>
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative`}>
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`${className} rounded-lg border border-gray-200`}
        style={{ minHeight: '384px' }}
      />
    </div>
  )
}
